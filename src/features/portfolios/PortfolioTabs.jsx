import { C, radius, transition } from "../../ui/theme";
import { useLocale } from "../../lib/i18n/LocaleContext";

// Dashboard portfolio switcher. Purely for selecting the active portfolio —
// creation opens the wizard and the full lifecycle (rename, edit, archive,
// delete, restore) lives on the dedicated /portfolios page, so these pills stay
// calm and uncluttered. No destructive control sits on a switch anymore.
export default function PortfolioTabs({ portfolios, activeId, onSelect, onNew, onManage }) {
  const { t } = useLocale();

  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
      {portfolios.map((p) => {
        const active = activeId === p.id;
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            style={{
              padding: "6px 14px",
              borderRadius: radius.pill,
              border: `1px solid ${active ? C.brand : C.border}`,
              background: active ? C.brandDim : "transparent",
              color: active ? C.brand : C.textDim,
              fontSize: 12.5,
              fontWeight: 600,
              letterSpacing: 0.2,
              cursor: "pointer",
              transition: `background ${transition}, border-color ${transition}, color ${transition}`,
            }}
          >
            {p.name}
          </button>
        );
      })}

      <button
        onClick={onNew}
        style={{
          padding: "6px 14px",
          borderRadius: radius.pill,
          border: `1px dashed ${C.border}`,
          background: "transparent",
          color: C.muted,
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          transition: `color ${transition}, border-color ${transition}`,
        }}
      >
        {t("newPortfolio")}
      </button>

      {portfolios.length > 0 && (
        <button
          onClick={onManage}
          title={t("managePortfolios")}
          style={{
            padding: "6px 10px",
            borderRadius: radius.pill,
            border: "1px solid transparent",
            background: "transparent",
            color: C.muted,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            transition: `color ${transition}`,
          }}
        >
          {t("manage")}
        </button>
      )}
    </div>
  );
}
