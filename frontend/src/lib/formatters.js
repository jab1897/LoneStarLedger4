const nfInt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const nfUSD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function fmtMaybe(v, kind='number') {
  if (v === null || v === undefined || Number.isNaN(v)) return '—';
  if (kind === 'money') {
    if (typeof v !== 'number') return '—';
    return nfUSD.format(v);
  }
  if (typeof v !== 'number') return '—';
  return nfInt.format(v);
}
