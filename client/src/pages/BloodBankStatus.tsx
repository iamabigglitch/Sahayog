import { useEffect, useMemo, useState } from "react";
import { api, errorMessage } from "../lib/api";

type StockStatus = "available" | "low" | "out_of_stock";

interface StatusRow {
  id: string;
  hospital_id: string;
  blood_group: string;
  units_available: number;
  status: StockStatus;
  last_confirmed: string;
  hospital: {
    id: string;
    name: string;
    address: string;
    contact_phone: string;
    city_id: string;
  } | null;
}

interface City {
  id: string;
  name: string;
}

interface HospitalBoard {
  id: string;
  name: string;
  address: string;
  phone: string;
  cityId: string;
  byGroup: Record<string, StatusRow>;
  lastConfirmed: number;
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const STATUS_LABEL: Record<StockStatus, string> = {
  available: "Available",
  low: "Low",
  out_of_stock: "Out of stock",
};

function timeAgo(timestamp: number): string {
  const minutes = Math.floor((Date.now() - timestamp) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function BloodBankStatus() {
  const [rows, setRows] = useState<StatusRow[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [cityFilter, setCityFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const { data } = await api.get("/blood-bank-status");
        if (!cancelled) setRows(data.bloodBankStatuses ?? []);
      } catch (err) {
        if (!cancelled) {
          setError(errorMessage(err, "Could not load blood bank status. Try again shortly."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }

      // City names are optional: if this fails, the board still works without the filter.
      try {
        const { data } = await api.get("/cities");
        if (!cancelled) setCities(data.cities ?? []);
      } catch {
        /* ignore */
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const boards = useMemo(() => {
    const map = new Map<string, HospitalBoard>();

    for (const row of rows) {
      if (!row.hospital) continue;

      let board = map.get(row.hospital_id);
      if (!board) {
        board = {
          id: row.hospital_id,
          name: row.hospital.name,
          address: row.hospital.address,
          phone: row.hospital.contact_phone,
          cityId: row.hospital.city_id,
          byGroup: {},
          lastConfirmed: 0,
        };
        map.set(row.hospital_id, board);
      }

      board.byGroup[row.blood_group] = row;
      board.lastConfirmed = Math.max(
        board.lastConfirmed,
        new Date(row.last_confirmed).getTime()
      );
    }

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [rows]);

  const cityName = (id: string) => cities.find((c) => c.id === id)?.name;

  const visible = cityFilter ? boards.filter((b) => b.cityId === cityFilter) : boards;

  return (
    <main className="bbs-page">
      <header className="bbs-header">
        <h1>Blood bank status</h1>
        <p>
          Stock as last confirmed by each hospital. This is not live inventory, so call
          ahead before travelling.
        </p>
      </header>

      <div className="bbs-toolbar">
        <ul className="bbs-legend" aria-label="Status key">
          {(Object.keys(STATUS_LABEL) as StockStatus[]).map((s) => (
            <li key={s} className={`bbs-legend-item bbs-${s}`}>
              <span className={`bbs-dot bbs-dot-${s}`} aria-hidden="true" />
              {STATUS_LABEL[s]}
            </li>
          ))}
        </ul>

        {cities.length > 0 && (
          <label className="bbs-filter">
            <span>City</span>
            <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
              <option value="">All cities</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {loading && <p className="bbs-message">Loading blood bank status…</p>}

      {!loading && error && (
        <p className="bbs-message bbs-error" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && boards.length === 0 && (
        <p className="bbs-message">
          No hospital has confirmed its blood stock yet. Check back soon, or{" "}
          <a href="/request-blood">post a blood request</a> and nearby donors will be
          notified.
        </p>
      )}

      {!loading && !error && boards.length > 0 && visible.length === 0 && (
        <p className="bbs-message">No hospitals in this city have confirmed stock yet.</p>
      )}

      <div className="bbs-list">
        {visible.map((board) => (
          <section key={board.id} className="bbs-hospital" aria-labelledby={`h-${board.id}`}>
            <div className="bbs-hospital-head">
              <div>
                <h2 id={`h-${board.id}`}>{board.name}</h2>
                <p className="bbs-meta">
                  {board.address}
                  {cityName(board.cityId) ? `, ${cityName(board.cityId)}` : ""}
                </p>
                <p className="bbs-meta">
                  <a href={`tel:${board.phone}`}>{board.phone}</a>
                </p>
              </div>
              <p className="bbs-confirmed">
                Last confirmed{" "}
                <time dateTime={new Date(board.lastConfirmed).toISOString()}>
                  {timeAgo(board.lastConfirmed)}
                </time>
              </p>
            </div>

            <ul className="bbs-groups">
              {BLOOD_GROUPS.map((group) => {
                const row = board.byGroup[group];

                if (!row) {
                  return (
                    <li key={group} className="bbs-cell bbs-unknown">
                      <span className="bbs-group">{group}</span>
                      <span className="bbs-state">Not reported</span>
                    </li>
                  );
                }

                return (
                  <li
                    key={group}
                    className={`bbs-cell bbs-${row.status}`}
                    title={`Confirmed ${timeAgo(new Date(row.last_confirmed).getTime())}`}
                  >
                    <span className="bbs-group">{group}</span>
                    <span className="bbs-state">
                      <span className={`bbs-dot bbs-dot-${row.status}`} aria-hidden="true" />
                      {STATUS_LABEL[row.status]}
                    </span>
                    {row.status !== "out_of_stock" && (
                      <span className="bbs-units">
                        {row.units_available} unit{row.units_available === 1 ? "" : "s"}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}

export default BloodBankStatus;