import { useState } from "react";
import { C, radius } from "../../ui/theme";
import Button from "../../ui/Button";
import { useLocale } from "../../lib/i18n/LocaleContext";

export default function PortfolioTabs({ portfolios, activeId, onSelect, onCreate, onDelete }) {
  const { t } = useLocale();
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
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
      {portfolios.map((p) => {
        const active = activeId === p.id;
        return (
          <div
            key={p.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              padding: "4px 4px 4px 14px",
              borderRadius: radius.pill,
              border: `1px solid ${active ? C.brand : C.border}`,
              background: active ? C.brandDim : "transparent",
              transition: "background 150ms, border-color 150ms",
            }}
          >
            <button
              onClick={() => onSelect(p.id)}
              style={{
                background: "transparent",
                border: "none",
                padding: 0,
                color: active ? C.brand : C.textDim,
                fontSize: 12.5,
                fontWeight: 600,
                cursor: "pointer",
                letterSpacing: 0.2,
              }}
            >
              {p.name}
            </button>
            <button
              onClick={() => onDelete(p.id)}
              title={`${t("delete")} ${p.name}`}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: active ? C.brand : C.muted,
                opacity: 0.6,
                fontSize: 15,
                lineHeight: 1,
                padding: "2px 7px",
                borderRadius: radius.pill,
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
            className="dash-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("portfolioNamePlaceholder")}
            style={{
              background: C.bgElevated,
              border: `1px solid ${C.border}`,
              borderRadius: radius.pill,
              padding: "6px 14px",
              color: C.text,
              fontSize: 12,
              outline: "none",
            }}
          />
          <Button type="submit" variant="primary" size="sm" disabled={pending}>
            {pending ? "…" : t("add")}
          </Button>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          style={{
            padding: "6px 14px",
            borderRadius: radius.pill,
            border: `1px dashed ${C.border}`,
            background: "transparent",
            color: C.muted,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          + {t("newPortfolio")}
        </button>
      )}
    </div>
  );
}
