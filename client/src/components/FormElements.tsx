import { useId, useState } from "react";
import type { ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";

interface FormInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
}

export function FormInput({
  label,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  required,
  maxLength,
}: FormInputProps) {
  const id = useId();
  const [showPassword, setShowPassword] = useState(false);

  // Password boxes get an eye button to show or hide what was typed
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="form-field">
      <label className="form-label" htmlFor={id}>
        {label}
      </label>

      <div className={isPassword ? "form-input-wrap" : undefined}>
        <input
          id={id}
          className={`form-input ${error ? "form-input-error" : ""} ${isPassword ? "form-input-padded" : ""}`}
          type={inputType}
          value={value}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
        />

        {isPassword && (
          <button
            type="button"
            className="form-eye"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        )}
      </div>

      {error && <span className="form-error">{error}</span>}
    </div>
  );
}

interface Option {
  value: string;
  label: string;
}

interface FormSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  error?: string;
  placeholder?: string;
  required?: boolean;
}

export function FormSelect({
  label,
  value,
  onChange,
  options,
  error,
  placeholder = "Select an option",
  required,
}: FormSelectProps) {
  const id = useId();

  return (
    <div className="form-field">
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className={`form-input ${error ? "form-input-error" : ""}`}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}

interface SubmitButtonProps {
  isLoading?: boolean;
  children: ReactNode;
}

export function SubmitButton({ isLoading, children }: SubmitButtonProps) {
  return (
    <button type="submit" className="primary-button form-submit" disabled={isLoading}>
      {isLoading ? "Please wait..." : children}
    </button>
  );
}