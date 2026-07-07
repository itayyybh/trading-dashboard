import { useLocale } from "../../lib/i18n/LocaleContext";
import { C } from "../trades/constants";

export default function LocaleToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div style={{ display: "flex", gap: 4 }}>
      {["en", "he"].map((code) => (
        <button
          key={code}
          onClick={() => setLocale(code)}
          style={{
            padding: "4px 10px", borderRadius: 20,
            border: `1px solid ${locale === code ? C.accent : C.border}`,
            background: locale === code ? C.accentDim : "transparent",
            color: locale === code ? C.accent : C.muted,
            fontSize: 11, fontWeight: 700, cursor: "pointer",
          }}
        >
          {code === "en" ? "EN" : "עב"}
        </button>
      ))}
    </div>
  );
}
