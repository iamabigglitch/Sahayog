import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { api } from "../lib/api";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  status: string;
  sent_at: string | null;
  created_at?: string;
  request_id?: string;
}

const REFRESH_MS = 60_000;

// Bell with an unread badge and a dropdown list. Shown in the navbar for donors.
export default function NotificationBell() {
  const navigate = useNavigate();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/notifications");
      setItems(data.notifications ?? []);
    } catch {
      // Keep showing what we already have
    }
  }, []);

  // Load now, then check again every minute
  useEffect(() => {
    load();
    const timer = window.setInterval(load, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [load]);

  // Close the dropdown on an outside click or Escape
  useEffect(() => {
    if (!open) return;

    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const unread = items.filter((item) => item.status !== "read").length;

  const markRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status: "read" } : item)));
    } catch {
      // Not critical
    }
  };

  const openItem = async (item: NotificationItem) => {
    if (item.status !== "read") await markRead(item.id);

    if (item.request_id) {
      setOpen(false);
      navigate(`/requests/${item.request_id}`);
    }
  };

  return (
    <div className="bell" ref={wrapRef}>
      <button
        type="button"
        className="bell-button"
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Bell size={20} />
        {unread > 0 && <span className="bell-badge">{unread > 9 ? "9+" : unread}</span>}
      </button>

      {open && (
        <div className="bell-panel">
          <h2 className="bell-panel-title">Notifications</h2>

          {items.length === 0 ? (
            <p className="bell-empty">
              You'll see it here the moment someone nearby needs your blood type.
            </p>
          ) : (
            <ul className="bell-list">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`bell-item ${item.status !== "read" ? "unread" : ""}`}
                    onClick={() => openItem(item)}
                  >
                    <span className="bell-dot" />
                    <span>
                      <strong>{item.title}</strong>
                      <p>{item.message}</p>
                      {(item.sent_at ?? item.created_at) && (
                        <span className="bell-time">
                          {new Date((item.sent_at ?? item.created_at) as string).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}