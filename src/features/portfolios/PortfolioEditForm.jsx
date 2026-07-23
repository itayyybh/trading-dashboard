import { useState } from "react";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import { C, space } from "../../ui/theme";
import { TextField, ChoiceGrid } from "./fields";
import { ASSET_CLASSES, PLATFORMS } from "./constants";

// Full metadata editor. Reuses the wizard's field components and design
// language so creating and editing feel like one product. Only the name is
// required; everything else is optional.
export default function PortfolioEditForm({ portfolio, onSave, onClose }) {
  const [values, setValues] = useState({
    name: portfolio.name ?? "",
    asset_class: portfolio.asset_class ?? null,
    preferred_platforms: portfolio.preferred_platforms ?? [],
    description: portfolio.description ?? "",
  });
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  const setField = (key, value) => setValues((prev) => ({ ...prev, [key]: value }));

  async function submit(e) {
    e.preventDefault();
    if (!values.name.trim()) {
      setError("Give your portfolio a name.");
      return;
    }
    setError(null);
    setPending(true);
    try {
      await onSave(values);
    } catch (err) {
      setError(err.message);
      setPending(false);
    }
  }

  return (
    <Modal width={500} onClose={onClose} labelledBy="portfolio-edit-title">
      <form onSubmit={submit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: space.xl }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 id="portfolio-edit-title" style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
            Edit portfolio
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
          >
            Esc
          </button>
        </div>

        <TextField
          autoFocus
          label="Portfolio name"
          value={values.name}
          onChange={(e) => setField("name", e.target.value)}
          maxLength={80}
        />

        <Field label="Asset class">
          <ChoiceGrid
            options={ASSET_CLASSES}
            value={values.asset_class}
            onChange={(v) => setField("asset_class", v)}
            minTile={130}
          />
        </Field>

        <Field label="Preferred platforms">
          <ChoiceGrid
            multiple
            options={PLATFORMS}
            value={values.preferred_platforms}
            onChange={(v) => setField("preferred_platforms", v)}
          />
        </Field>

        <TextField
          label="Description"
          multiline
          placeholder="Optional — strategy, rules, or notes for this account."
          value={values.description}
          onChange={(e) => setField("description", e.target.value)}
          maxLength={500}
        />

        {error && <div style={{ color: C.red, fontSize: 12.5, marginTop: -8 }}>{error}</div>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={pending}>
            {pending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <span style={{ fontSize: 12, fontWeight: 600, color: C.muted, display: "block", marginBottom: 9 }}>{label}</span>
      {children}
    </div>
  );
}
