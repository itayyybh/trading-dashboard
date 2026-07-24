// Metadata for the portfolio wizard: asset classes and import platforms.
//
// Pure data — icons live in ./icons so this file stays presentation-free.
// Platform ids map to real CSV parser ids so a selection can seed the import
// flow as a default HINT; auto-detection is unaffected. Two platform options
// (`manual`, `decide`) are UI-only sentinels.
import {
  StocksIcon,
  FuturesIcon,
  CryptoIcon,
  ForexIcon,
  OptionsIcon,
  MixedIcon,
  TradingViewIcon,
  InteractiveBrokersIcon,
  TradovateIcon,
  BinanceIcon,
  ManualMappingIcon,
  DecideIcon,
} from "./icons";

export const ASSET_CLASSES = [
  { id: "stocks", label: "Stocks", Icon: StocksIcon },
  { id: "futures", label: "Futures", Icon: FuturesIcon },
  { id: "crypto", label: "Crypto", Icon: CryptoIcon },
  { id: "forex", label: "Forex", Icon: ForexIcon },
  { id: "options", label: "Options", Icon: OptionsIcon },
  { id: "mixed", label: "Mixed", Icon: MixedIcon },
];

export const ASSET_CLASS_BY_ID = Object.fromEntries(ASSET_CLASSES.map((a) => [a.id, a]));

export const PLATFORMS = [
  { id: "tradingview", label: "TradingView", Icon: TradingViewIcon },
  { id: "interactive_brokers", label: "Interactive Brokers", Icon: InteractiveBrokersIcon },
  { id: "tradovate", label: "Tradovate", Icon: TradovateIcon },
  { id: "binance", label: "Binance", Icon: BinanceIcon },
  { id: "manual", label: "Manual Mapping", Icon: ManualMappingIcon },
  { id: "decide", label: "I'll decide each import", Icon: DecideIcon },
];

export const PLATFORM_BY_ID = Object.fromEntries(PLATFORMS.map((p) => [p.id, p]));
