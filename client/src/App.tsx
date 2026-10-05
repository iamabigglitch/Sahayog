import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";
import Home from "./pages/Home";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";
import Login from "./pages/Login";
import RequestBlood from "./pages/RequestBlood";
import Dashboard from "./pages/Dashboard";
import RequestDetail from "./pages/RequestDetail";
import BloodBankStatus from "./pages/BloodBankStatus";
import Camps, { CampDetail } from "./pages/Camps";
import Admin from "./pages/Admin";
import AdminOverview from "./pages/Admin/Overview";
import AdminHospitals from "./pages/Admin/Hospitals";
import AdminDonors from "./pages/Admin/Donors";
import AdminCamps from "./pages/Admin/Camps";
import AdminRequests from "./pages/Admin/Requests";
import AdminNotifications from "./pages/Admin/Notifications";
import AdminAccount from "./pages/Admin/Account";
import ForgotPassword from "./pages/ForgotPassword";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Navbar />

          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/request-blood" element={<RequestBlood />} />
            <Route path="/blood-bank-status" element={<BloodBankStatus />} />

            {/* Any logged-in user */}
            <Route
              element={
                <ProtectedRoute>
                  <Outlet />
                </ProtectedRoute>
              }
            >
              <Route path="/camps" element={<Camps />} />
              <Route path="/camps/:id" element={<CampDetail />} />
              <Route path="/requests/:id" element={<RequestDetail />} />
            </Route>

            {/* Donors only (admins are sent to /admin) */}
            <Route
              element={
                <ProtectedRoute requiredRole="donor">
                  <Outlet />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>

            {/* Admins only */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Admin />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminOverview />} />
              <Route path="hospitals" element={<AdminHospitals />} />
              <Route path="donors" element={<AdminDonors />} />
              <Route path="camps" element={<AdminCamps />} />
              <Route path="requests" element={<AdminRequests />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="account" element={<AdminAccount />} />
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;