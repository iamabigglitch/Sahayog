import { useCallback, useEffect, useState } from "react";
import { api, errorMessage } from "../../lib/api";
import ConfirmDialog from "../../components/ConfirmDialog";

interface City {
  id: string;
  name: string;
}

interface Pagination {
  page: number;
  totalPages: number;
  total: number;
}

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

function Pager({ pagination, noun, onPage }: { pagination: Pagination; noun: string; onPage: (page: number) => void }) {
  if (pagination.totalPages <= 1) return null;

  return (
    <div className="admin-pager">
      <button
        type="button"
        className="admin-button admin-button-secondary"
        disabled={pagination.page <= 1}
        onClick={() => onPage(pagination.page - 1)}
      >
        Previous
      </button>
      <span>
        Page {pagination.page} of {pagination.totalPages} ({pagination.total} {noun})
      </span>
      <button
        type="button"
        className="admin-button admin-button-secondary"
        disabled={pagination.page >= pagination.totalPages}
        onClick={() => onPage(pagination.page + 1)}
      >
        Next
      </button>
    </div>
  );
}

type RequestStatus = "requested" | "accepted" | "completed" | "expired";
type RequestUrgency = "normal" | "high" | "critical";

interface AdminRequest {
  id: string;
  blood_group_needed: string;
  units_needed: number;
  requester_name: string;
  contact_phone: string;
  relationship_to_patient: string;
  urgency: RequestUrgency;
  status: RequestStatus;
  expires_at: string;
  created_at: string;
  hospital?: { id: string; name: string } | null;
  city?: { id: string; name: string } | null;
}

const REQUEST_STATUS_LABEL: Record<RequestStatus, string> = {
  requested: "Open",
  accepted: "Accepted",
  completed: "Completed",
  expired: "Expired",
};

const REQUEST_STATUS_BADGE: Record<RequestStatus, string> = {
  requested: "pending",
  accepted: "ok",
  completed: "ok",
  expired: "muted",
};

const URGENCY_BADGE: Record<RequestUrgency, string> = {
  critical: "bad",
  high: "pending",
  normal: "muted",
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export default function Requests() {
  const [cities, setCities] = useState<City[]>([]);
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [status, setStatus] = useState<RequestStatus | "">("requested");
  const [urgency, setUrgency] = useState<RequestUrgency | "">("");
  const [cityId, setCityId] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [pending, setPending] = useState<{ request: AdminRequest; next: "accepted" | "expired" } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/cities")
      .then(({ data }) => setCities(data.cities ?? []))
      .catch(() => {
        /* the city filter simply stays hidden */
      });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/admin/blood-requests", {
        params: { status: status || undefined, urgency: urgency || undefined, cityId: cityId || undefined, page, limit: 20 },
      });
      setRequests(data.requests ?? []);
      setPagination(data.pagination ?? null);
    } catch (err) {
      setError(errorMessage(err, "Could not load blood requests."));
    } finally {
      setLoading(false);
    }
  }, [status, urgency, cityId, page]);

  useEffect(() => {
    load();
  }, [load]);

  // Any filter change goes back to the first page
  const filterChange = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

  const confirmModeration = async () => {
    if (!pending) return;
    const { request, next } = pending;

    setBusyId(request.id);
    setError("");
    try {
      await api.patch(`/admin/blood-requests/${request.id}/status`, { status: next });
      await load();
    } catch (err) {
      setError(errorMessage(err, "Could not update this request."));
    } finally {
      setBusyId("");
      setPending(null);
    }
  };

  const now = Date.now();

  return (
    <>
      <h1>Blood requests</h1>

      <div className="admin-filters">
        <label className="admin-field">
          <span>Status</span>
          <select value={status} onChange={(e) => filterChange(setStatus)(e.target.value as RequestStatus | "")}>
            <option value="">All</option>
            {(Object.keys(REQUEST_STATUS_LABEL) as RequestStatus[]).map((s) => (
              <option key={s} value={s}>{REQUEST_STATUS_LABEL[s]}</option>
            ))}
          </select>
        </label>

        <label className="admin-field">
          <span>Urgency</span>
          <select value={urgency} onChange={(e) => filterChange(setUrgency)(e.target.value as RequestUrgency | "")}>
            <option value="">All</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
          </select>
        </label>

        {cities.length > 0 && (
          <label className="admin-field">
            <span>City</span>
            <select value={cityId} onChange={(e) => filterChange(setCityId)(e.target.value)}>
              <option value="">All cities</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      {error && <p className="admin-message admin-error" role="alert">{error}</p>}
      {loading && <p className="admin-message">Loading requests…</p>}
      {!loading && !error && requests.length === 0 && (
        <p className="admin-message">No blood requests match these filters.</p>
      )}

      {requests.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Requested</th>
                <th scope="col">Need</th>
                <th scope="col">Hospital</th>
                <th scope="col">Requester</th>
                <th scope="col">Status</th>
                <th scope="col"><span className="admin-sr">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => {
                const open = request.status === "requested" || request.status === "accepted";
                const pastExpiry = open && new Date(request.expires_at).getTime() < now;

                return (
                  <tr key={request.id}>
                    <td>
                      {formatDateTime(request.created_at)}
                      <div className="admin-muted">Expires {formatDateTime(request.expires_at)}</div>
                    </td>
                    <td>
                      <strong>{request.blood_group_needed}</strong>
                      <span className="admin-muted"> · {plural(request.units_needed, "unit", "units")}</span>
                      <div>
                        <span className={`admin-badge ${URGENCY_BADGE[request.urgency]}`}>{capitalize(request.urgency)}</span>
                      </div>
                    </td>
                    <td>
                      {request.hospital?.name ?? "Unknown hospital"}
                      <div className="admin-muted">{request.city?.name ?? "Unknown city"}</div>
                    </td>
                    <td>
                      {request.requester_name}
                      <div><a href={`tel:${request.contact_phone}`}>{request.contact_phone}</a></div>
                      <div className="admin-muted">{capitalize(request.relationship_to_patient)}</div>
                    </td>
                    <td>
                      <span className={`admin-badge ${REQUEST_STATUS_BADGE[request.status]}`}>
                        {REQUEST_STATUS_LABEL[request.status]}
                      </span>
                      {pastExpiry && <div className="admin-muted">Past expiry time</div>}
                    </td>
                    <td>
                      <div className="admin-actions">
                        {request.status === "requested" && (
                          <button
                            type="button"
                            className="admin-button admin-button-secondary admin-button-sm"
                            disabled={busyId === request.id}
                            onClick={() => setPending({ request, next: "accepted" })}
                          >
                            Mark accepted
                          </button>
                        )}
                        {open && (
                          <button
                            type="button"
                            className="admin-button admin-button-sm"
                            disabled={busyId === request.id}
                            onClick={() => setPending({ request, next: "expired" })}
                          >
                            Expire
                          </button>
                        )}
                        {!open && <span className="admin-muted">Final</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pagination && <Pager pagination={pagination} noun="requests" onPage={setPage} />}

      <ConfirmDialog
        open={pending !== null}
        title={pending?.next === "expired" ? "Expire this request?" : "Mark this request as accepted?"}
        message={
          pending
            ? pending.next === "expired"
              ? `${pending.request.blood_group_needed} for ${pending.request.requester_name}. An expired request can't be changed afterwards.`
              : `${pending.request.blood_group_needed} for ${pending.request.requester_name}. This marks it as accepted without a donor response, and it can then only be expired.`
            : ""
        }
        confirmLabel={pending?.next === "expired" ? "Expire request" : "Mark accepted"}
        busy={busyId !== ""}
        onConfirm={confirmModeration}
        onCancel={() => setPending(null)}
      />

      <p className="admin-muted">
        Requests are completed through the donor flow, so there is no "Completed" action here.
      </p>
    </>
  );
}