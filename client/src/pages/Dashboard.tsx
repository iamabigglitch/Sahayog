import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import {
  Droplet,
  MapPin,
  ShieldCheck,
  ShieldQuestion,
  Calendar,
  CalendarCheck,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

interface DonorProfile {
  id: string;
  blood_group: string;
  city_id: string;
  available: boolean;
  donor_verified: boolean;
  last_donation_date: string | null;
  trust_score: number;
}

interface DonationHistoryItem {
  id: string;
  request_id: string;
  status: string;
  donation_date: string;
}

interface CampRsvpItem {
  id: string;
  camp_id: string;
  status: "registered" | "attended" | "cancelled";
  camp?: {
    title: string;
    venue: string;
    camp_date: string; // "YYYY-MM-DD"
    status: string;
  };
}

function statusIcon(status: string) {
  if (status === "completed") return <CheckCircle2 size={16} />;
  if (status === "cancelled" || status === "no_show") return <XCircle size={16} />;
  return <Clock size={16} />;
}

// camp_date is a plain date, so build it in local time to avoid a day shift.
function formatCampDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function Dashboard() {
  const [profile, setProfile] = useState<DonorProfile | null>(null);
  const [history, setHistory] = useState<DonationHistoryItem[]>([]);
  const [campRsvps, setCampRsvps] = useState<CampRsvpItem[]>([]);
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingAvailability, setIsTogglingAvailability] = useState(false);
  const [cancellingCampId, setCancellingCampId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [profileRes, historyRes, campsRes, citiesRes] = await Promise.all([
          api.get("/donors/me"),
          api.get("/donation-history/me"),
          // Camps are secondary: a failure here must not break the whole dashboard.
          api.get("/camp-rsvps/my").catch(() => null),
          // City names are cosmetic: fall back to "Unknown city" if this fails.
          api.get("/cities").catch(() => null),
        ]);

        setProfile(profileRes.data.profile);
        setHistory(historyRes.data.donationHistory ?? []);
        setCampRsvps(campsRes?.data.rsvps ?? []);
        setCities(citiesRes?.data.cities ?? []);
      } catch (error: any) {
        setErrorMessage(
          error.response?.data?.error?.message ?? "Failed to load your dashboard."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const handleToggleAvailability = async () => {
    if (!profile) return;
    setIsTogglingAvailability(true);

    try {
      const response = await api.patch("/donors/me/availability", {
        available: !profile.available,
      });
      setProfile(response.data.profile);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.error?.message ?? "Failed to update availability."
      );
    } finally {
      setIsTogglingAvailability(false);
    }
  };

  const handleCancelCamp = async (campId: string) => {
    setCancellingCampId(campId);
    setErrorMessage("");

    try {
      const response = await api.patch(`/camp-rsvps/${campId}/rsvp/cancel`);
      setCampRsvps((prev) =>
        prev.map((r) =>
          r.camp_id === campId ? { ...r, status: response.data.rsvp.status } : r
        )
      );
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.error?.message ?? "Failed to cancel your registration."
      );
    } finally {
      setCancellingCampId("");
    }
  };

  if (isLoading) {
    return <main className="placeholder-page">Loading your dashboard...</main>;
  }

  if (errorMessage && !profile) {
    return <main className="placeholder-page">{errorMessage}</main>;
  }

  const completedDonations = history.filter((h) => h.status === "completed").length;

  return (
    <main className="dash">
      <div className="dash-container">
        {/* Header */}
        <div className="dash-header">
          <div className="dash-blood-badge">
            <Droplet size={26} fill="currentColor" strokeWidth={0} />
            <span>{profile?.blood_group}</span>
          </div>

          <div className="dash-header-text">
            <h1>Welcome back</h1>
            <p>
              <MapPin size={14} />
              {cities.find((city) => city.id === profile?.city_id)?.name ?? "Unknown city"}
              <span className="dash-dot">·</span>
              {profile?.donor_verified ? (
                <span className="dash-badge verified">
                  <ShieldCheck size={13} /> Verified donor
                </span>
              ) : (
                <span className="dash-badge pending">
                  <ShieldQuestion size={13} /> Pending verification
                </span>
              )}
            </p>
          </div>

          <button
            type="button"
            className={`availability-pill ${profile?.available ? "on" : ""}`}
            onClick={handleToggleAvailability}
            disabled={isTogglingAvailability}
          >
            <span className="availability-dot" />
            {profile?.available ? "Available to donate" : "Not available"}
          </button>
        </div>

        {errorMessage && <p className="auth-error">{errorMessage}</p>}

        {/* Stats */}
        <div className="dash-stats">
          <div className="dash-stat">
            <Award size={20} />
            <div>
              <strong>{completedDonations}</strong>
              <span>Donations completed</span>
            </div>
          </div>

          <div className="dash-stat">
            <ShieldCheck size={20} />
            <div>
              <strong>{profile?.trust_score ?? 0}</strong>
              <span>Trust score</span>
            </div>
          </div>

          <div className="dash-stat">
            <Calendar size={20} />
            <div>
              <strong>
                {profile?.last_donation_date
                  ? new Date(profile.last_donation_date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })
                  : "—"}
              </strong>
              <span>Last donation</span>
            </div>
          </div>
        </div>

        <div className="dash-grid">
          {/* Donation history */}
          <section className="dash-panel">
            <div className="dash-panel-header">
              <h2>
                <Award size={17} /> Donation history
              </h2>
            </div>

            {history.length === 0 ? (
              <p className="dash-empty">
                Your first donation will show up here as a record you can look back on.
              </p>
            ) : (
              <ul className="dash-timeline">
                {history.map((record) => (
                  <li key={record.id} className={`dash-timeline-item ${record.status}`}>
                    <span className="dash-timeline-icon">{statusIcon(record.status)}</span>
                    <div>
                      <strong>{record.status.replace("_", " ")}</strong>
                      <span>{new Date(record.donation_date).toLocaleDateString()}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* My camps */}
          <section className="dash-panel">
            <div className="dash-panel-header">
              <h2>
                <CalendarCheck size={17} /> My camps
              </h2>
              <Link to="/camps" className="dash-panel-link">
                Browse camps
              </Link>
            </div>

            {campRsvps.length === 0 ? (
              <p className="dash-empty">
                You haven't registered for a donation camp yet.{" "}
                <Link to="/camps">See upcoming camps</Link>.
              </p>
            ) : (
              <ul className="dash-list">
                {campRsvps.map((rsvp) => (
                  <li key={rsvp.id} className="dash-camp">
                    <div>
                      <Link to={`/camps/${rsvp.camp_id}`}>
                        <strong>{rsvp.camp?.title ?? "Donation camp"}</strong>
                      </Link>
                      {rsvp.camp && (
                        <span className="dash-camp-meta">
                          {formatCampDate(rsvp.camp.camp_date)} · {rsvp.camp.venue}
                        </span>
                      )}
                    </div>

                    <div className="dash-camp-actions">
                      <span className={`dash-camp-status ${rsvp.status}`}>{rsvp.status}</span>
                      {rsvp.status === "registered" && rsvp.camp?.status === "upcoming" && (
                        <button
                          type="button"
                          className="dash-mark-read"
                          disabled={cancellingCampId === rsvp.camp_id}
                          onClick={() => handleCancelCamp(rsvp.camp_id)}
                        >
                          {cancellingCampId === rsvp.camp_id ? "Cancelling..." : "Cancel"}
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;