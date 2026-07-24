import { useState } from "react";
import { C, radius, transition } from "../../ui/theme";

// Field primitives shared by the creation wizard and the edit form, so both
// speak one visual language and neither re-implements inputs.

const fieldLabel = {
  fontSize: 12,
  fontWeight: 600,
  color: C.muted,
  display: "block",
  marginBottom: 7,
};

// A labeled text input / textarea matching the app's `.dash-input` styling.
export function TextField({ label, hint, multiline = false, style, ...rest }) {
  const base = {
    background: C.bgElevated,
    border: `1px solid ${C.border}`,
    borderRadius: radius.sm,
    padding: "10px 12px",
    color: C.text,
    fontSize: 14,
    width: "100%",
    outline: "none",
    fontFamily: "inherit",
    ...style,
  };
  return (
    <label style={{ display: "block" }}>
      {label && <span style={fieldLabel}>{label}</span>}
      {multiline ? (
        <textarea className="dash-input" rows={3} style={{ ...base, resize: "vertical", lineHeight: 1.5 }} {...rest} />
      ) : (
        <input className="dash-input" style={base} {...rest} />
      )}
      {hint && <span style={{ display: "block", fontSize: 11.5, color: C.muted, marginTop: 6 }}>{hint}</span>}
    </label>
  );
}

// A responsive grid of selectable tiles (icon + label). Single- or multi-select.
// `value` is an id (single) or an array of ids (multi).
export function ChoiceGrid({ options, value, onChange, multiple = false, minTile = 150 }) {
  const isSelected = (id) => (multiple ? (value ?? []).includes(id) : value === id);

  function toggle(id) {
    if (!multiple) {
      onChange(value === id ? null : id); // click-again clears (all optional)
      return;
    }
    const set = new Set(value ?? []);
    set.has(id) ? set.delete(id) : set.add(id);
    onChange([...set]);
  }

  return (
    <div
      role={multiple ? "group" : "radiogroup"}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fit, minmax(${minTile}px, 1fr))`,
        gap: 10,
      }}
    >
      {options.map((opt) => (
        <ChoiceTile
          key={opt.id}
          option={opt}
          selected={isSelected(opt.id)}
          multiple={multiple}
          onClick={() => toggle(opt.id)}
        />
      ))}
    </div>
  );
}

function ChoiceTile({ option, selected, multiple, onClick }) {
  const [hover, setHover] = useState(false);
  const { Icon, label } = option;

  return (
    <button
      type="button"
      role={multiple ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        padding: "13px 14px",
        textAlign: "left",
        borderRadius: radius.md,
        cursor: "pointer",
        background: selected ? C.brandDim : hover ? C.panel2 : "transparent",
        border: `1px solid ${selected ? C.brand : C.border}`,
        color: selected ? C.brand : hover ? C.text : C.textDim,
        transition: `background ${transition}, border-color ${transition}, color ${transition}`,
      }}
    >
      {Icon && (
        <span style={{ display: "inline-flex", flexShrink: 0, opacity: selected ? 1 : 0.85 }}>
          <Icon />
        </span>
      )}
      <span style={{ fontSize: 13.5, fontWeight: 600, letterSpacing: "-0.01em", flex: 1 }}>{label}</span>
      {multiple && (
        <span
          aria-hidden="true"
          style={{
            width: 16,
            height: 16,
            flexShrink: 0,
            borderRadius: 5,
            border: `1px solid ${selected ? C.brand : C.border}`,
            background: selected ? C.brand : "transparent",
            color: C.bg,
            fontSize: 11,
            fontWeight: 900,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
          }}
        >
          {selected ? "✓" : ""}
        </span>
      )}
    </button>
  );
}
