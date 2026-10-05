import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { api, errorMessage } from "../lib/api";
import { FormInput, SubmitButton } from "../components/FormElements";

type Step = "phone" | "reset" | "done";

// For donors and admins alike: phone number, then the code, then a new password.
function ForgotPassword() {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const sendCode = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { data } = await api.post("/auth/forgot-password", { phone });
      setDevOtp(data.otp ?? "");
      setStep("reset");
    } catch (err) {
      setError(errorMessage(err, "Could not send a code. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) return setError("The new password must be at least 8 characters.");
    if (newPassword !== confirmPassword) return setError("The two passwords don't match.");

    setIsLoading(true);

    try {
      await api.post("/auth/reset-password", { phone, otp, newPassword });
      setStep("done");
    } catch (err) {
      setError(errorMessage(err, "Could not reset the password. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "done") {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <h1>Password updated</h1>
          <p className="auth-subtitle">Your password has been changed. Log in with the new one.</p>
          <Link to="/login" className="primary-button form-submit">
            Go to login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Reset your password</h1>

        {step === "phone" ? (
          <>
            <p className="auth-subtitle">Enter your phone number and we'll send a verification code.</p>

            <form onSubmit={sendCode}>
              <FormInput
                label="Phone number"
                type="tel"
                value={phone}
                onChange={setPhone}
                placeholder="98XXXXXXXX"
                maxLength={10}
                required
              />

              {error && <p className="auth-error">{error}</p>}

              <SubmitButton isLoading={isLoading}>Send code</SubmitButton>
            </form>
          </>
        ) : (
          <>
            <p className="auth-subtitle">
              If {phone} has an account, a 6-digit code is on its way. Enter it below with your new password.
            </p>

            {devOtp && (
              <p className="auth-subtitle">
                Development code: <strong>{devOtp}</strong>
              </p>
            )}

            <form onSubmit={resetPassword}>
              <FormInput
                label="Verification code"
                value={otp}
                onChange={setOtp}
                placeholder="6-digit code"
                maxLength={6}
                required
              />

              <FormInput
                label="New password"
                type="password"
                value={newPassword}
                onChange={setNewPassword}
                placeholder="At least 8 characters"
                required
              />

              <FormInput
                label="Confirm new password"
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                required
              />

              {error && <p className="auth-error">{error}</p>}

              <SubmitButton isLoading={isLoading}>Update password</SubmitButton>
            </form>

            <p className="auth-switch">
              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setError("");
                }}
              >
                Use a different number
              </button>
            </p>
          </>
        )}

        <p className="auth-switch">
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </main>
  );
}

export default ForgotPassword;