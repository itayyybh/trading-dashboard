import { C, font } from "../../../ui/theme";
import Section from "../../../ui/Section";
import { fmt } from "../format";
import { useLocale } from "../../../lib/i18n/LocaleContext";

export default function LongShortBreakdown({ longs, shorts }) {
  const { t } = useLocale();

  return (
    <Section title={t("longVsShort")}>
      {[
        ["Long", longs],
        ["Short", shorts],
      ].map(([dir, tr]) => {
        const wins = tr.filter((t) => t.pnl > 0).length;
        const pnl = tr.reduce((s, t) => s + t.pnl, 0);
        const wr = tr.length ? (wins / tr.length) * 100 : 0;
        const barColor = dir === "Long" ? C.accent : C.gold;
        return (
          <div key={dir} style={{ marginBottom: dir === "Long" ? 18 : 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{dir === "Long" ? t("long") : t("short")}</span>
              <span style={{ fontFamily: font.mono, fontVariantNumeric: "tabular-nums", fontSize: 13, fontWeight: 700, color: pnl >= 0 ? C.accent : C.red }}>
                {fmt(pnl)}
              </span>
            </div>
            <div style={{ display: "flex", gap: 12, fontSize: 11, color: C.muted, marginBottom: 8 }}>
              <span>{t("tradesSuffix", tr.length)}</span>
              <span>{t("winRateSuffix", wr.toFixed(0))}</span>
              <span>{wins}W · {tr.length - wins}L</span>
            </div>
            <div style={{ height: 6, background: C.bgElevated, borderRadius: 999, overflow: "hidden" }}>
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: barColor,
                  borderRadius: 999,
                  transform: `scaleX(${wr / 100})`,
                  transformOrigin: "left",
                  transition: "transform 300ms",
                }}
              />
            </div>
          </div>
        );
      })}
    </Section>
  );
}
