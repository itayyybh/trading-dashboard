import { useMemo, useState } from "react";
import { C, radius, space, transition, label as labelStyle } from "./theme";
import Button from "./Button";

// A generic, reusable multi-step flow. It owns step navigation, shared form
// state, per-step validation, a progress indicator and keyboard handling — but
// knows NOTHING about what it's collecting. Consumers pass `steps` and render
// their own body per step. Reused for portfolio creation today; onboarding,
// broker connection, strategy setup tomorrow.
//
// steps: Array<{
//   id:       string
//   title:    string                     // the step's own heading/question
//   caption?: string                     // optional sub-line under the title
//   optional?: boolean                   // shows a "Skip" affordance
//   validate?: (data) => string | null   // return an error message to block advancing
//   render:   (ctx) => ReactNode         // ctx: { data, setField, setData, next, back }
// }>
//
// props:
//   eyebrow      — small label above the title (e.g. "New portfolio")
//   submitLabel  — CTA text on the final step (default "Finish")
//   onComplete   — (data) => Promise|void, called on final step
//   onCancel     — closes the flow
//   initialData  — seed the shared form state (used for resume/edit)
export default function StepWizard({
  steps,
  eyebrow,
  submitLabel = "Finish",
  onComplete,
  onCancel,
  initialData = {},
  labelledBy,
}) {
  const [index, setIndex] = useState(0);
  const [data, setData] = useState(initialData);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  const step = steps[index];
  const isFirst = index === 0;
  const isLast = index === steps.length - 1;

  const ctx = useMemo(
    () => ({
      data,
      setField: (key, value) => setData((prev) => ({ ...prev, [key]: value })),
      setData,
      next: goNext,
      back: goBack,
    }),
    // goNext/goBack are stable enough for our use; data drives re-render.
    [data] // eslint-disable-line react-hooks/exhaustive-deps
  );

  function goBack() {
    setError(null);
    setIndex((i) => Math.max(0, i - 1));
  }

  function validateCurrent() {
    const msg = step.validate?.(data) ?? null;
    setError(msg);
    return !msg;
  }

  async function goNext() {
    if (!validateCurrent()) return;
    if (isLast) {
      setPending(true);
      try {
        await onComplete?.(data);
      } catch (e) {
        setError(e.message);
        setPending(false);
      }
      return;
    }
    setError(null);
    setIndex((i) => Math.min(steps.length - 1, i + 1));
  }

  function skip() {
    setError(null);
    setIndex((i) => Math.min(steps.length - 1, i + 1));
  }

  // Enter advances (unless focus is in a textarea, where Enter means newline).
  function onKeyDown(e) {
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
      e.preventDefault();
      goNext();
    }
  }

  return (
    <div onKeyDown={onKeyDown} style={{ padding: 24, display: "flex", flexDirection: "column", gap: space.xl }}>
      {/* Progress: segmented bar + "Step X of N" — quiet, no numbered circles */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ ...labelStyle, color: C.brand }}>{eyebrow}</span>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
          >
            Esc
          </button>
        </div>
        <SegmentedProgress count={steps.length} index={index} />
        <span style={{ fontSize: 11.5, color: C.muted, fontWeight: 600 }}>
          Step {index + 1} of {steps.length}
        </span>
      </div>

      {/* Step heading */}
      <div>
        <h2
          id={labelledBy}
          style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", margin: 0, color: C.text }}
        >
          {step.title}
        </h2>
        {step.caption && (
          <p style={{ fontSize: 13, color: C.muted, margin: "6px 0 0", lineHeight: 1.5 }}>{step.caption}</p>
        )}
      </div>

      {/* Step body */}
      <div>{step.render(ctx)}</div>

      {error && <div style={{ color: C.red, fontSize: 12.5, marginTop: -8 }}>{error}</div>}

      {/* Footer navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 4 }}>
        <div>
          {!isFirst && (
            <Button variant="ghost" size="sm" onClick={goBack} disabled={pending}>
              ← Back
            </Button>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {step.optional && !isLast && (
            <Button variant="ghost" size="sm" onClick={skip} disabled={pending}>
              Skip
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={goNext} disabled={pending}>
            {isLast ? (pending ? "…" : submitLabel) : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// A thin bar split into `count` segments; segments up to and including the
// active one are brand-filled, the rest are quiet. Communicates position
// without the visual weight of numbered circles.
function SegmentedProgress({ count, index }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: 3,
            borderRadius: radius.pill,
            background: i <= index ? C.brand : C.border,
            transition: `background ${transition}`,
          }}
        />
      ))}
    </div>
  );
}
