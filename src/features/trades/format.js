export const fmt = n => (n>=0?"+":"")+`$${Math.abs(n).toLocaleString()}`;
export const fmtPct = n => n.toFixed(1)+"%";
