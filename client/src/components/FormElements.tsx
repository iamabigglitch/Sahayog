import type { ReactNode } from "react";

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
  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      <input
        className={`form-input ${error ? "form-input-error" : ""}`}
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
      />
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
  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      <select
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