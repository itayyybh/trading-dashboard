import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { C, font } from "../../../ui/theme";
import Section from "../../../ui/Section";
import { useLocale } from "../../../lib/i18n/LocaleContext";

export default function WinLossPie({ wins, losses, avgWin, avgLoss }) {
  const { t } = useLocale();
  const pieData = [
    { name: "Wins", value: wins },
    { name: "Losses", value: losses },
  ];
  const total = wins + losses;
  const winPct = total ? Math.round((wins / total) * 100) : 0;

  return (
    <Section title={t("winLossSplit")}>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div dir="ltr" style={{ position: "relative", width: 120, height: 120 }}>
          <ResponsiveContainer width={120} height={120}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={54} dataKey="value" startAngle={90} endAngle={-270} stroke="none" paddingAngle={2}>
                <Cell fill={C.accent} />
                <Cell fill={C.red} />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Center readout */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <span style={{ ...monoStyle, fontSize: 20, color: C.text }}>{winPct}%</span>
            <span style={{ fontSize: 9, color: C.muted, letterSpacing: 1, textTransform: "uppercase" }}>{t("wins")}</span>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          {[[t("wins"), wins, C.accent], [t("losses"), losses, C.red]].map(([label, val, color]) => (
            <Row key={label} label={label} value={val} color={color} />
          ))}
          <Row
            label={t("profitFactor")}
            value={losses > 0 ? ((wins * avgWin) / (losses * avgLoss)).toFixed(2) : "∞"}
            color={C.gold}
            last
          />
        </div>
      </div>
    </Section>
  );
}

const monoStyle = { fontFamily: font.mono, fontVariantNumeric: "tabular-nums", fontWeight: 700 };

function Row({ label, value, color, last }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 0",
        borderBottom: last ? "none" : `1px solid ${C.borderSoft}`,
      }}
    >
      <span style={{ color: C.muted, fontSize: 13 }}>{label}</span>
      <span style={{ ...monoStyle, color }}>{value}</span>
    </div>
  );
}
