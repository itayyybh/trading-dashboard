export function stats(trades) {
  const wins = trades.filter(t => t.pnl > 0);
  const losses = trades.filter(t => t.pnl < 0);
  const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
  const avgWin = wins.length ? wins.reduce((s,t)=>s+t.pnl,0)/wins.length : 0;
  const avgLoss = losses.length ? Math.abs(losses.reduce((s,t)=>s+t.pnl,0)/losses.length) : 0;
  const rrr = avgLoss ? avgWin/avgLoss : 0;
  const winRate = trades.length ? (wins.length/trades.length)*100 : 0;

  // equity curve
  let running = 0;
  const equity = trades.map((t,i) => { running += t.pnl; return { i: i+1, value: running }; });

  // by asset
  const assetMap = {};
  trades.forEach(t => {
    if (!assetMap[t.asset]) assetMap[t.asset] = { pnl: 0, count: 0 };
    assetMap[t.asset].pnl += t.pnl;
    assetMap[t.asset].count += 1;
  });
  const byAsset = Object.entries(assetMap).map(([name,v])=>({ name, ...v }));

  // by direction
  const longs  = trades.filter(t=>t.dir==="Long");
  const shorts = trades.filter(t=>t.dir==="Short");

  // by day PnL (count kept alongside pnl for the calendar's per-day tooltip;
  // PnlByDayChart only reads date/pnl, so the extra field is harmless there)
  const dayMap = {};
  trades.forEach(t => {
    if (!dayMap[t.date]) dayMap[t.date] = { pnl: 0, count: 0 };
    dayMap[t.date].pnl += t.pnl;
    dayMap[t.date].count += 1;
  });
  const byDay = Object.entries(dayMap).map(([date,v])=>({ date, pnl: v.pnl, count: v.count }));

  // win/loss streak
  let maxWin=0, maxLoss=0, curWin=0, curLoss=0;
  trades.forEach(t => {
    if (t.pnl>0){ curWin++; curLoss=0; maxWin=Math.max(maxWin,curWin); }
    else { curLoss++; curWin=0; maxLoss=Math.max(maxLoss,curLoss); }
  });

  return { wins:wins.length, losses:losses.length, totalPnl, avgWin, avgLoss, rrr, winRate,
    equity, byAsset, byDay, longs, shorts, maxWin, maxLoss };
}
