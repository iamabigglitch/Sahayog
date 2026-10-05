import { Fragment, useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api, errorMessage } from "../../lib/api";
import ConfirmDialog from "../../components/ConfirmDialog";

interface City {
  id: string;
  name: string;
}

interface Hospital {
  id: string;
  name: string;
  city_id: string;
}

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

// Dates from the API are plain "YYYY-MM-DD"; build them in local time to avoid a day shift.
function formatDay(value: string): string {
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

type CampStatus = "upcoming" | "ongoing" | "completed" | "cancelled";
type RsvpStatus = "registered" | "attended" | "cancelled";

interface AdminCamp {
  id: string;
  title: string;
  description: string | null;
  venue: string;
  camp_date: string;
  start_time: string;
  end_time: string;
  status: CampStatus;
  city_id: string;
  hospital_id: string | null;
  organizer_name: string;
  organizer_type: string;
  city?: { id: string; name: string } | null;
}

interface AdminRsvp {
  id: string;
  status: RsvpStatus;
  donor?: { blood_group: string; user?: { phone: string } | null } | null;
}

const CAMP_STATUSES: CampStatus[] = ["upcoming", "ongoing", "completed", "cancelled"];
const RSVP_STATUSES: RsvpStatus[] = ["registered", "attended", "cancelled"];
const ORGANIZER_TYPES = ["hospital", "college", "ngo", "company", "community", "government", "other"];

function todayLocal(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export default function Camps() {
  const [camps, setCamps] = useState<AdminCamp[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<AdminCamp | "new" | null>(null);
  const [attendanceId, setAttendanceId] = useState("");
  const [busyId, setBusyId] = useState("");
  const [pendingCancel, setPendingCancel] = useState<AdminCamp | null>(null);

  const loadCamps = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/donation-camps");
      setCamps(data.camps ?? []);
    } catch (err) {
      setError(errorMessage(err, "Could not load camps."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCamps();
    api.get("/cities").then(({ data }) => setCities(data.cities ?? [])).catch(() => {});
    api.get("/hospitals").then(({ data }) => setHospitals(data.hospitals ?? [])).catch(() => {});
  }, [loadCamps]);

  const applyStatus = async (camp: AdminCamp, status: CampStatus) => {
    setBusyId(camp.id);
    setError("");
    try {
      await api.patch(`/admin/donation-camps/${camp.id}/status`, { status });
      await loadCamps();
    } catch (err) {
      setError(errorMessage(err, "Could not change the camp status."));
    } finally {
      setBusyId("");
      setPendingCancel(null);
    }
  };

  // Cancelling asks first; every other status changes straight away
  const changeStatus = (camp: AdminCamp, status: CampStatus) => {
    if (status === "cancelled") {
      setPendingCancel(camp);
    } else {
      applyStatus(camp, status);
    }
  };

  const today = todayLocal();

  return (
    <>
      <h1>Camps</h1>

      {editing ? (
        <CampForm
          camp={editing === "new" ? null : editing}
          cities={cities}
          hospitals={hospitals}
          onCancel={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            loadCamps();
          }}
        />
      ) : (
        <div className="admin-toolbar">
          <button type="button" className="admin-button" onClick={() => setEditing("new")}>
            New camp
          </button>
        </div>
      )}

      {error && <p className="admin-message admin-error" role="alert">{error}</p>}
      {loading && <p className="admin-message">Loading camps…</p>}
      {!loading && !error && camps.length === 0 && (
        <p className="admin-message">No camps yet. Create the first one above.</p>
      )}

      {camps.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Camp</th>
                <th scope="col">Date</th>
                <th scope="col">City</th>
                <th scope="col">Status</th>
                <th scope="col"><span className="admin-sr">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {camps.map((camp) => {
                const overdue =
                  camp.camp_date.slice(0, 10) < today && (camp.status === "upcoming" || camp.status === "ongoing");

                return (
                  <Fragment key={camp.id}>
                    <tr>
                      <td>
                        <strong>{camp.title}</strong>
                        <div className="admin-muted">{camp.venue}</div>
                      </td>
                      <td>
                        {formatDay(camp.camp_date)}
                        {overdue && <div><span className="admin-badge pending">Date passed</span></div>}
                      </td>
                      <td>{camp.city?.name ?? "Unknown"}</td>
                      <td>
                        <select
                          aria-label={`Status of ${camp.title}`}
                          value={camp.status}
                          disabled={busyId === camp.id}
                          onChange={(e) => changeStatus(camp, e.target.value as CampStatus)}
                        >
                          {CAMP_STATUSES.map((s) => (
                            <option key={s} value={s}>{capitalize(s)}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <div className="admin-actions">
                        <button type="button" className="admin-button admin-button-secondary admin-button-sm" onClick={() => setEditing(camp)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="admin-button admin-button-secondary admin-button-sm"
                          aria-expanded={attendanceId === camp.id}
                          onClick={() => setAttendanceId(attendanceId === camp.id ? "" : camp.id)}
                        >
                          Attendance
                        </button>
                        </div>
                      </td>
                    </tr>

                    {attendanceId === camp.id && (
                      <tr>
                        <td colSpan={5}>
                          <CampAttendance campId={camp.id} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={pendingCancel !== null}
        title="Cancel this camp?"
        message={`"${pendingCancel?.title ?? ""}" will be marked as cancelled and donors will no longer be able to register.`}
        confirmLabel="Cancel camp"
        busy={busyId !== ""}
        onConfirm={() => pendingCancel && applyStatus(pendingCancel, "cancelled")}
        onCancel={() => setPendingCancel(null)}
      />
    </>
  );
}

function CampAttendance({ campId }: { campId: string }) {
  const [rsvps, setRsvps] = useState<AdminRsvp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/admin/donation-camps/${campId}/rsvps`);
      setRsvps(data.rsvps ?? []);
    } catch (err) {
      setError(errorMessage(err, "Could not load registrations."));
    } finally {
      setLoading(false);
    }
  }, [campId]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (rsvp: AdminRsvp, status: RsvpStatus) => {
    setError("");
    try {
      await api.patch(`/admin/rsvps/${rsvp.id}/status`, { status });
      await load();
    } catch (err) {
      setError(errorMessage(err, "Could not update this registration."));
    }
  };

  return (
    <div className="admin-nested">
      {loading && <p className="admin-muted">Loading registrations…</p>}
      {error && <p className="admin-message admin-error" role="alert">{error}</p>}
      {!loading && !error && rsvps.length === 0 && <p className="admin-muted">Nobody has registered yet.</p>}

      {rsvps.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">Phone</th>
              <th scope="col">Blood group</th>
              <th scope="col">Attendance</th>
            </tr>
          </thead>
          <tbody>
            {rsvps.map((rsvp) => (
              <tr key={rsvp.id}>
                <td>{rsvp.donor?.user?.phone ?? "Not available"}</td>
                <td>{rsvp.donor?.blood_group ?? "Unknown"}</td>
                <td>
                  <select
                    aria-label={`Attendance for ${rsvp.donor?.user?.phone ?? "donor"}`}
                    value={rsvp.status}
                    onChange={(e) => setStatus(rsvp, e.target.value as RsvpStatus)}
                  >
                    {RSVP_STATUSES.map((s) => (
                      <option key={s} value={s}>{capitalize(s)}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

interface CampFormProps {
  camp: AdminCamp | null;
  cities: City[];
  hospitals: Hospital[];
  onSaved: () => void;
  onCancel: () => void;
}

function CampForm({ camp, cities, hospitals, onSaved, onCancel }: CampFormProps) {
  const [form, setForm] = useState({
    title: camp?.title ?? "",
    description: camp?.description ?? "",
    venue: camp?.venue ?? "",
    cityId: camp?.city_id ?? "",
    hospitalId: camp?.hospital_id ?? "",
    organizerName: camp?.organizer_name ?? "",
    organizerType: camp?.organizer_type ?? "hospital",
    campDate: camp?.camp_date.slice(0, 10) ?? "",
    startTime: camp?.start_time.slice(0, 5) ?? "",
    endTime: camp?.end_time.slice(0, 5) ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (field: keyof typeof form, value: string) => setForm((f) => ({ ...f, [field]: value }));
  const cityHospitals = hospitals.filter((h) => h.city_id === form.cityId);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const required = [form.title, form.venue, form.cityId, form.organizerName, form.campDate, form.startTime, form.endTime];
    if (required.some((value) => !value.trim())) {
      return setError("Title, venue, city, organiser, date and times are required.");
    }
    if (form.endTime <= form.startTime) {
      return setError("The end time must be after the start time.");
    }

    // The server can set a hospital but not clear one, so an empty choice is simply not sent.
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      venue: form.venue.trim(),
      cityId: form.cityId,
      organizerName: form.organizerName.trim(),
      organizerType: form.organizerType,
      campDate: form.campDate,
      startTime: form.startTime,
      endTime: form.endTime,
      ...(form.hospitalId && { hospitalId: form.hospitalId }),
    };

    setSaving(true);
    try {
      if (camp) {
        await api.patch(`/donation-camps/${camp.id}`, payload);
      } else {
        await api.post("/donation-camps", payload);
      }
      onSaved();
    } catch (err) {
      setError(errorMessage(err, "Could not save the camp."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="admin-panel" aria-labelledby="camp-form-heading">
      <h2 id="camp-form-heading">{camp ? "Edit camp" : "New camp"}</h2>

      <form className="admin-form" onSubmit={submit} noValidate>
        <label className="admin-field wide">
          <span>Title</span>
          <input value={form.title} onChange={(e) => set("title", e.target.value)} />
        </label>

        <label className="admin-field wide">
          <span>Description (optional)</span>
          <textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </label>

        <label className="admin-field">
          <span>City</span>
          <select
            value={form.cityId}
            onChange={(e) => setForm((f) => ({ ...f, cityId: e.target.value, hospitalId: "" }))}
          >
            <option value="">Choose a city</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>

        <label className="admin-field">
          <span>Hospital (optional)</span>
          <select value={form.hospitalId} disabled={!form.cityId} onChange={(e) => set("hospitalId", e.target.value)}>
            <option value="">None</option>
            {cityHospitals.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </label>

        <label className="admin-field wide">
          <span>Venue</span>
          <input value={form.venue} onChange={(e) => set("venue", e.target.value)} />
        </label>

        <label className="admin-field">
          <span>Organiser name</span>
          <input value={form.organizerName} onChange={(e) => set("organizerName", e.target.value)} />
        </label>

        <label className="admin-field">
          <span>Organiser type</span>
          <select value={form.organizerType} onChange={(e) => set("organizerType", e.target.value)}>
            {ORGANIZER_TYPES.map((t) => (
              <option key={t} value={t}>{capitalize(t)}</option>
            ))}
          </select>
        </label>

        <label className="admin-field">
          <span>Date</span>
          <input type="date" value={form.campDate} onChange={(e) => set("campDate", e.target.value)} />
        </label>

        <div className="admin-field-pair">
          <label className="admin-field">
            <span>Start time</span>
            <input type="time" value={form.startTime} onChange={(e) => set("startTime", e.target.value)} />
          </label>
          <label className="admin-field">
            <span>End time</span>
            <input type="time" value={form.endTime} onChange={(e) => set("endTime", e.target.value)} />
          </label>
        </div>

        <div className="admin-actions wide">
          <button type="submit" className="admin-button" disabled={saving}>
            {saving ? "Saving…" : camp ? "Save changes" : "Create camp"}
          </button>
          <button type="button" className="admin-button admin-button-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>

      {error && <p className="admin-message admin-error" role="alert">{error}</p>}
    </section>
  );
}