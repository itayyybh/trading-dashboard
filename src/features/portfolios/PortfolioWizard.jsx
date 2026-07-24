import Modal from "../../ui/Modal";
import StepWizard from "../../ui/StepWizard";
import { C } from "../../ui/theme";
import { TextField, ChoiceGrid } from "./fields";
import { ASSET_CLASSES, ASSET_CLASS_BY_ID, PLATFORMS, PLATFORM_BY_ID } from "./constants";

// The portfolio creation flow: a thin composition of the generic StepWizard.
// Only the name is required; asset class and platforms are optional and
// skippable, keeping the fast path fast. Preferred platforms are a HINT for the
// import step, never a restriction — auto-detection is untouched.
export default function PortfolioWizard({ onCreate, onClose }) {
  const steps = [
    {
      id: "name",
      title: "Name your portfolio",
      caption: "A clear name you'll recognize at a glance — you can rename it later.",
      validate: (d) => (d.name?.trim() ? null : "Give your portfolio a name to continue."),
      render: ({ data, setField }) => (
        <TextField
          autoFocus
          label="Portfolio name"
          placeholder="e.g. Personal Account, Futures Account, Swing Portfolio"
          value={data.name ?? ""}
          onChange={(e) => setField("name", e.target.value)}
          maxLength={80}
        />
      ),
    },
    {
      id: "asset",
      title: "What do you mainly trade?",
      caption: "Optional — this gives the portfolio an identity. You can change or skip it.",
      optional: true,
      render: ({ data, setField }) => (
        <ChoiceGrid
          options={ASSET_CLASSES}
          value={data.asset_class ?? null}
          onChange={(v) => setField("asset_class", v)}
        />
      ),
    },
    {
      id: "platforms",
      title: "Where do you import trades from?",
      caption:
        "Optional, and multiple are fine. This only sets your default import source — you can always import from any platform.",
      optional: true,
      render: ({ data, setField }) => (
        <ChoiceGrid
          multiple
          options={PLATFORMS}
          value={data.preferred_platforms ?? []}
          onChange={(v) => setField("preferred_platforms", v)}
        />
      ),
    },
    {
      id: "review",
      title: "Ready to create?",
      caption: "A quick look before we set it up.",
      render: ({ data }) => <ReviewSummary data={data} />,
    },
  ];

  return (
    <Modal width={500} onClose={onClose} labelledBy="portfolio-wizard-title">
      <StepWizard
        steps={steps}
        eyebrow="New portfolio"
        submitLabel="Create portfolio"
        onComplete={onCreate}
        onCancel={onClose}
        initialData={{ name: "", asset_class: null, preferred_platforms: [] }}
        labelledBy="portfolio-wizard-title"
      />
    </Modal>
  );
}

// Calm, boxless summary — label/value rows separated by whitespace and hairline
// dividers rather than cards.
function ReviewSummary({ data }) {
  const asset = data.asset_class ? ASSET_CLASS_BY_ID[data.asset_class] : null;
  const platforms = (data.preferred_platforms ?? []).map((id) => PLATFORM_BY_ID[id]).filter(Boolean);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <ReviewRow label="Portfolio name" first>
        <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{data.name?.trim() || "—"}</span>
      </ReviewRow>

      <ReviewRow label="Asset class">
        {asset ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: C.text, fontWeight: 600 }}>
            <span style={{ display: "inline-flex", color: C.brand }}>
              <asset.Icon />
            </span>
            {asset.label}
          </span>
        ) : (
          <Muted>Not set</Muted>
        )}
      </ReviewRow>

      <ReviewRow label="Preferred platforms">
        {platforms.length ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {platforms.map((p) => (
              <span
                key={p.id}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.text,
                }}
              >
                <span style={{ display: "inline-flex", color: C.brand }}>
                  <p.Icon width="16" height="16" />
                </span>
                {p.label}
              </span>
            ))}
          </div>
        ) : (
          <Muted>Decide at each import</Muted>
        )}
      </ReviewRow>
    </div>
  );
}

function ReviewRow({ label, first, children }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        padding: "14px 0",
        borderTop: first ? "none" : `1px solid ${C.borderSoft}`,
      }}
    >
      <span style={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", color: C.muted, fontWeight: 600 }}>
        {label}
      </span>
      {children}
    </div>
  );
}

function Muted({ children }) {
  return <span style={{ fontSize: 13.5, color: C.muted }}>{children}</span>;
}
