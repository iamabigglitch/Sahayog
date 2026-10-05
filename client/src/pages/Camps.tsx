import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, errorMessage } from "../lib/api";
import { useAuth } from "../context/AuthContext";

// Types and helpers
type CampStatus = "upcoming" | "ongoing" | "completed" | "cancelled";
type RsvpStatus = "registered" | "attended" | "cancelled";

interface Camp {
  id: string;
  title: string;
  description: string | null;
  venue: string;
  camp_date: string; // "YYYY-MM-DD"
  start_time: string; // "HH:MM:SS"
  end_time: string;
  status: CampStatus;
  city_id: string;
  organizer_name: string;
  organizer_type: string;
  city?: { id: string; name: string } | null;
}

interface Rsvp {
  id: string;
  camp_id: string;
  status: RsvpStatus;
  registered_at: string;
  camp?: Camp;
}

const CAMP_STATUS_LABEL: Record<CampStatus, string> = {
  upcoming: "Upcoming",
  ongoing: "Ongoing",
  completed: "Completed",
  cancelled: "Cancelled",
};

// camp_date is a plain date, so build it in local time to avoid timezone day-shifts.
function formatDate(value: string): string {
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value: string): string {
  const [h, m] = value.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

// Public list

interface City {
  id: string;
  name: string;
}

function Camps() {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [status, setStatus] = useState<CampStatus | "">("upcoming");
  const [cityId, setCityId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/cities")
      .then(({ data }) => setCities(data.cities ?? []))
      .catch(() => {
        /* city filter is optional */
      });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    api
      .get("/donation-camps", {
        params: { status: status || undefined, cityId: cityId || undefined },
      })
      .then(({ data }) => {
        if (!cancelled) setCamps(data.camps ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err, "Could not load donation camps."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [status, cityId]);

  return (
    <main className="camps-page">
      <header className="camps-header">
        <h1>Donation camps</h1>
        <p>Find a camp near you and register to donate.</p>
      </header>

      <div className="camps-toolbar">
        <label>
          <span>Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as CampStatus | "")}>
            <option value="">All</option>
            {(Object.keys(CAMP_STATUS_LABEL) as CampStatus[]).map((s) => (
              <option key={s} value={s}>
                {CAMP_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>

        {cities.length > 0 && (
          <label>
            <span>City</span>
            <select value={cityId} onChange={(e) => setCityId(e.target.value)}>
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

      {loading && <p className="camps-message">Loading camps…</p>}
      {!loading && error && (
        <p className="camps-message camps-error" role="alert">
          {error}
        </p>
      )}
      {!loading && !error && camps.length === 0 && (
        <p className="camps-message">No camps match these filters. Try another status or city.</p>
      )}

      <div className="camps-list">
        {camps.map((camp) => (
          <Link key={camp.id} to={`/camps/${camp.id}`} className="camp-card">
            <span className={`camp-status camp-${camp.status}`}>{CAMP_STATUS_LABEL[camp.status]}</span>
            <h2>{camp.title}</h2>
            <p className="camp-when">
              {formatDate(camp.camp_date)}, {formatTime(camp.start_time)} to {formatTime(camp.end_time)}
            </p>
            <p>
              {camp.venue}
              {camp.city ? `, ${camp.city.name}` : ""}
            </p>
            <p className="camp-muted">Organised by {camp.organizer_name}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}

export default Camps;

// Camp detail + RSVP 

export function CampDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [camp, setCamp] = useState<Camp | null>(null);
  const [rsvp, setRsvp] = useState<Rsvp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    api
      .get(`/donation-camps/${id}`)
      .then(({ data }) => setCamp(data.camp))
      .catch((err) => setError(errorMessage(err, "Could not load this camp.")))
      .finally(() => setLoading(false));
  }, [id]);

  // There is no single-RSVP endpoint, so find this camp in the donor's own list.
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "donor") return;
    api
      .get("/camp-rsvps/my")
      .then(({ data }) => {
        const mine: Rsvp[] = data.rsvps ?? [];
        setRsvp(mine.find((r) => r.camp_id === id) ?? null);
      })
      .catch(() => {
        /* button falls back to "Register"; the server rejects duplicates anyway */
      });
  }, [id, isAuthenticated, user?.role]);

  const act = async (kind: "register" | "cancel") => {
    setBusy(true);
    setActionError("");
    try {
      const { data } =
        kind === "register"
          ? await api.post(`/camp-rsvps/${id}/rsvp`)
          : await api.patch(`/camp-rsvps/${id}/rsvp/cancel`);
      setRsvp(data.rsvp);
    } catch (err) {
      setActionError(errorMessage(err, "Something went wrong. Try again."));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <main className="camps-page"><p className="camps-message">Loading camp…</p></main>;
  if (error || !camp)
    return (
      <main className="camps-page">
        <p className="camps-message camps-error" role="alert">{error || "Camp not found."}</p>
        <Link to="/camps">Back to all camps</Link>
      </main>
    );

  const registered = rsvp?.status === "registered" || rsvp?.status === "attended";

  return (
    <main className="camps-page camp-detail">
      <Link to="/camps">Back to all camps</Link>
      <span className={`camp-status camp-${camp.status}`}>{CAMP_STATUS_LABEL[camp.status]}</span>
      <h1>{camp.title}</h1>

      <dl className="camp-facts">
        <div><dt>Date</dt><dd>{formatDate(camp.camp_date)}</dd></div>
        <div><dt>Time</dt><dd>{formatTime(camp.start_time)} to {formatTime(camp.end_time)}</dd></div>
        <div><dt>Venue</dt><dd>{camp.venue}{camp.city ? `, ${camp.city.name}` : ""}</dd></div>
        <div><dt>Organiser</dt><dd>{camp.organizer_name}</dd></div>
      </dl>

      {camp.description && <p className="camp-description">{camp.description}</p>}

      <section className="camp-rsvp" aria-live="polite">
        {!isAuthenticated && <Link to="/login" className="camp-button">Log in to RSVP</Link>}

        {isAuthenticated && user?.role !== "donor" && (
          <p className="camp-muted">Only donor accounts can register for camps.</p>
        )}

        {isAuthenticated && user?.role === "donor" && (
          <>
            {registered && (
              <>
                <p className="camp-ok">You're registered for this camp.</p>
                {rsvp?.status === "registered" && camp.status === "upcoming" && (
                  <button className="camp-button camp-secondary" disabled={busy} onClick={() => act("cancel")}>
                    {busy ? "Cancelling…" : "Cancel registration"}
                  </button>
                )}
              </>
            )}

            {!registered && camp.status === "upcoming" && (
              <button className="camp-button" disabled={busy} onClick={() => act("register")}>
                {busy ? "Registering…" : rsvp ? "Register again" : "Register for this camp"}
              </button>
            )}

            {!registered && camp.status !== "upcoming" && (
              <p className="camp-muted">Registration is closed for this camp.</p>
            )}
          </>
        )}

        {actionError && <p className="camps-message camps-error" role="alert">{actionError}</p>}
      </section>
    </main>
  );
}