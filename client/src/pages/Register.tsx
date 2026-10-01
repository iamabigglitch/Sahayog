import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { FormInput, FormSelect, SubmitButton } from "../components/FormElements";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

interface CityOption {
  id: string;
  name: string;
}

function Register() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [cityId, setCityId] = useState("");
  const [cities, setCities] = useState<CityOption[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await api.get("/cities");
        const cityList = response.data?.cities ?? [];
        setCities(cityList);
      } catch (error: any) {
        const message =
          error.response?.data?.error?.message ??
          "Unable to load cities right now. Please refresh the page.";
        setErrorMessage(message);
      } finally {
        setIsLoadingCities(false);
      }
    };

    fetchCities();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await api.post("/auth/register", {
        phone,
        password,
        bloodGroup,
        cityId,
      });

      const devOtp = response.data?.otp;

      navigate("/verify-otp", {
        state: { phone, password, bloodGroup, cityId, devOtp },
      });
    } catch (error: any) {
      const backendMessage =
        error.response?.data?.error?.message ??
        error.response?.data?.message ??
        error.message ??
        "Registration failed. Please try again.";

      setErrorMessage(backendMessage);
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
            options={cities.map((city) => ({ value: city.id, label: city.name }))}
            placeholder={isLoadingCities ? "Loading cities..." : "Select your city"}
            required
          />

          {errorMessage && <p className="auth-error">{errorMessage}</p>}

          <SubmitButton isLoading={isLoading || isLoadingCities}>Send verification code</SubmitButton>
        </form>

        <p className="auth-switch">
          Already have an account? <a href="/login">Log in</a>
        </p>
      </div>
    </main>
  );
}

export default Register;