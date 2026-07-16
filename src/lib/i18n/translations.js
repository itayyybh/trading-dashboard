// Each value is either a plain string, or a function for strings that need
// dynamic values interpolated (e.g. counts, filenames) - kept as a function
// per locale (not a template-token replacer) so word order can differ freely
// between English and Hebrew instead of forcing the same sentence structure.
export const translations = {
  en: {
    // Auth
    signIn: "Sign in",
    signUp: "Sign up",
    createAccount: "Create account",
    email: "Email",
    password: "Password",
    pleaseWait: "Please wait…",
    noAccountQuestion: "No account?",
    alreadyHaveAccountQuestion: "Already have an account?",
    confirmEmailPrefix: "Check your email to confirm your account, then",

    // Dashboard shell
    tradingJournal: "Trading Journal",
    performanceDashboard: "Performance Dashboard",
    signOut: "Sign out",
    importCsv: "Import CSV",
    logTrade: "Log Trade",
    save: "Save",
    saving: "Saving…",
    loadingTrades: "Loading trades…",
    loading: "Loading…",
    somethingWentWrong: "Something went wrong",
    createFirstPortfolio: "Create your first portfolio",
    createFirstPortfolioSubtitle: "Use “+ New portfolio” above to get started.",
    noTradesYetIn: (name) => `No trades yet in ${name}`,
    noTradesYetSubtitle: "Use “Import CSV” above to upload your first broker export.",

    // KPIs
    totalPnl: "Total P&L",
    winRate: "Win Rate",
    avgWin: "Avg Win",
    avgLoss: "Avg Loss",
    rrr: "RRR",
    rewardRisk: "reward:risk",
    bestStreak: "Best Streak",
    winsLossesShort: (wins, losses) => `${wins}W · ${losses}L`,
    worstStreak: (maxLoss) => `${maxLoss}L worst`,

    // Section titles
    equityCurve: "Equity Curve",
    pnlCalendar: "Daily P&L Calendar",
    pnlByDay: "P&L by Day",
    pnlByAsset: "P&L by Asset",
    winLossSplit: "Win / Loss Split",
    longVsShort: "Long vs Short",
    tradeLog: "Trade Log",

    // Equity curve chart
    tradeNumber: "Trade #",
    cumulativePnl: "Cumulative P&L",

    // Win/loss pie
    wins: "Wins",
    losses: "Losses",
    profitFactor: "Profit Factor",

    // Long vs short
    long: "Long",
    short: "Short",
    tradesSuffix: (n) => `${n} trades`,
    winRateSuffix: (wr) => `${wr}% win rate`,

    // Trade log table
    date: "Date",
    entry: "Entry",
    exit: "Exit",
    dirShort: "Dir",
    asset: "Asset",
    pnl: "P&L",

    // Portfolios
    newPortfolio: "+ New portfolio",
    portfolioNamePlaceholder: "Portfolio name",
    add: "Add",
    delete: "Delete",

    // CSV import
    importTradesFromCsv: "Import trades from CSV",
    close: "Close",
    onlyCsvSupported: "Only CSV files are supported right now — Excel and other formats are coming in a later phase.",
    fileTooLarge: (mb) => `File is too large — the limit is ${mb}MB for now.`,
    chooseCsvFile: "Choose CSV file",
    csvOnlyUpTo: (mb) => `CSV only, up to ${mb}MB.`,
    useSavedMapping: "Use a saved mapping:",
    chooseTemplateOption: "— choose a template —",
    autoDetectedNote: "Columns are auto-detected from your headers — double-check them below and adjust anything that's wrong.",
    brokerNamePlaceholder: "Broker name (e.g. Interactive Brokers)",
    saveAsTemplateLabel: "Save as template",
    importLabel: "Import",
    importing: "Importing…",
    chooseDifferentFile: "Choose a different file",
    rowsTooMany: (n, max) => `This file has ${n} rows — the limit is ${max} for now.`,
    importedOfRows: (a, b) => `Imported ${a} of ${b} rows.`,
    skippedRows: (n) => `Skipped ${n} row(s) that couldn't be mapped (bad date, direction, symbol, or P&L).`,
    importAnotherFile: "Import more files",
    statusOk: "ok",
    fileProgress: (i, n) => `File ${i} of ${n}`,
    nextFileLabel: "Next file",
    reviewImportLabel: "Review & Import",
    importAllLabel: "Import All",
    filesReadyHeading: "Files ready to import",
    filesSkippedHeading: "Skipped files",
    fileRowsSummary: (filename, imported, total) => `${filename}: ${imported} of ${total} rows`,
    fileSkippedDuplicate: (filename, date) => `${filename} — already imported on ${date}`,
    fileSkippedInvalidType: (filename) => `${filename} — not a CSV file`,
    fileSkippedTooLarge: (filename, mb) => `${filename} — larger than ${mb}MB`,
    importedAcrossFiles: (imported, fileCount) => `Imported ${imported} rows across ${fileCount} file(s).`,

    // Intelligent import / broker detection
    autoDetectedBadge: (label) => `${label} · auto-detected`,
    mapManuallyInstead: "Map manually",
    noBrokerMatchedNote: "No broker was auto-detected — map the columns below.",
    notTradeFileTitle: "This doesn't look like a trade file",
    notTradeFileHint: "DASH imports trade history — a date, direction, symbol and P&L per trade. If this is a holdings or balance export, it can't be imported as trades. You can still try mapping the columns manually below.",

    // Unified field labels (CSV mapping UI)
    symbolField: "Symbol",
    directionField: "Direction",
    entryTimeField: "Entry time",
    exitTimeField: "Exit time",
    quantityField: "Quantity",
    entryPriceField: "Entry price",
    exitPriceField: "Exit price",
    feesField: "Fees",

    // Row validation error codes
    invalidDate: "invalid date",
    unrecognizedDirection: "unrecognized direction",
    missingSymbol: "missing symbol",
    invalidPnl: "invalid P&L",

    // P&L calendar
    monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    weekdayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    prevMonth: "Previous month",
    nextMonth: "Next month",
    profitDay: "Profit",
    lossDay: "Loss",
    noTradeDay: "No trades",
    dayTooltip: (date, pnl, count) => `${date} · ${pnl} · ${count} trade${count === 1 ? "" : "s"}`,
    monthTotal: (pnl) => `Month: ${pnl}`,
  },
  he: {
    // Auth
    signIn: "התחברות",
    signUp: "הרשמה",
    createAccount: "יצירת חשבון",
    email: "אימייל",
    password: "סיסמה",
    pleaseWait: "רגע בבקשה…",
    noAccountQuestion: "אין לך חשבון?",
    alreadyHaveAccountQuestion: "יש לך כבר חשבון?",
    confirmEmailPrefix: "בדוק את תיבת הדואר שלך לאישור החשבון, ואז",

    // Dashboard shell
    tradingJournal: "יומן מסחר",
    performanceDashboard: "לוח בקרה לביצועים",
    signOut: "התנתקות",
    importCsv: "ייבוא CSV",
    logTrade: "רישום עסקה",
    save: "שמור",
    saving: "שומר…",
    loadingTrades: "טוען עסקאות…",
    loading: "טוען…",
    somethingWentWrong: "משהו השתבש",
    createFirstPortfolio: "צור את התיק הראשון שלך",
    createFirstPortfolioSubtitle: "לחץ על “תיק חדש +” מעלה כדי להתחיל.",
    noTradesYetIn: (name) => `אין עדיין עסקאות בתיק ${name}`,
    noTradesYetSubtitle: "לחץ על “ייבוא CSV” מעלה כדי להעלות את הקובץ הראשון שלך.",

    // KPIs
    totalPnl: "רווח/הפסד כולל",
    winRate: "אחוז הצלחה",
    avgWin: "רווח ממוצע",
    avgLoss: "הפסד ממוצע",
    rrr: "RRR",
    rewardRisk: "תמורה:סיכון",
    bestStreak: "הרצף הטוב ביותר",
    winsLossesShort: (wins, losses) => `${wins} הצלחות · ${losses} הפסדים`,
    worstStreak: (maxLoss) => `הגרוע ביותר: ${maxLoss}`,

    // Section titles
    equityCurve: "עקומת ההון",
    pnlCalendar: "לוח שנה רווח/הפסד יומי",
    pnlByDay: "רווח/הפסד לפי יום",
    pnlByAsset: "רווח/הפסד לפי נכס",
    winLossSplit: "התפלגות הצלחות/הפסדים",
    longVsShort: "לונג מול שורט",
    tradeLog: "יומן עסקאות",

    // Equity curve chart
    tradeNumber: "עסקה מספר",
    cumulativePnl: "רווח/הפסד מצטבר",

    // Win/loss pie
    wins: "הצלחות",
    losses: "הפסדים",
    profitFactor: "מקדם רווח",

    // Long vs short
    long: "לונג",
    short: "שורט",
    tradesSuffix: (n) => `${n} עסקאות`,
    winRateSuffix: (wr) => `${wr}% אחוז הצלחה`,

    // Trade log table
    date: "תאריך",
    entry: "כניסה",
    exit: "יציאה",
    dirShort: "כיוון",
    asset: "נכס",
    pnl: "רווח/הפסד",

    // Portfolios
    newPortfolio: "+ תיק חדש",
    portfolioNamePlaceholder: "שם התיק",
    add: "הוסף",
    delete: "מחיקה",

    // CSV import
    importTradesFromCsv: "ייבוא עסקאות מקובץ CSV",
    close: "סגור",
    onlyCsvSupported: "כרגע נתמכים רק קבצי CSV — תמיכה באקסל ובפורמטים נוספים תגיע בהמשך.",
    fileTooLarge: (mb) => `הקובץ גדול מהמותר — המגבלה הנוכחית היא ${mb}MB.`,
    chooseCsvFile: "בחר קובץ CSV",
    csvOnlyUpTo: (mb) => `קבצי CSV בלבד, עד ${mb}MB.`,
    useSavedMapping: "השתמש במיפוי שמור:",
    chooseTemplateOption: "— בחר תבנית —",
    autoDetectedNote: "העמודות זוהו אוטומטית מהכותרות שלך — בדוק אותן מתחת ותקן במידת הצורך.",
    brokerNamePlaceholder: "שם הברוקר (למשל Interactive Brokers)",
    saveAsTemplateLabel: "שמור כתבנית",
    importLabel: "ייבוא",
    importing: "מייבא…",
    chooseDifferentFile: "בחר קובץ אחר",
    rowsTooMany: (n, max) => `בקובץ זה ${n} שורות — המגבלה הנוכחית היא ${max}.`,
    importedOfRows: (a, b) => `יובאו ${a} מתוך ${b} שורות.`,
    skippedRows: (n) => `${n} שורות דולגו כיוון שלא ניתן היה למפות אותן (תאריך, כיוון, נכס או רווח/הפסד שגויים).`,
    importAnotherFile: "ייבוא קבצים נוספים",
    statusOk: "תקין",
    fileProgress: (i, n) => `קובץ ${i} מתוך ${n}`,
    nextFileLabel: "הקובץ הבא",
    reviewImportLabel: "סקירה וייבוא",
    importAllLabel: "ייבוא הכל",
    filesReadyHeading: "קבצים מוכנים לייבוא",
    filesSkippedHeading: "קבצים שדולגו",
    fileRowsSummary: (filename, imported, total) => `${filename}: ${imported} מתוך ${total} שורות`,
    fileSkippedDuplicate: (filename, date) => `${filename} — יובא בעבר בתאריך ${date}`,
    fileSkippedInvalidType: (filename) => `${filename} — לא קובץ CSV`,
    fileSkippedTooLarge: (filename, mb) => `${filename} — גדול מ-${mb}MB`,
    importedAcrossFiles: (imported, fileCount) => `יובאו ${imported} שורות מתוך ${fileCount} קבצים.`,

    // Intelligent import / broker detection
    autoDetectedBadge: (label) => `${label} · זוהה אוטומטית`,
    mapManuallyInstead: "מיפוי ידני",
    noBrokerMatchedNote: "לא זוהה ברוקר אוטומטית — מפה את העמודות מטה.",
    notTradeFileTitle: "זה לא נראה כמו קובץ עסקאות",
    notTradeFileHint: "DASH מייבא היסטוריית עסקאות — תאריך, כיוון, סימבול ורווח/הפסד לכל עסקה. אם זהו קובץ אחזקות או יתרות, לא ניתן לייבא אותו כעסקאות. עדיין ניתן לנסות למפות את העמודות ידנית מטה.",

    // Unified field labels (CSV mapping UI)
    symbolField: "סימבול",
    directionField: "כיוון",
    entryTimeField: "שעת כניסה",
    exitTimeField: "שעת יציאה",
    quantityField: "כמות",
    entryPriceField: "מחיר כניסה",
    exitPriceField: "מחיר יציאה",
    feesField: "עמלות",

    // Row validation error codes
    invalidDate: "תאריך לא תקין",
    unrecognizedDirection: "כיוון לא מוכר",
    missingSymbol: "נכס חסר",
    invalidPnl: "רווח/הפסד לא תקין",

    // P&L calendar
    monthNames: ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"],
    weekdayNames: ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"],
    prevMonth: "החודש הקודם",
    nextMonth: "החודש הבא",
    profitDay: "רווח",
    lossDay: "הפסד",
    noTradeDay: "אין עסקאות",
    dayTooltip: (date, pnl, count) => `${date} · ${pnl} · ${count} עסקאות`,
    monthTotal: (pnl) => `החודש: ${pnl}`,
  },
};
