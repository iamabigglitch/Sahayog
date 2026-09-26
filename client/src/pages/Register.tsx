import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { FormInput, FormSelect, SubmitButton } from "../components/FormElements";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// Hardcoded for now to unblock development — matches real rows in the
// cities table. Revisit via GET /cities once the CORS issue is sorted,
// so this doesn't silently drift if cities are ever added/changed in the DB.
const CITIES = [
  { id: "8acf0b9e-9a5a-4096-894c-046988ad1234", name: "Bhaktapur" },
  { id: "9771f7ce-966d-42a3-a009-904d6b7c00a4", name: "Biratnagar" },
  { id: "e2c684fa-05cc-4558-8f2c-ac6d2b9da33b", name: "Birgunj" },
  { id: "304dc55d-641f-4447-9dc9-02d09b1c55c4", name: "Kathmandu" },
  { id: "3781ac36-a652-4b41-a0de-5b718791e8d5", name: "Lalitpur" },
  { id: "c6676af2-044a-419d-9a82-d326b9f98dcc", name: "Pokhara" },
];

function Register() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [cityId, setCityId] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      await api.post("/auth/register", {
        phone,
        password,
        bloodGroup,
        cityId,
      });

      navigate("/verify-otp", {
        state: { phone, password, bloodGroup, cityId },
      });
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.error?.message ?? "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Become a donor</h1>
        <p className="auth-subtitle">
          Create your account — we'll send a code to verify your phone.
        </p>

        <form onSubmit={handleSubmit}>
          <FormInput
            label="Phone number"
            type="tel"
            value={phone}
            onChange={setPhone}
            placeholder="98XXXXXXXX"
            maxLength={10}
            required
          />

          <FormInput
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="At least 8 characters"
            required
          />

          <FormSelect
            label="Blood group"
            value={bloodGroup}
            onChange={setBloodGroup}
            options={BLOOD_GROUPS.map((group) => ({ value: group, label: group }))}
            required
          />

          <FormSelect
            label="City"
            value={cityId}
            onChange={setCityId}
            options={CITIES.map((city) => ({ value: city.id, label: city.name }))}
            required
          />

          {errorMessage && <p className="auth-error">{errorMessage}</p>}

          <SubmitButton isLoading={isLoading}>Send verification code</SubmitButton>
        </form>

        <p className="auth-switch">
          Already have an account? <a href="/login">Log in</a>
        </p>
      </div>
    </main>
  );
}

export default Register;