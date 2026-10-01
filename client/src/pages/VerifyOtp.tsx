import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { FormInput, SubmitButton } from "../components/FormElements";

interface RegistrationState {
  phone: string;
  password: string;
  bloodGroup: string;
  cityId: string;
  devOtp?: string;
}

function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const state = location.state as RegistrationState | undefined;

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // If someone lands here directly (no registration data carried over),
  // send them back to register instead of showing a broken form.
  if (!state) {
    navigate("/register", { replace: true });
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await api.post("/auth/verify-otp", {
        phone: state.phone,
        otp,
        password: state.password,
        bloodGroup: state.bloodGroup,
        cityId: state.cityId,
      });

      const { user, accessToken, refreshToken } = response.data;

      login(accessToken, refreshToken, user);
      navigate("/dashboard");
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.error?.message ?? "Verification failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Verify your phone</h1>
        <p className="auth-subtitle">
          We sent a 6-digit code to {state.phone}. Enter it below to finish
          setting up your account.
        </p>

        {state.devOtp && (
          <p className="auth-subtitle" style={{ color: "#b45309", marginTop: 8 }}>
            Development OTP: {state.devOtp}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <FormInput
            label="Verification code"
            type="text"
            value={otp}
            onChange={setOtp}
            placeholder="123456"
            maxLength={6}
            required
          />

          {errorMessage && <p className="auth-error">{errorMessage}</p>}

          <SubmitButton isLoading={isLoading}>Verify and continue</SubmitButton>
        </form>
      </div>
    </main>
  );
}

export default VerifyOtp;