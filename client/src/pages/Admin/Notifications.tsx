import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api, errorMessage } from "../../lib/api";
import ConfirmDialog from "../../components/ConfirmDialog";

interface City {
  id: string;
  name: string;
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const MESSAGE_LIMIT = 500;

export default function Notifications() {
  const [cities, setCities] = useState<City[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [cityId, setCityId] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    api
      .get("/cities")
      .then(({ data }) => setCities(data.cities ?? []))
      .catch(() => {
        /* the city filter simply stays at "All cities" */
      });
  }, []);

  // "All donors", "O+ donors in Pokhara", and so on
  const cityName = cities.find((city) => city.id === cityId)?.name;
  const audience = `${bloodGroup ? `${bloodGroup} donors` : "All donors"}${cityName ? ` in ${cityName}` : ""}`;

  const review = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");

    if (!title.trim() || !message.trim()) {
      return setError("Add a title and a message.");
    }

    setConfirming(true);
  };

  const send = async () => {
    setSending(true);
    setError("");

    try {
      const { data } = await api.post("/notifications/announcements", {
        title: title.trim(),
        message: message.trim(),
        ...(cityId && { cityId }),
        ...(bloodGroup && { bloodGroup }),
      });

      setTitle("");
      setMessage("");
      setNotice(`Sent to ${data.recipients} ${data.recipients === 1 ? "donor" : "donors"}.`);
    } catch (err) {
      setError(errorMessage(err, "Could not send the notification."));
    } finally {
      setSending(false);
      setConfirming(false);
    }
  };

  return (
    <>
      <h1>Notifications</h1>

      <section className="admin-panel" aria-labelledby="announce-heading">
        <h2 id="announce-heading">Send a notification</h2>

        <form className="admin-form" onSubmit={review} noValidate>
          <label className="admin-field wide">
            <span>Title</span>
            <input value={title} maxLength={100} onChange={(e) => setTitle(e.target.value)} />
          </label>

          <label className="admin-field wide">
            <span>
              Message{" "}
              <span className="admin-muted">
                ({message.length}/{MESSAGE_LIMIT})
              </span>
            </span>
            <textarea
              rows={4}
              maxLength={MESSAGE_LIMIT}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </label>

          <label className="admin-field">
            <span>City</span>
            <select value={cityId} onChange={(e) => setCityId(e.target.value)}>
              <option value="">All cities</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>{city.name}</option>
              ))}
            </select>
          </label>

          <label className="admin-field">
            <span>Blood group</span>
            <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
              <option value="">All blood groups</option>
              {BLOOD_GROUPS.map((group) => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </label>

          <div className="admin-actions wide">
            <button type="submit" className="admin-button">Review and send</button>
          </div>
        </form>

        {notice && <p className="admin-message admin-ok" role="status">{notice}</p>}
        {error && <p className="admin-message admin-error" role="alert">{error}</p>}
      </section>

      <ConfirmDialog
        open={confirming}
        title="Send this notification?"
        message={`It will appear in the notification bell of: ${audience}.`}
        confirmLabel="Send notification"
        busy={sending}
        onConfirm={send}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}