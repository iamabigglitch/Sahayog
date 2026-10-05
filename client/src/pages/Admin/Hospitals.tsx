import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api, errorMessage } from "../../lib/api";

interface City {
  id: string;
  name: string;
}

interface Hospital {
  id: string;
  name: string;
  city_id: string;
}

type StockStatus = "available" | "low" | "out_of_stock";

interface StockRow {
  blood_group: string;
  units_available: number;
  status: StockStatus;
}

interface EditRow {
  group: string;
  status: StockStatus;
  units: string;
  saved: { status: StockStatus; units: string } | null;
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const STATUS_LABEL: Record<StockStatus, string> = {
  available: "Available",
  low: "Low",
  out_of_stock: "Out of stock",
};

// A row needs saving if it differs from what the server has,
// or if it has never been saved and the admin typed a number.
function isDirty(row: EditRow): boolean {
  if (!row.saved) return row.units !== "";
  return row.status !== row.saved.status || row.units !== row.saved.units;
}

// Mirrors the server rules so mistakes are caught before the request.
function rowProblem(row: EditRow): string {
  const units = Number(row.units);
  if (row.units === "" || !Number.isInteger(units) || units < 0) return "Enter a whole number of units";
  if (row.status === "out_of_stock" && units !== 0) return "Out of stock needs 0 units";
  if (row.status !== "out_of_stock" && units === 0) return "Needs more than 0 units";
  return "";
}

export default function Hospitals() {
  const [cities, setCities] = useState<City[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/cities"), api.get("/hospitals")])
      .then(([citiesRes, hospitalsRes]) => {
        setCities(citiesRes.data.cities ?? []);
        setHospitals(hospitalsRes.data.hospitals ?? []);
      })
      .catch((err) => setLoadError(errorMessage(err, "Could not load cities and hospitals.")));
  }, []);

  if (loadError) {
    return <p className="admin-message admin-error" role="alert">{loadError}</p>;
  }

  return (
    <>
      <h1>Hospitals and blood stock</h1>
      <StockEditor hospitals={hospitals} cities={cities} />
      <AddHospital
        cities={cities}
        onAdded={(hospital) => setHospitals((list) => [...list, hospital])}
      />
    </>
  );
}

function StockEditor({ hospitals, cities }: { hospitals: Hospital[]; cities: City[] }) {
  const [hospitalId, setHospitalId] = useState("");
  const [rows, setRows] = useState<EditRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const cityName = (id: string) => cities.find((c) => c.id === id)?.name;

  const load = async (id: string) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/blood-bank-status/hospital/${id}`);
      const byGroup = new Map<string, StockRow>(
        (data.bloodBankStatuses ?? []).map((r: StockRow) => [r.blood_group, r])
      );

      setRows(
        BLOOD_GROUPS.map((group) => {
          const existing = byGroup.get(group);
          const saved = existing
            ? { status: existing.status, units: String(existing.units_available) }
            : null;
          return { group, status: saved?.status ?? "available", units: saved?.units ?? "", saved };
        })
      );
    } catch (err) {
      setRows([]);
      setError(errorMessage(err, "Could not load this hospital's stock."));
    } finally {
      setLoading(false);
    }
  };

  const selectHospital = (id: string) => {
    setHospitalId(id);
    setNotice("");
    setRows([]);
    if (id) load(id);
  };

  const update = (group: string, patch: Partial<EditRow>) =>
    setRows((list) => list.map((r) => (r.group === group ? { ...r, ...patch } : r)));

  const save = async () => {
    const dirty = rows.filter(isDirty);
    const problems = dirty.filter((r) => rowProblem(r));

    if (dirty.length === 0) return setNotice("Nothing to save.");
    if (problems.length > 0) {
      return setError(problems.map((r) => `${r.group}: ${rowProblem(r)}`).join(". "));
    }

    setSaving(true);
    setError("");
    setNotice("");

    // The API updates one blood group per request.
    const failures: string[] = [];
    for (const row of dirty) {
      try {
        await api.patch("/blood-bank-status", {
          hospitalId,
          bloodGroup: row.group,
          unitsAvailable: Number(row.units),
          status: row.status,
        });
      } catch (err) {
        failures.push(`${row.group}: ${errorMessage(err, "failed")}`);
      }
    }

    await load(hospitalId);
    setSaving(false);
    setNotice(`Saved ${dirty.length - failures.length} of ${dirty.length} blood groups.`);
    if (failures.length > 0) setError(failures.join(". "));
  };

  return (
    <section className="admin-panel" aria-labelledby="stock-heading">
      <h2 id="stock-heading">Update blood stock</h2>

      <label className="admin-field">
        <span>Hospital</span>
        <select value={hospitalId} onChange={(e) => selectHospital(e.target.value)}>
          <option value="">Choose a hospital</option>
          {hospitals.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
              {cityName(h.city_id) ? `, ${cityName(h.city_id)}` : ""}
            </option>
          ))}
        </select>
      </label>

      {hospitals.length === 0 && (
        <p className="admin-message">No hospitals yet. Add one below, then enter its stock here.</p>
      )}

      {loading && <p className="admin-message">Loading stock…</p>}

      {rows.length > 0 && (
        <>
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Blood group</th>
                <th scope="col">Status</th>
                <th scope="col">Units</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.group}>
                  <th scope="row">
                    {row.group}
                    {!row.saved && <span className="admin-muted"> not reported</span>}
                  </th>
                  <td>
                    <select
                      aria-label={`${row.group} status`}
                      value={row.status}
                      onChange={(e) => {
                        const status = e.target.value as StockStatus;
                        update(row.group, { status, ...(status === "out_of_stock" ? { units: "0" } : {}) });
                      }}
                    >
                      {(Object.keys(STATUS_LABEL) as StockStatus[]).map((s) => (
                        <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      aria-label={`${row.group} units`}
                      value={row.units}
                      onChange={(e) => update(row.group, { units: e.target.value })}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button type="button" className="admin-button" disabled={saving} onClick={save}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </>
      )}

      {notice && <p className="admin-message admin-ok" role="status">{notice}</p>}
      {error && <p className="admin-message admin-error" role="alert">{error}</p>}
    </section>
  );
}

function AddHospital({ cities, onAdded }: { cities: City[]; onAdded: (h: Hospital) => void }) {
  const empty = { name: "", cityId: "", address: "", contactPhone: "", latitude: "", longitude: "" };
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const set = (field: keyof typeof empty, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");

    if (!form.name.trim() || !form.cityId || !form.address.trim() || !form.contactPhone.trim()) {
      return setError("Name, city, address and phone are required.");
    }

    setSaving(true);
    try {
      const { data } = await api.post("/hospitals", {
        name: form.name.trim(),
        cityId: form.cityId,
        address: form.address.trim(),
        contactPhone: form.contactPhone.trim(),
        // Coordinates are optional; only send them when filled in.
        ...(form.latitude !== "" && { latitude: Number(form.latitude) }),
        ...(form.longitude !== "" && { longitude: Number(form.longitude) }),
      });

      onAdded(data.hospital);
      setForm(empty);
      setNotice(`${data.hospital.name} added. You can now enter its stock above.`);
    } catch (err) {
      setError(errorMessage(err, "Could not add the hospital."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="admin-panel" aria-labelledby="hospital-heading">
      <h2 id="hospital-heading">Add a hospital</h2>

      <form className="admin-form" onSubmit={submit} noValidate>
        <label className="admin-field">
          <span>Name</span>
          <input value={form.name} onChange={(e) => set("name", e.target.value)} />
        </label>

        <label className="admin-field">
          <span>City</span>
          <select value={form.cityId} onChange={(e) => set("cityId", e.target.value)}>
            <option value="">Choose a city</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>

        <label className="admin-field">
          <span>Address</span>
          <input value={form.address} onChange={(e) => set("address", e.target.value)} />
        </label>

        <label className="admin-field">
          <span>Contact phone</span>
          <input type="tel" value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} />
        </label>

        <label className="admin-field">
          <span>Latitude (optional)</span>
          <input type="number" step="any" value={form.latitude} onChange={(e) => set("latitude", e.target.value)} />
        </label>

        <label className="admin-field">
          <span>Longitude (optional)</span>
          <input type="number" step="any" value={form.longitude} onChange={(e) => set("longitude", e.target.value)} />
        </label>

        <button type="submit" className="admin-button" disabled={saving}>
          {saving ? "Adding…" : "Add hospital"}
        </button>
      </form>

      {notice && <p className="admin-message admin-ok" role="status">{notice}</p>}
      {error && <p className="admin-message admin-error" role="alert">{error}</p>}
    </section>
  );
}