import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";
import { FormInput, FormSelect, SubmitButton } from "../components/FormElements";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const URGENCY_LEVELS = [
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const RELATIONSHIPS = [
  { value: "self", label: "Self" },
  { value: "family", label: "Family" },
  { value: "friend", label: "Friend" },
  { value: "guardian", label: "Guardian" },
  { value: "other", label: "Other" },
];

interface CityOption {
  id: string;
  name: string;
}

interface HospitalOption {
  id: string;
  name: string;
  city_id: string;
}

function RequestBlood() {
  const [bloodGroupNeeded, setBloodGroupNeeded] = useState("");
  const [unitsNeeded, setUnitsNeeded] = useState("1");
  const [cityId, setCityId] = useState("");
  const [hospitalId, setHospitalId] = useState("");
  const [requesterName, setRequesterName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [relationshipToPatient, setRelationshipToPatient] = useState("");
  const [urgency, setUrgency] = useState("normal");
  const [cities, setCities] = useState<CityOption[]>([]);
  const [hospitals, setHospitals] = useState<HospitalOption[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(true);
  const [isLoadingHospitals, setIsLoadingHospitals] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successData, setSuccessData] = useState<{ id: string } | null>(null);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await api.get("/cities");
        setCities(response.data?.cities ?? []);
      } catch (error: any) {
        setErrorMessage(
          error.response?.data?.error?.message ?? "Unable to load cities right now. Please refresh the page."
        );
      } finally {
        setIsLoadingCities(false);
      }
    };

    fetchCities();
  }, []);

  useEffect(() => {
    if (!cityId) {
      setHospitals([]);
      setHospitalId("");
      return;
    }

    const fetchHospitals = async () => {
      setIsLoadingHospitals(true);
      setErrorMessage("");

      try {
        const response = await api.get("/hospitals", {
          params: { cityId },
        });
        setHospitals(response.data?.hospitals ?? []);
        setHospitalId("");
      } catch (error: any) {
        setHospitals([]);
        setErrorMessage(
          error.response?.data?.error?.message ?? "Unable to load hospitals right now. Please refresh the page."
        );
      } finally {
        setIsLoadingHospitals(false);
      }
    };

    fetchHospitals();
  }, [cityId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await api.post("/blood-requests", {
        bloodGroupNeeded,
        unitsNeeded: Number(unitsNeeded),
        hospitalId,
        cityId,
        requesterName,
        contactPhone,
        relationshipToPatient,
        urgency,
      });

      setSuccessData({ id: response.data.bloodRequest?.id ?? "" });
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.error?.message ?? "Failed to submit request. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (successData) {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <h1>Request sent</h1>
          <p className="auth-subtitle">
            Nearby donors are being notified now. Keep your phone close —
            someone may call or respond soon.
          </p>
          {successData.id && (
            <p className="auth-subtitle">
              Reference ID: <strong>{successData.id}</strong>
            </p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Request blood</h1>
        <p className="auth-subtitle">
          No account needed. Fill this out and nearby donors will be notified.
        </p>

        <form onSubmit={handleSubmit}>
          <FormSelect
            label="Blood group needed"
            value={bloodGroupNeeded}
            onChange={setBloodGroupNeeded}
            options={BLOOD_GROUPS.map((g) => ({ value: g, label: g }))}
            required
          />

          <FormInput
            label="Units needed"
            type="number"
            value={unitsNeeded}
            onChange={setUnitsNeeded}
            required
          />

          <FormSelect
            label="City"
            value={cityId}
            onChange={(val) => {
              setCityId(val);
              setHospitalId("");
            }}
            options={cities.map((c) => ({ value: c.id, label: c.name }))}
            placeholder={isLoadingCities ? "Loading cities..." : "Select a city"}
            required
          />

          <FormSelect
            label="Hospital"
            value={hospitalId}
            onChange={setHospitalId}
            options={hospitals.map((h) => ({ value: h.id, label: h.name }))}
            placeholder={
              cityId
                ? isLoadingHospitals
                  ? "Loading hospitals..."
                  : "Select a hospital"
                : "Select a city first"
            }
            required
          />

          <FormInput
            label="Your name"
            value={requesterName}
            onChange={setRequesterName}
            required
          />

          <FormInput
            label="Contact phone"
            type="tel"
            value={contactPhone}
            onChange={setContactPhone}
            maxLength={10}
            required
          />

          <FormSelect
            label="Relationship to patient"
            value={relationshipToPatient}
            onChange={setRelationshipToPatient}
            options={RELATIONSHIPS}
            required
          />

          <FormSelect
            label="Urgency"
            value={urgency}
            onChange={setUrgency}
            options={URGENCY_LEVELS}
            required
          />

          {errorMessage && <p className="auth-error">{errorMessage}</p>}

          <SubmitButton isLoading={isLoading}>Send request</SubmitButton>
        </form>
      </div>
    </main>
  );
}

export default RequestBlood;