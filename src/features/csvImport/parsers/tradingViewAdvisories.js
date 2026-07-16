// Sibling TradingView exports that AREN'T the balance-history file. They lack
// realized P&L, so we can't import them as trades - instead we detect them and
// point the user at the right export. See parsers/tradingView.js for the one we
// DO support.

// Order / fill history: distinctive TradingView columns, but no P&L.
export const tradingViewOrderHistory = {
  id: "tradingview_order_history",
  messageKey: "tvWrongExportOrders",
  detect: ({ headers = [] }) => {
    const cols = new Set(headers);
    return cols.has("Order ID") && cols.has("Placing time") && (cols.has("Fill price") || cols.has("Side"));
  },
};

// Activity log: a two-column Time/Text export of order-event sentences.
export const tradingViewJournal = {
  id: "tradingview_journal",
  messageKey: "tvWrongExportJournal",
  detect: ({ headers = [], rawText = "" }) =>
    headers.length === 2 && headers[0] === "Time" && headers[1] === "Text" && /has been executed|Order \d/.test(rawText),
};
