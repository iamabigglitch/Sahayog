import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import { Droplet, MapPin, Building2, Phone, Clock, AlertTriangle } from "lucide-react";

interface BloodRequestDetail {
  id: string;
  blood_group_needed: string;
  units_needed: number;
  urgency: string;
  status: string;
  requester_name: string;
  contact_phone: string;
  relationship_to_patient: string;
  expires_at: string;
  hospital?: { id: string; name: string; address: string };
  city?: { id: string; name: string; province: string };
}

const URGENCY_LABELS: Record<string, string> = {
  critical: "Critical",
  high: "High urgency",
  normal: "Normal",
};

function RequestDetail() {
  const { id } = useParams<{ id: string }>();

  const [request, setRequest] = useState<BloodRequestDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResponding, setIsResponding] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [outcome, setOutcome] = useState<"accepted" | "declined" | null>(null);

  useEffect(() => {
    if (!id) return;

    api
      .get(`/blood-requests/${id}`)
      .then((res) => setRequest(res.data.bloodRequest))
      .catch((error) => {
        setErrorMessage(
          error.response?.data?.error?.message ?? "Could not load this request."
        );
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const respond = async (status: "accepted" | "declined") => {
    if (!id) return;

    setErrorMessage("");
    setIsResponding(true);

    try {
      // Create the response first, then immediately set its status —
      // the backend models these as two steps, the UI treats it as one.
      const createRes = await api.post("/request-responses", { requestId: id });
      const responseId = createRes.data.data?.id;

      await api.patch(`/request-responses/${responseId}`, { status });

      setOutcome(status);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.error?.message ?? "Something went wrong. Please try again."
      );
    } finally {
      setIsResponding(false);
    }
  };

  if (isLoading) {
    return <main className="placeholder-page">Loading request...</main>;
  }

  if (!request) {
    return (
      <main className="placeholder-page">
        {errorMessage || "This request could not be found."}
      </main>
    );
  }

  if (outcome === "accepted") {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <h1>Thank you</h1>
          <p className="auth-subtitle">
            {request.requester_name} has been notified that you can help.
            Please reach out to confirm the details, or expect a call soon.
          </p>
          <p className="auth-subtitle">
            <Phone size={14} /> {request.contact_phone}
          </p>
          <Link to="/dashboard" className="primary-button">
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  if (outcome === "declined") {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <h1>No problem</h1>
          <p className="auth-subtitle">
            Thanks for letting us know. We'll keep matching this request with
            other nearby donors.
          </p>
          <Link to="/dashboard" className="primary-button">
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  const isClosed = request.status !== "requested";

  return (
    <main className="request-detail-page">
      <div className="request-detail-card">
        <div className={`request-urgency urgency-${request.urgency}`}>
          <AlertTriangle size={14} />
          {URGENCY_LABELS[request.urgency] ?? request.urgency}
        </div>

        <div className="request-blood-row">
          <div className="request-blood-badge">
            <Droplet size={28} fill="currentColor" strokeWidth={0} />
            <span>{request.blood_group_needed}</span>
          </div>
          <div>
            <h1>{request.units_needed} unit{request.units_needed > 1 ? "s" : ""} needed</h1>
            <p>Requested for {request.relationship_to_patient}</p>
          </div>
        </div>

        <div className="request-info-grid">
          <div>
            <span className="dashboard-label">
              <Building2 size={13} /> Hospital
            </span>
            <strong>{request.hospital?.name ?? "Unknown hospital"}</strong>
            <span className="request-sub">{request.hospital?.address}</span>
          </div>

          <div>
            <span className="dashboard-label">
              <MapPin size={13} /> City
            </span>
            <strong>{request.city?.name ?? "Unknown city"}</strong>
          </div>

          <div>
            <span className="dashboard-label">
              <Clock size={13} /> Expires
            </span>
            <strong>{new Date(request.expires_at).toLocaleString()}</strong>
          </div>
        </div>

        {errorMessage && <p className="auth-error">{errorMessage}</p>}

        {isClosed ? (
          <p className="dashboard-empty">
            This request is no longer accepting responses — it's already {request.status}.
          </p>
        ) : (
          <div className="request-actions">
            <button
              type="button"
              className="primary-button"
              onClick={() => respond("accepted")}
              disabled={isResponding}
            >
              {isResponding ? "Please wait..." : "I can donate"}
            </button>
            <button
              type="button"
              className="secondary-button-outline"
              onClick={() => respond("declined")}
              disabled={isResponding}
            >
              Can't help right now
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default RequestDetail;