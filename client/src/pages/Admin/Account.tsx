import { useState } from "react";
import type { FormEvent } from "react";
import { api, errorMessage } from "../../lib/api";
import { FormInput, SubmitButton } from "../../components/FormElements";

export default function Account() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");

    if (newPassword.length < 8) return setError("The new password must be at least 8 characters.");
    if (newPassword !== confirmPassword) return setError("The two new passwords don't match.");

    setSaving(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
        // Lets the server keep this device signed in
        refreshToken: localStorage.getItem("refreshToken") ?? undefined,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setNotice("Password changed. Any other devices have been signed out.");
    } catch (err) {
      setError(errorMessage(err, "Could not change the password."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <h1>Account</h1>

      <section className="admin-panel account-panel" aria-labelledby="password-heading">
        <h2 id="password-heading">Change password</h2>

        <form onSubmit={submit} noValidate>
          <FormInput
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={setCurrentPassword}
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

          <SubmitButton isLoading={saving}>Change password</SubmitButton>
        </form>

        {notice && <p className="admin-message admin-ok" role="status">{notice}</p>}
        {error && <p className="admin-message admin-error" role="alert">{error}</p>}
      </section>
    </>
  );
}