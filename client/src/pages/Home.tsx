import { Link } from "react-router-dom";
import { Heart, Users } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "A request goes out",
    description:
      "Someone in need — or their family — shares the blood type, hospital, and how urgent it is. No account required.",
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
      "Matched donors get notified right away and choose whether they're able to help — no waiting on word of mouth.",
  },
];

function Home() {
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
            Sahayog connects people who need blood with donors nearby —
            so a request doesn't have to travel by luck or word of mouth.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="primary-button">
              Become a donor
            </Link>
            <Link to="/request-blood" className="text-link">
              Request blood now
            </Link>
          </div>
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
          <div className="pulse-stats">
            <div>
              <strong>212</strong>
              <span>lives helped this year</span>
            </div>
            <div>
              <strong>04</strong>
              <span>cities covered so far</span>
            </div>
          </div>
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

      <section className="cta-section">
        <Heart className="cta-icon" size={28} fill="currentColor" strokeWidth={0} />
        <h2>You could be someone's match today.</h2>
        <p>It takes ten minutes to register. It could take one call to matter.</p>
        <Link to="/register" className="cta-button">
          <Users size={17} />
          Join as a donor
        </Link>
      </section>
    </main>
  );
}

export default Home;