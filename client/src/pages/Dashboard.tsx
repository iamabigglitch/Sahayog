import { useState, useEffect } from "react";
import { api } from "../lib/api";
import {
  Droplet,
  MapPin,
  ShieldCheck,
  ShieldQuestion,
  Calendar,
  Bell,
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

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  status: string;
  sent_at: string | null;
}

const CITY_NAMES: Record<string, string> = {
  "8acf0b9e-9a5a-4096-894c-046988ad1234": "Bhaktapur",
  "9771f7ce-966d-42a3-a009-904d6b7c00a4": "Biratnagar",
  "e2c684fa-05cc-4558-8f2c-ac6d2b9da33b": "Birgunj",
  "304dc55d-641f-4447-9dc9-02d09b1c55c4": "Kathmandu",
  "3781ac36-a652-4b41-a0de-5b718791e8d5": "Lalitpur",
  "c6676af2-044a-419d-9a82-d326b9f98dcc": "Pokhara",
};

function statusIcon(status: string) {
  if (status === "completed") return <CheckCircle2 size={16} />;
  if (status === "cancelled" || status === "no_show") return <XCircle size={16} />;
  return <Clock size={16} />;
}

function Dashboard() {
  const [profile, setProfile] = useState<DonorProfile | null>(null);
  const [history, setHistory] = useState<DonationHistoryItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingAvailability, setIsTogglingAvailability] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [profileRes, historyRes, notificationsRes] = await Promise.all([
          api.get("/donors/me"),
          api.get("/donation-history/me"),
          api.get("/notifications"),
        ]);

        setProfile(profileRes.data.profile);
        setHistory(historyRes.data.donationHistory ?? []);
        setNotifications(notificationsRes.data.notifications ?? []);
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

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, status: "read" } : n))
      );
    } catch {
      // non-critical
    }
  };

  if (isLoading) {
    return <main className="placeholder-page">Loading your dashboard...</main>;
  }

  if (errorMessage && !profile) {
    return <main className="placeholder-page">{errorMessage}</main>;
  }

  const unreadCount = notifications.filter((n) => n.status !== "read").length;
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
              {CITY_NAMES[profile?.city_id ?? ""] ?? "Unknown city"}
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
          {/* Notifications */}
          <section className="dash-panel">
            <div className="dash-panel-header">
              <h2>
                <Bell size={17} /> Notifications
              </h2>
              {unreadCount > 0 && <span className="dash-count">{unreadCount}</span>}
            </div>

            {notifications.length === 0 ? (
              <p className="dash-empty">
                You'll see it here the moment someone nearby needs your blood type.
              </p>
            ) : (
              <ul className="dash-list">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={`dash-notification ${notification.status !== "read" ? "unread" : ""}`}
                  >
                    <span className="dash-notification-dot" />
                    <div>
                      <strong>{notification.title}</strong>
                      <p>{notification.message}</p>
                    </div>
                    {notification.status !== "read" && (
                      <button
                        type="button"
                        className="dash-mark-read"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        Mark read
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

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
        </div>
      </div>
    </main>
  );
}

export default Dashboard;