import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import "./App.css";
import Home from "./pages/Home";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Navbar />

          <Routes>
            <Route path="/" element={<Home />} />

            <Route
              path="/login"
              element={<div className="placeholder-page">Login page coming next.</div>}
            />

            <Route path="/register" element={<Register />} />

            <Route path="/verify-otp" element={<VerifyOtp />} />

            <Route
              path="/dashboard"
              element={<div className="placeholder-page">Dashboard coming next.</div>}
            />

            <Route
              path="/request-blood"
              element={
                <div className="placeholder-page">
                  Blood request page coming next.
                </div>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;