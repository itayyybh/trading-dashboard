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
      {portfolios.map((p) => (
        <div key={p.id} style={{ display: "flex", alignItems: "center" }}>
          <button
            onClick={() => onSelect(p.id)}
            style={{
              padding: "7px 16px", borderRadius: 20, border: `1px solid ${activeId === p.id ? C.accent : C.border}`,
              background: activeId === p.id ? C.accentDim : "transparent",
              color: activeId === p.id ? C.accent : C.muted,
              fontSize: 12, fontWeight: 600, cursor: "pointer", letterSpacing: 0.5,
            }}
          >
            {p.name}
          </button>
          <button
            onClick={() => onDelete(p.id)}
            title={`Delete ${p.name}`}
            style={{ marginLeft: -6, background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 14, padding: "0 8px 0 2px" }}
          >
            ×
          </button>
        </div>
      ))}

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
