import { Link } from "react-router-dom";
import "./LandingPage.css";

const features = [
  {
    number: "01",
    icon: "↗",
    title: "Track Workouts",
    text: "Log every set, repetition and weight without losing your training history.",
  },
  {
    number: "02",
    icon: "⌁",
    title: "Visual Progress",
    text: "Turn your workout history into clear and meaningful progress insights.",
  },
  {
    number: "03",
    icon: "◎",
    title: "Structured Plans",
    text: "Create focused workouts with exercises, sets, reps and schedules.",
  },
  {
    number: "04",
    icon: "⚡",
    title: "Stay Consistent",
    text: "Build better training habits and keep your momentum going.",
  },
];

const muscles = [
  "Chest",
  "Back",
  "Shoulders",
  "Arms",
  "Legs",
  "Core",
];

const technologies = [
  { name: "React", icon: "⚛" },
  { name: "Python", icon: "◆" },
  { name: "Django REST", icon: "◈" },
  { name: "MySQL", icon: "▣" },
  { name: "JWT Auth", icon: "⌁" },
  { name: "REST API", icon: "↗" },
];

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* ================= NAVBAR ================= */}
      <header className="landing-navbar">
        <div className="landing-nav-inner">
          <Link to="/" className="landing-brand">
            <span className="brand-mark">W</span>
            <span>
              Workout <span>Tracker</span>
            </span>
          </Link>

          <nav className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#training">Training</a>
            <a href="#anatomy">Anatomy</a>
            <a href="#technology">Technology</a>
          </nav>

          <div className="landing-nav-actions">
            <Link to="/login" className="landing-login">
              Log in
            </Link>

            <Link to="/register" className="landing-nav-button">
              Get Started
              <span>↗</span>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ================= HERO ================= */}
        <section className="landing-hero">
          <div className="hero-copy">
            <div className="hero-eyebrow">
              <span className="status-dot" />
              SMART FITNESS PLATFORM
            </div>

            <h1>
              TRAIN
              <br />
              SMARTER.
              <br />
              <span>GET STRONGER.</span>
            </h1>

            <p className="hero-text">
              Plan your workouts, track every set and understand your
              progress — all in one powerful fitness platform.
            </p>

            <div className="hero-buttons">
              <Link to="/register" className="primary-cta">
                Start Training
                <span>→</span>
              </Link>

              <a href="#features" className="secondary-cta">
                Explore Features
              </a>
            </div>

            <div className="hero-metrics">
              <div>
                <strong>20+</strong>
                <span>Exercises</span>
              </div>

              <div>
                <strong>100%</strong>
                <span>Personal Data</span>
              </div>

              <div>
                <strong>24/7</strong>
                <span>Access</span>
              </div>
            </div>
          </div>

          {/* HERO VISUAL */}
          <div className="hero-visual">
            <div className="hero-image">
              <img
                src="/gym-trainer.png"
                alt="Trainer motivating an athlete during workout"
              />

              <div className="hero-image-overlay" />
            </div>

            {/* Workout UI */}
            <div className="hero-workout-card">
              <div className="hero-card-top">
                <div>
                  <span className="card-eyebrow">TODAY'S WORKOUT</span>
                  <h3>Upper Body</h3>
                </div>

                <div className="completion-ring">
                  <span>67%</span>
                </div>
              </div>

              <div className="workout-info">
                <span>4 Exercises</span>
                <span>42 Minutes</span>
              </div>

              <div className="hero-exercise completed">
                <div className="exercise-check">✓</div>

                <div className="exercise-details">
                  <strong>Bench Press</strong>
                  <span>Chest · Strength</span>
                </div>

                <div className="exercise-result">
                  <strong>3 × 10</strong>
                  <span>40 kg</span>
                </div>
              </div>

              <div className="hero-exercise completed">
                <div className="exercise-check">✓</div>

                <div className="exercise-details">
                  <strong>Shoulder Press</strong>
                  <span>Shoulders · Strength</span>
                </div>

                <div className="exercise-result">
                  <strong>3 × 12</strong>
                  <span>20 kg</span>
                </div>
              </div>

              <div className="hero-exercise">
                <div className="exercise-number">03</div>

                <div className="exercise-details">
                  <strong>Lat Pulldown</strong>
                  <span>Back · Strength</span>
                </div>

                <div className="exercise-result">
                  <strong>3 × 12</strong>
                  <span>30 kg</span>
                </div>
              </div>

              <div className="hero-progress">
                <div className="progress-label">
                  <span>Workout Progress</span>
                  <strong>67%</strong>
                </div>

                <div className="progress-track">
                  <span />
                </div>
              </div>
            </div>

            {/* Motivation */}
            <div className="motivation-card">
              <div className="motivation-icon">↗</div>

              <div>
                <strong>Keep pushing.</strong>
                <span>Consistency beats intensity.</span>
              </div>
            </div>

            {/* Streak */}
            <div className="streak-card">
              <div className="streak-icon">🔥</div>

              <div>
                <strong>7 DAY STREAK</strong>
                <span>You're on fire</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= STATS ================= */}
        <section className="stats-bar">
          <div>
            <strong>20+</strong>
            <span>Exercises</span>
          </div>

          <div>
            <strong>3</strong>
            <span>Training Categories</span>
          </div>

          <div>
            <strong>JWT</strong>
            <span>Secure Authentication</span>
          </div>

          <div>
            <strong>REST</strong>
            <span>API Architecture</span>
          </div>
        </section>

        {/* ================= TRAINING ================= */}
        <section className="training-section" id="training">
          <div className="training-image">
            <img
              src="/gym-hero.png"
              alt="Athletes training in a gym"
            />

            <div className="training-image-overlay" />

            <div className="image-tag">
              <span />
              STRENGTH TRAINING
            </div>
          </div>

          <div className="training-content">
            <span className="section-eyebrow">
              TRAINING WITHOUT GUESSWORK
            </span>

            <h2>
              YOUR TRAINING.
              <br />
              <span>YOUR WAY.</span>
            </h2>

            <p>
              Build workouts around your goals, available equipment and
              training style. Record every set and keep your progress
              organized.
            </p>

            <div className="training-pills">
              <span>STRENGTH</span>
              <span>CARDIO</span>
              <span>FLEXIBILITY</span>
              <span>PROGRESS</span>
            </div>

            <Link to="/register" className="text-link">
              Create your workout <span>→</span>
            </Link>
          </div>
        </section>

        {/* ================= ANATOMY ================= */}
        <section className="anatomy-section" id="anatomy">
          <div className="anatomy-visual">
            <img
              src="/anatomy.png"
              alt="Realistic 3D human muscle anatomy"
            />

            <div className="anatomy-label anatomy-label-one">
              <span />
              Upper Body
            </div>

            <div className="anatomy-label anatomy-label-two">
              <span />
              Core
            </div>

            <div className="anatomy-label anatomy-label-three">
              <span />
              Lower Body
            </div>
          </div>

          <div className="anatomy-content">
            <span className="section-eyebrow">
              TRAIN WITH PURPOSE
            </span>

            <h2>
              KNOW YOUR BODY.
              <br />
              <span>BUILD YOUR STRENGTH.</span>
            </h2>

            <p>
              Organize exercises by muscle group and build focused
              workouts around the areas you want to train.
            </p>

            <div className="muscle-grid">
              {muscles.map((muscle) => (
                <div className="muscle-card" key={muscle}>
                  <span className="muscle-dot" />
                  {muscle}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= WORKOUT INTELLIGENCE ================= */}
        <section className="intelligence-section">
          <div className="intelligence-copy">
            <span className="section-eyebrow">
              YOUR TRAINING DATA
            </span>

            <h2>
              EVERY WORKOUT
              <br />
              <span>TELLS A STORY.</span>
            </h2>

            <p>
              Your workout history gives you a clear picture of how you
              train. Track completed sessions, training volume, exercises
              and progress from one organized dashboard.
            </p>

            <div className="intelligence-points">
              <div>
                <span className="intelligence-check">✓</span>
                <div>
                  <strong>Workout History</strong>
                  <small>Keep every completed session organized.</small>
                </div>
              </div>

              <div>
                <span className="intelligence-check">✓</span>
                <div>
                  <strong>Exercise Tracking</strong>
                  <small>Record sets, reps, weight and duration.</small>
                </div>
              </div>

              <div>
                <span className="intelligence-check">✓</span>
                <div>
                  <strong>Progress Reports</strong>
                  <small>Understand your training over time.</small>
                </div>
              </div>
            </div>
          </div>

          <div className="intelligence-dashboard">
            <div className="dashboard-header">
              <div>
                <span>TRAINING OVERVIEW</span>
                <strong>This Week</strong>
              </div>

              <span className="dashboard-status">
                ● ACTIVE
              </span>
            </div>

            <div className="dashboard-stats">
              <div>
                <span>WORKOUTS</span>
                <strong>04</strong>
              </div>

              <div>
                <span>VOLUME</span>
                <strong>12.4K</strong>
              </div>

              <div>
                <span>EXERCISES</span>
                <strong>18</strong>
              </div>
            </div>

            <div className="dashboard-chart">
              <div className="chart-grid-line" />
              <div className="chart-grid-line" />
              <div className="chart-grid-line" />

              <div className="dashboard-bars">
                <i style={{ height: "35%" }} />
                <i style={{ height: "52%" }} />
                <i style={{ height: "44%" }} />
                <i style={{ height: "70%" }} />
                <i style={{ height: "61%" }} />
                <i style={{ height: "84%" }} />
                <i style={{ height: "92%" }} />
              </div>
            </div>

            <div className="dashboard-days">
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
              <span>S</span>
            </div>

            <div className="dashboard-footer">
              <span>Weekly training volume</span>
              <strong>+18.4%</strong>
            </div>
          </div>
        </section>

        {/* ================= FEATURES ================= */}
        <section className="features-section" id="features">
          <div className="section-header">
            <span className="section-eyebrow">WHY WORKOUT TRACKER</span>

            <h2>
              Everything you need
              <br />
              <span>to keep moving.</span>
            </h2>

            <p>
              Simple tools for planning, tracking and understanding
              your training.
            </p>
          </div>

          <div className="feature-grid">
            {features.map((feature) => (
              <article className="feature-card" key={feature.number}>
                <div className="feature-top">
                  <div className="feature-icon">{feature.icon}</div>
                  <span>{feature.number}</span>
                </div>

                <h3>{feature.title}</h3>

                <p>{feature.text}</p>

                <div className="feature-line" />
              </article>
            ))}
          </div>
        </section>

        {/* ================= PROGRESS ================= */}
        <section className="progress-section">
          <div className="progress-copy">
            <span className="section-eyebrow">
              MEASURE YOUR PROGRESS
            </span>

            <h2>
              TRAINING DATA
              <br />
              <span>THAT MAKES SENSE.</span>
            </h2>

            <p>
              Your workouts create a history of performance. Use that
              information to understand consistency, training volume and
              long-term improvement.
            </p>

            <Link to="/register" className="primary-cta">
              Start Tracking
              <span>→</span>
            </Link>
          </div>

          <div className="analytics-panel">
            <div className="analytics-top">
              <div>
                <span>WEEKLY VOLUME</span>
                <strong>12,480 kg</strong>
              </div>

              <div className="growth-badge">+18.4%</div>
            </div>

            <div className="fake-chart">
              <div className="chart-lines">
                <span />
                <span />
                <span />
                <span />
              </div>

              <div className="chart-bars">
                <i style={{ height: "42%" }} />
                <i style={{ height: "55%" }} />
                <i style={{ height: "48%" }} />
                <i style={{ height: "67%" }} />
                <i style={{ height: "74%" }} />
                <i style={{ height: "86%" }} />
                <i style={{ height: "94%" }} />
              </div>
            </div>

            <div className="chart-days">
              <span>MON</span>
              <span>TUE</span>
              <span>WED</span>
              <span>THU</span>
              <span>FRI</span>
              <span>SAT</span>
              <span>SUN</span>
            </div>
          </div>
        </section>

        {/* ================= TECHNOLOGY ================= */}
        <section className="technology-section" id="technology">
          <div className="section-header centered">
            <span className="section-eyebrow">
              BUILT AS A FULL-STACK APPLICATION
            </span>

            <h2>
              Modern technology.
              <br />
              <span>Real architecture.</span>
            </h2>

            <p>
              A responsive React frontend connected to a secure Django
              REST backend and relational MySQL database.
            </p>
          </div>

          <div className="technology-grid">
            {technologies.map((technology) => (
              <div className="technology-card" key={technology.name}>
                <span className="technology-icon">
                  {technology.icon}
                </span>

                <span>{technology.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ================= FUTURE ================= */}
        <section className="future-section">
          <div className="future-inner">
            <div>
              <span className="future-badge">NEXT EVOLUTION</span>

              <h2>
                Smarter training
                <br />
                <span>is coming.</span>
              </h2>

              <p>
                The platform is designed to evolve with intelligent
                recommendations, advanced analytics and personalized
                training experiences.
              </p>
            </div>

            <div className="future-features">
              <span>AI Recommendations</span>
              <span>Progressive Overload</span>
              <span>Advanced Analytics</span>
              <span>Personalized Plans</span>
            </div>
          </div>
        </section>

        {/* ================= FINAL CTA ================= */}
        <section className="final-cta">
          <span className="section-eyebrow">READY TO TRAIN?</span>

          <h2>
            STOP GUESSING.
            <br />
            <span>START PROGRESSING.</span>
          </h2>

          <p>
            Build your workout. Track every session. Keep getting better.
          </p>

          <Link to="/register" className="primary-cta large">
            Get Started Free
            <span>↗</span>
          </Link>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="landing-footer">
        <div className="footer-main">
          <div className="footer-brand">
            <Link to="/" className="landing-brand">
              <span className="brand-mark">W</span>
              <span>
                Workout <span>Tracker</span>
              </span>
            </Link>

            <p>
              A modern workout tracking platform built for consistent
              progress.
            </p>
          </div>

          <div className="footer-links">
            <a href="#features">Features</a>
            <a href="#training">Training</a>
            <a href="#anatomy">Anatomy</a>
            <a href="#technology">Technology</a>
          </div>

          <div className="footer-auth">
            <Link to="/login">Log in</Link>
            <Link to="/register">Create account</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Workout Tracker</span>
          <span>React · Django · MySQL</span>
        </div>
      </footer>
    </div>
  );
}