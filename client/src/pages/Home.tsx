import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const steps = [
  {
    number: "01",
    title: "A request goes out",
    description:
      "Someone in need, or their family, shares the blood type, hospital, and how urgent it is. No account required.",
  },
  {
    number: "02",
    title: "Sahayog finds who's close",
    description:
      "We check compatibility, availability, and distance to find donors who can realistically make it in time.",
  },
  {
    number: "03",
    title: "A donor responds",
    description:
      "Matched donors get notified right away and choose whether they're able to help, with no waiting on word of mouth.",
  },
];

const ways = [
  {
    title: "Urgent requests",
    description:
      "Anyone can post a request without an account. Matching donors nearby are notified straight away.",
  },
  {
    title: "Planned camps",
    description:
      "Organisers hold donation camps on set days. Donors register ahead, so hospitals can plan around who is coming.",
  },
  {
    title: "A stock board",
    description:
      "Hospitals confirm their blood stock by group, and each entry shows when it was last confirmed.",
  },
];

const pad = (value: number) => String(value).padStart(2, "0");

// The home page explains Sahayog. Getting around is the navbar's job, so the only
// button here is the one action the navbar doesn't offer: asking for blood.
function Home() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // Real numbers from the public API instead of made-up figures
  const [counts, setCounts] = useState<{ cities: number; hospitals: number } | null>(null);

  useEffect(() => {
    Promise.all([api.get("/cities"), api.get("/hospitals")])
      .then(([cities, hospitals]) =>
        setCounts({
          cities: (cities.data.cities ?? []).length,
          hospitals: (hospitals.data.hospitals ?? []).length,
        })
      )
      .catch(() => {
        /* the stats simply stay hidden */
      });
  }, []);

  const showStats = counts !== null && (counts.cities > 0 || counts.hospitals > 0);

  return (
    <main>
      <section className="hero-section">
        <div className="hero-content">
          <p className="hero-kicker">Sahayog · blood donor network</p>

          <h1>
            Someone needs blood.
            <br />
            <em>Minutes matter.</em>
          </h1>

          <p className="hero-lede">
            Sahayog connects people who need blood with donors nearby, so a request
            doesn't have to travel by luck or word of mouth.
          </p>

          {!isAdmin && (
            <div className="hero-actions">
              <Link to="/request-blood" className="primary-button">
                Request blood now
              </Link>
            </div>
          )}
        </div>

        <div className="hero-pulse" aria-hidden="true">
          <svg viewBox="0 0 400 120" className="pulse-line">
            <path
              d="M0,60 L110,60 L130,20 L150,100 L170,60 L400,60"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="pulse-dot" />

          {showStats && (
            <div className="pulse-stats">
              <div>
                <strong>{pad(counts.cities)}</strong>
                <span>cities covered</span>
              </div>
              <div>
                <strong>{pad(counts.hospitals)}</strong>
                <span>hospitals on the network</span>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="process-section">
        <div className="process-heading">
          <h2>From request to donor, without the waiting.</h2>
        </div>

        <ol className="process-list">
          {steps.map((step) => (
            <li key={step.number} className="process-row">
              <span className="process-number">{step.number}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="ways-section" aria-labelledby="ways-heading">
        <div className="ways-heading">
          <h2 id="ways-heading">Urgent requests, planned camps.</h2>
          <p>
            Requests find a donor when someone needs blood right now. Camps keep
            hospital stock healthy, so fewer emergencies start from an empty shelf.
          </p>
        </div>

        <div className="ways-grid">
          {ways.map((way) => (
            <article key={way.title} className="way-card">
              <h3>{way.title}</h3>
              <p>{way.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Home;