import type { Metadata } from "next";
import LandingNav from "@/components/landing/LandingNav";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Methodology — How the ArmTrack Readiness Score Works",
  description:
    "The transparent, literature-informed model behind ArmTrack's daily throwing-readiness score: how pain, soreness, stiffness, and workload combine, why it's a heuristic today, and the roadmap to a data-driven model.",
  alternates: { canonical: "/methodology" },
};

const C = {
  bg: "#F6F7F9",
  panel: "#FFFFFF",
  ink: "#15171C",
  ink2: "#3C424D",
  line: "#E4E7EC",
  blue: "#2E6BFF",
  code: "#EEF1F6",
};

const h2: React.CSSProperties = {
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "-0.01em",
  fontSize: "clamp(20px, 2.6vw, 26px)",
  margin: "44px 0 12px",
  color: C.ink,
};
const p: React.CSSProperties = { fontSize: 16.5, lineHeight: 1.7, color: C.ink2, margin: "0 0 16px" };
const pre: React.CSSProperties = {
  background: C.code,
  border: `1px solid ${C.line}`,
  borderRadius: 12,
  padding: "16px 18px",
  fontSize: 13.5,
  lineHeight: 1.6,
  overflowX: "auto",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  color: C.ink,
  margin: "0 0 18px",
};

export default function MethodologyPage() {
  return (
    <div style={{ position: "relative", minHeight: "100vh", background: C.bg, color: C.ink, fontFamily: "Inter, system-ui, sans-serif" }}>
      <LandingNav />

      <article style={{ maxWidth: 760, margin: "0 auto", padding: "24px 24px 70px" }}>
        <p className="font-display" style={{ color: C.blue, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", fontSize: 13, margin: "0 0 14px" }}>
          White paper
        </p>
        <h1 className="font-display" style={{ fontWeight: 700, fontSize: "clamp(30px, 5vw, 46px)", lineHeight: 1.08, letterSpacing: "-0.02em", margin: "0 0 16px" }}>
          How the ArmTrack readiness score works
        </h1>
        <p style={{ color: C.ink2, fontSize: 15, margin: "0 0 8px" }}>
          A transparent, literature-informed model for estimating daily throwing readiness in youth baseball — and an honest path to a data-driven system.
        </p>
        <p style={{ color: C.ink2, fontSize: 13.5, margin: 0 }}>By Milan Chauhan · ArmTrack · armtrack.app</p>

        <hr style={{ border: "none", borderTop: `1px solid ${C.line}`, margin: "28px 0" }} />

        <h2 style={h2}>Abstract</h2>
        <p style={p}>
          Arm injuries in youth baseball are common, costly, and substantially preventable: a large share
          trace to cumulative overuse rather than a single acute event, yet most young players track nothing
          day to day. ArmTrack converts a sub-60-second daily self-report — pain, soreness, stiffness, and
          throwing workload — into an interpretable readiness score (0–10) and a plain-language throwing
          recommendation, and aggregates a team&apos;s scores into one coach view. This paper documents the v1
          model: a transparent, weighted, evidence-informed scoring function with workload- and trend-based
          modifiers, chosen deliberately over a black-box model because at zero user data, interpretability
          and clinical defensibility matter more than predictive complexity.
        </p>

        <h2 style={h2}>1. The problem</h2>
        <p style={p}>
          Overuse-pattern arm injuries — including UCL tears requiring &quot;Tommy John&quot; reconstruction —
          have risen sharply among adolescents, with a large fraction of cases concentrated in the 15–19 age
          band, and fatigue is a well-documented amplifier of risk. The actionable gap is visibility: the
          early signal (rising soreness, incomplete recovery, climbing workload) is available daily but
          uncaptured. ArmTrack&apos;s thesis is that a frictionless daily measurement, surfaced as one number a
          player and coach will actually look at, can shift behavior earlier than pitch-count-at-the-game tools
          that miss the bullpens, lessons, and long-toss that make up most arm stress.
        </p>

        <h2 style={h2}>2. Design principles</h2>
        <p style={p}>
          <strong style={{ color: C.ink }}>Interpretability over opacity.</strong> With no training data, a
          learned model would be unvalidated and unexplainable to a 13-year-old or a parent. A transparent
          weighted model can be reasoned about, audited, and trusted.<br />
          <strong style={{ color: C.ink }}>Frictionless input.</strong> Three 0–10 self-reports and a throw
          count — daily adherence beats sensor precision nobody sustains.<br />
          <strong style={{ color: C.ink }}>Conservative and non-diagnostic.</strong> The score is explicitly
          estimated readiness, never a medical claim; it never says &quot;do not throw,&quot; only
          &quot;throwing not recommended,&quot; and always defers to a coach, trainer, or physician.
        </p>

        <h2 style={h2}>3. The model</h2>
        <p style={p}><strong style={{ color: C.ink }}>3.1 Per-log base score.</strong> Each daily log yields a base score from three signals, weighted by their hypothesized association with tissue stress (pain highest):</p>
        <pre style={pre}>{`weighted  = (pain·3 + soreness·2 + stiffness·1) / 6     # each ∈ [0,10]
baseScore = clamp(10 − weighted, 0, 10)                # higher = more ready`}</pre>
        <p style={p}>
          Pain is weighted 3×, soreness 2×, stiffness 1× — encoding the clinical prior that sharp, located
          pain is a stronger warning than general stiffness.
        </p>
        <p style={p}><strong style={{ color: C.ink }}>3.2 Workload &amp; trend modifiers.</strong> The estimate adjusts the latest base score for cumulative load and direction of travel — the overuse signals a single day misses:</p>
        <pre style={pre}>{`score = baseScore(latest)
  − 0.5  if latest throws > 100                 # high single-day volume
  − 0.5  if last two logs both > 75 throws      # back-to-back heavy load
  − 0.5  if pain rose across the last 3 logs    # rising-pain trend
score = clamp(score, 0, 10)`}</pre>
        <p style={p}><strong style={{ color: C.ink }}>3.3 Banding.</strong> The continuous score maps to six interpretable states with position-aware recommendations:</p>
        <div style={{ overflowX: "auto", margin: "0 0 18px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14.5 }}>
            <thead>
              <tr style={{ textAlign: "left", color: C.ink2 }}>
                <th style={{ padding: "8px 10px", borderBottom: `1px solid ${C.line}` }}>Score</th>
                <th style={{ padding: "8px 10px", borderBottom: `1px solid ${C.line}` }}>State</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["≥ 8.5", "Ready", "#10B981"],
                ["7.0 – 8.4", "Good to Go", "#10B981"],
                ["5.5 – 6.9", "Proceed with Caution", "#F59E0B"],
                ["4.0 – 5.4", "Light Day", "#F59E0B"],
                ["2.0 – 3.9", "Rest Recommended", "#EF4444"],
                ["< 2.0", "Throwing Not Recommended", "#EF4444"],
              ].map(([range, label, color]) => (
                <tr key={label}>
                  <td style={{ padding: "8px 10px", borderBottom: `1px solid ${C.line}`, fontVariantNumeric: "tabular-nums" }}>{range}</td>
                  <td style={{ padding: "8px 10px", borderBottom: `1px solid ${C.line}`, color, fontWeight: 600 }}>{label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={p}>
          <strong style={{ color: C.ink }}>3.4 Supporting signals.</strong> The system also computes a
          consecutive-day logging streak (adherence) and a staleness guard (readiness older than two days is
          flagged as not reflecting &quot;today&quot;), and surfaces up to two prioritized insights
          (concerning before positive).
        </p>

        <h2 style={h2}>4. Why not machine learning yet?</h2>
        <p style={p}>
          A supervised model predicting injury would need labeled outcomes — who got hurt, when — across many
          athlete-seasons, data that does not exist at launch and is ethically and practically slow to collect
          for minors. Deploying an unvalidated black box for an injury-adjacent decision would be
          irresponsible. The v1 heuristic is the correct cold-start choice: safe, explainable, and good enough
          to drive the behavior change — daily attention — that is itself the primary intervention.
        </p>

        <h2 style={h2}>5. Validation plan</h2>
        <p style={p}>
          As data accrues: (1) measure adherence and self-report reliability; (2) test construct validity —
          does the score track behavior (rest taken after low scores) and &quot;felt-off&quot; days; (3) test
          predictive validity longitudinally — do declining trajectories lead reported pain spikes; (4)
          calibrate the band thresholds against observed outcomes.
        </p>

        <h2 style={h2}>6. Roadmap to a learned model</h2>
        <p style={p}>
          The transparent scorecard becomes the baseline and safety rail for a data-driven successor:
          re-fit feature weights and band cutoffs to data (logistic/ordinal models, keeping interpretability);
          add acute:chronic workload ratio (ACWR) and exponentially-weighted load features; personalize via
          per-athlete baselines (hierarchical models); and, once trajectories are rich, evaluate time-series
          methods — always benchmarked against, and constrained by, the explainable baseline that earns user
          trust.
        </p>

        <h2 style={h2}>7. Limitations</h2>
        <p style={p}>
          Subjective self-report is noisy and gameable; the v1 weights and modifiers are expert priors, not
          empirically fit; the score is not a medical device and does not diagnose, treat, or prevent injury.
          The model&apos;s value at this stage is behavioral — it makes the invisible visible daily — with
          predictive rigor as an explicit, staged goal.
        </p>

        <h2 style={h2}>8. Conclusion</h2>
        <p style={p}>
          ArmTrack v1 is a deliberately transparent, literature-informed readiness model shipped in a free
          iOS/web product for a population where overuse injury is common and largely preventable. Its
          contribution is not algorithmic novelty but the discipline to make a defensible daily measurement
          frictionless and usable — and a clear, honest path from an explainable cold-start heuristic to a
          validated, data-driven system.
        </p>

        <hr style={{ border: "none", borderTop: `1px solid ${C.line}`, margin: "32px 0 18px" }} />
        <p style={{ fontSize: 13, lineHeight: 1.6, color: C.ink2, margin: 0 }}>
          Informed by USA Baseball / MLB Pitch Smart guidance and published work on pitching fatigue and
          adolescent UCL injury. ArmTrack provides estimated readiness based on self-reported data; it is not
          medical advice and is not a substitute for a coach, athletic trainer, or physician.
        </p>
      </article>

      <Footer />
    </div>
  );
}
