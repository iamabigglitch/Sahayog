import { NavLink, Outlet } from "react-router-dom";

// Admin area shell: side menu on the left, the chosen section on the right.
// Sections live in this folder, one file each, and are routed in App.tsx.

export default function Admin() {
  return (
    <main className="admin">
      <nav className="admin-menu" aria-label="Admin sections">
        <NavLink to="/admin" end>Overview</NavLink>
        <NavLink to="/admin/hospitals">Hospitals and stock</NavLink>
        <NavLink to="/admin/donors">Donor verification</NavLink>
        <NavLink to="/admin/camps">Camps</NavLink>
        <NavLink to="/admin/requests">Blood requests</NavLink>
        <NavLink to="/admin/notifications">Notifications</NavLink>
        <NavLink to="/admin/account">Account</NavLink>
      </nav>

      <section className="admin-content">
        <Outlet />
      </section>
    </main>
  );
}