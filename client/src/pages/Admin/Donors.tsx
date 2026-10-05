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

// Dates from the API are plain "YYYY-MM-DD"; build them in local time to avoid a day shift.
function formatDay(value: string): string {
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

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

interface Donor {
  id: string;
  blood_group: string;
  city_id: string;
  donor_verified: boolean;
  trust_score: number;
  last_donation_date: string | null;
  user?: { id: string; phone: string } | null;
}

type DonorFilter = "false" | "true" | "";

const DONOR_FILTERS: { value: DonorFilter; label: string }[] = [
  { value: "false", label: "Pending" },
  { value: "true", label: "Verified" },
  { value: "", label: "All" },
];

export default function Donors() {
  const [cities, setCities] = useState<City[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [filter, setFilter] = useState<DonorFilter>("false");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [pendingRemoval, setPendingRemoval] = useState<Donor | null>(null);
  const [error, setError] = useState("");

  const cityName = (id: string) => cities.find((c) => c.id === id)?.name ?? "Unknown";

  useEffect(() => {
    api
      .get("/cities")
      .then(({ data }) => setCities(data.cities ?? []))
      .catch(() => {
        /* city names fall back to "Unknown" */
      });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/admin/donors", {
        params: { verified: filter || undefined, page, limit: 20 },
      });
      setDonors(data.donors ?? []);
      setPagination(data.pagination ?? null);
    } catch (err) {
      setError(errorMessage(err, "Could not load donors."));
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    load();
  }, [load]);

  const changeFilter = (value: DonorFilter) => {
    setFilter(value);
    setPage(1);
  };

  const setVerified = async (donor: Donor, verified: boolean) => {
    setBusyId(donor.id);
    setError("");
    try {
      await api.patch(`/admin/donors/${donor.id}/verification`, { verified });
      await load();
    } catch (err) {
      setError(errorMessage(err, "Could not update verification."));
    } finally {
      setBusyId("");
      setPendingRemoval(null);
    }
  };

  // Verifying is immediate; removing a verification asks first
  const toggleVerification = (donor: Donor) => {
    if (donor.donor_verified) {
      setPendingRemoval(donor);
    } else {
      setVerified(donor, true);
    }
  };

  return (
    <>
      <h1>Donor verification</h1>

      <div className="admin-toolbar" role="group" aria-label="Filter donors">
        {DONOR_FILTERS.map((f) => (
          <button
            key={f.label}
            type="button"
            className={`admin-tab ${filter === f.value ? "active" : ""}`}
            aria-pressed={filter === f.value}
            onClick={() => changeFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <p className="admin-message admin-error" role="alert">{error}</p>}
      {loading && <p className="admin-message">Loading donors…</p>}

      {!loading && !error && donors.length === 0 && (
        <p className="admin-message">
          {filter === "false" ? "No donors are waiting for verification." : "No donors match this filter."}
        </p>
      )}

      {donors.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Phone</th>
                <th scope="col">Blood group</th>
                <th scope="col">City</th>
                <th scope="col">Trust score</th>
                <th scope="col">Last donation</th>
                <th scope="col">Status</th>
                <th scope="col"><span className="admin-sr">Action</span></th>
              </tr>
            </thead>
            <tbody>
              {donors.map((donor) => (
                <tr key={donor.id}>
                  <td>{donor.user?.phone ?? "Not available"}</td>
                  <td>{donor.blood_group}</td>
                  <td>{cityName(donor.city_id)}</td>
                  <td>{donor.trust_score}</td>
                  <td>{donor.last_donation_date ? formatDay(donor.last_donation_date) : "Never"}</td>
                  <td>
                    <span className={`admin-badge ${donor.donor_verified ? "ok" : "pending"}`}>
                      {donor.donor_verified ? "Verified" : "Pending"}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={donor.donor_verified ? "admin-button admin-button-secondary admin-button-sm" : "admin-button admin-button-sm"}
                      disabled={busyId === donor.id}
                      onClick={() => toggleVerification(donor)}
                    >
                      {busyId === donor.id ? "Saving…" : donor.donor_verified ? "Remove verification" : "Verify"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && <Pager pagination={pagination} noun="donors" onPage={setPage} />}

      <ConfirmDialog
        open={pendingRemoval !== null}
        title="Remove verification?"
        message={`${pendingRemoval?.user?.phone ?? "This donor"} will show as pending verification again.`}
        confirmLabel="Remove verification"
        busy={busyId !== ""}
        onConfirm={() => pendingRemoval && setVerified(pendingRemoval, false)}
        onCancel={() => setPendingRemoval(null)}
      />
    </>
  );
}