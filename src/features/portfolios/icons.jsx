// Icon set for portfolio metadata:
//   • asset-class icons — monochrome line glyphs (via `line()`), tinted by
//     `currentColor` so they take the active/muted state from their container
//   • platform marks — the platforms' real, full-color logos, bundled locally
//     from ./logos and rendered as images (via `logo()`)
//   • manual / decide — non-brand options, kept as monochrome UI glyphs
// Kept separate from constants.js so that file stays pure data (and HMR-clean).
//
// The bundled logos are the trademarks of their respective owners, included to
// identify each import integration.
import binanceLogo from "./logos/binance.png";
import tradingViewLogo from "./logos/tradingview.png";
import interactiveBrokersLogo from "./logos/interactive_brokers.png";
import tradovateLogo from "./logos/tradovate.png";

const line = (children) => (props) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    {children}
  </svg>
);

// --- Asset classes ---

export const StocksIcon = line(
  <>
    <path d="M4 19h16" />
    <rect x="6" y="10" width="3" height="6" rx="0.5" />
    <rect x="11" y="6" width="3" height="10" rx="0.5" />
    <rect x="16" y="12" width="3" height="4" rx="0.5" />
  </>
);

export const FuturesIcon = line(
  <>
    <path d="M4 15l5-5 4 3 6-7" />
    <path d="M15 3h4v4" />
  </>
);

export const CryptoIcon = line(
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M10 8h3.2a2 2 0 010 4H10zm0 4h3.6a2 2 0 010 4H10zm0-6v12" />
  </>
);

export const ForexIcon = line(<path d="M4 8h11l-2.5-2.5M20 16H9l2.5 2.5" />);

export const OptionsIcon = line(
  <>
    <path d="M6 20V9M6 9l-2 2M6 9l2 2" />
    <path d="M12 20V4M12 4l-2 2M12 4l2 2" />
    <path d="M18 20v-7M18 13l-2 2M18 13l2 2" />
  </>
);

export const MixedIcon = line(
  <>
    <rect x="4" y="4" width="7" height="7" rx="1.5" />
    <rect x="13" y="4" width="7" height="7" rx="1.5" />
    <rect x="4" y="13" width="7" height="7" rx="1.5" />
    <rect x="13" y="13" width="7" height="7" rx="1.5" />
  </>
);

// --- Platform logos (real brand marks, full color) ---

// Renders a bundled logo image at the requested size. Same call shape as the
// SVG icons (`<Icon />`, or `<Icon width height />`) so consumers are agnostic
// to whether a platform uses a logo or a glyph. A gentle radius softens any
// logo that ships with its own square backdrop.
const logo = (src) => ({ width = 20, height = 20, ...rest }) => (
  <img
    src={src}
    alt=""
    width={width}
    height={height}
    loading="lazy"
    decoding="async"
    style={{ borderRadius: 4, objectFit: "contain", display: "block", flexShrink: 0 }}
    {...rest}
  />
);

export const TradingViewIcon = logo(tradingViewLogo);
export const InteractiveBrokersIcon = logo(interactiveBrokersLogo);
export const TradovateIcon = logo(tradovateLogo);
export const BinanceIcon = logo(binanceLogo);

export const ManualMappingIcon = line(
  <>
    <rect x="4" y="5" width="16" height="14" rx="1.5" />
    <path d="M9 5v14M4 10h16" />
  </>
);

export const DecideIcon = line(
  <>
    <circle cx="12" cy="12" r="8.5" strokeDasharray="3 3" />
    <path d="M12 11v.01M12 8.5a1.7 1.7 0 011 3c-.7.4-1 .8-1 1.5" />
  </>
);
