import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { FormInput, SubmitButton } from "../components/FormElements";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", { phone, password });
      const { user, accessToken, refreshToken } = response.data;

      login(accessToken, refreshToken, user);
      navigate("/dashboard");
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.error?.message ?? "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="auth-subtitle">Log in to respond to nearby requests.</p>

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
            required
          />

          {errorMessage && <p className="auth-error">{errorMessage}</p>}

          <SubmitButton isLoading={isLoading}>Log in</SubmitButton>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Become a donor</Link>
        </p>
      </div>
    </main>
  );
}

export default Login;