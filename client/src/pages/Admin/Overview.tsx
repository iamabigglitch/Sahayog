import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, errorMessage } from "../../lib/api";

interface AdminStats {
  users: { total: number; donors: number; verifiedDonors: number; unverifiedDonors: number };
  bloodRequests: { requested: number; accepted: number; completed: number; expired: number };
  donationCamps: { total: number; upcoming: number; ongoing: number; completed: number; cancelled: number };
  campRsvps: { registered: number; attended: number; cancelled: number };
  bloodBank: { available: number; low: number; outOfStock: number };
}

interface StatRow {
  label: string;
  value: number;
}

// A headline number that links to the page where you act on it
function Kpi({ value, label, hint, to, alert }: { value: number; label: string; hint: string; to: string; alert?: boolean }) {
  return (
    <Link to={to} className={`ov-kpi ${alert && value > 0 ? "alert" : ""}`}>
      <span className="ov-kpi-value">{value}</span>
      <span className="ov-kpi-label">{label}</span>
      <span className="ov-kpi-hint">{hint}</span>
    </Link>
  );
}

function Rows({ rows }: { rows: StatRow[] }) {
  return (
    <dl className="ov-rows">
      {rows.map((row) => (
        <div key={row.label} className="ov-row">
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

interface PanelProps {
  title: string;
  rows: StatRow[];
  to: string;
  linkLabel: string;
  extraTitle?: string;
  extraRows?: StatRow[];
  note?: string;
}

function Panel({ title, rows, to, linkLabel, extraTitle, extraRows, note }: PanelProps) {
  const headingId = `ov-${title.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <section className="ov-panel" aria-labelledby={headingId}>
      <header className="ov-panel-head">
        <h2 id={headingId}>{title}</h2>
        <Link to={to}>{linkLabel}</Link>
      </header>

      <Rows rows={rows} />

      {extraRows && (
        <>
          <h3 className="ov-subtitle">{extraTitle}</h3>
          <Rows rows={extraRows} />
        </>
      )}

      {note && <p className="ov-note">{note}</p>}
    </section>
  );
}

export default function Overview() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/admin/dashboard")
      .then(({ data }) => setStats(data.stats))
      .catch((err) => setError(errorMessage(err, "Could not load the overview.")));
  }, []);

  if (error) return <p className="admin-message admin-error" role="alert">{error}</p>;
  if (!stats) return <p className="admin-message">Loading overview…</p>;

  return (
    <>
      <h1>Overview</h1>

      <div className="ov-kpis">
        <Kpi
          value={stats.users.unverifiedDonors}
          label="Donors to verify"
          hint="Review donors"
          to="/admin/donors"
          alert
        />
        <Kpi
          value={stats.bloodRequests.requested}
          label="Open requests"
          hint="Review requests"
          to="/admin/requests"
          alert
        />
        <Kpi
          value={stats.donationCamps.upcoming}
          label="Upcoming camps"
          hint="Manage camps"
          to="/admin/camps"
        />
        <Kpi
          value={stats.bloodBank.low + stats.bloodBank.outOfStock}
          label="Low or out of stock"
          hint="Update stock"
          to="/admin/hospitals"
          alert
        />
      </div>

      <div className="ov-grid">
        <Panel
          title="People"
          to="/admin/donors"
          linkLabel="Verify donors"
          rows={[
            { label: "Users", value: stats.users.total },
            { label: "Donors", value: stats.users.donors },
            { label: "Verified", value: stats.users.verifiedDonors },
            { label: "Pending", value: stats.users.unverifiedDonors },
          ]}
          note="Users includes admin accounts."
        />

        <Panel
          title="Blood requests"
          to="/admin/requests"
          linkLabel="Review requests"
          rows={[
            { label: "Open", value: stats.bloodRequests.requested },
            { label: "Accepted", value: stats.bloodRequests.accepted },
            { label: "Completed", value: stats.bloodRequests.completed },
            { label: "Expired", value: stats.bloodRequests.expired },
          ]}
        />

        <Panel
          title="Camps"
          to="/admin/camps"
          linkLabel="Manage camps"
          rows={[
            { label: "Total", value: stats.donationCamps.total },
            { label: "Upcoming", value: stats.donationCamps.upcoming },
            { label: "Ongoing", value: stats.donationCamps.ongoing },
            { label: "Completed", value: stats.donationCamps.completed },
            { label: "Cancelled", value: stats.donationCamps.cancelled },
          ]}
          extraTitle="Registrations"
          extraRows={[
            { label: "Registered", value: stats.campRsvps.registered },
            { label: "Attended", value: stats.campRsvps.attended },
            { label: "Cancelled", value: stats.campRsvps.cancelled },
          ]}
        />

        <Panel
          title="Blood bank"
          to="/admin/hospitals"
          linkLabel="Update stock"
          rows={[
            { label: "Available", value: stats.bloodBank.available },
            { label: "Low", value: stats.bloodBank.low },
            { label: "Out of stock", value: stats.bloodBank.outOfStock },
          ]}
          note="Counts hospital and blood group entries, not units of blood."
        />
      </div>
    </>
  );
}