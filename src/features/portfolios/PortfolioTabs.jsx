import { useState } from "react";
import { C } from "../trades/constants";

export default function PortfolioTabs({ portfolios, activeId, onSelect, onCreate, onDelete }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);

  async function submitNew(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setPending(true);
    await onCreate(name.trim());
    setPending(false);
    setName("");
    setAdding(false);
  }

  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
      {portfolios.map((p) => {
        const active = activeId === p.id;
        const tone = active ? C.accent : C.muted;
        return (
          <div
            key={p.id}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "5px 6px 5px 16px", borderRadius: 20,
              border: `1px solid ${active ? C.accent : C.border}`,
              background: active ? C.accentDim : "transparent",
            }}
          >
            <button
              onClick={() => onSelect(p.id)}
              style={{
                background: "transparent", border: "none", padding: 0,
                color: tone, fontSize: 12, fontWeight: 600, cursor: "pointer", letterSpacing: 0.5,
              }}
            >
              {p.name}
            </button>
            <button
              onClick={() => onDelete(p.id)}
              title={`Delete ${p.name}`}
              style={{
                background: "transparent", border: "none", cursor: "pointer",
                color: tone, opacity: 0.7, fontSize: 14, lineHeight: 1, padding: "2px 6px",
              }}
            >
              ×
            </button>
          </div>
        );
      })}

      {adding ? (
        <form onSubmit={submitNew} style={{ display: "flex", gap: 6 }}>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Portfolio name"
            style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 20, padding: "6px 12px", color: C.text, fontSize: 12 }}
          />
          <button
            type="submit"
            disabled={pending}
            style={{ padding: "7px 14px", borderRadius: 20, border: `1px solid ${C.accent}`, background: C.accentDim, color: C.accent, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
          >
            {pending ? "…" : "Add"}
          </button>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          style={{ padding: "7px 16px", borderRadius: 20, border: `1px dashed ${C.border}`, background: "transparent", color: C.muted, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
        >
          + New portfolio
        </button>
      )}
    </div>
  );
}
