// ── Shared toast notification ──────────────────────────────────────────────
export function toast(msg, type = 'success') {
  const colors = {
    success: '#16a34a',
    error:   '#dc2626',
    info:    '#2563eb',
    warning: '#d97706',
  };
  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
  const el = document.createElement('div');
  el.style.cssText = `
    position:fixed;top:80px;right:24px;z-index:9999;
    padding:14px 18px;border-radius:10px;font-weight:600;font-size:13px;
    color:#fff;background:${colors[type]||colors.success};
    box-shadow:0 8px 24px rgba(0,0,0,0.18);
    animation:slideInRight .3s ease;min-width:240px;max-width:380px;
    display:flex;align-items:center;gap:10px;
  `;
  el.innerHTML = `<span style="font-size:16px;font-weight:900">${icons[type]||icons.success}</span><span>${msg}</span>`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// ── CSV export ─────────────────────────────────────────────────────────────
export function exportCSV(data, filename) {
  if (!data?.length) return toast('Nothing to export', 'info');
  const keys = Object.keys(data[0]);
  const csv = [
    keys.join(','),
    ...data.map(r => keys.map(k => `"${String(r[k] ?? '').replace(/"/g, '""')}"`).join(',')),
  ].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = filename;
  a.click();
  toast(`Exported ${data.length} rows`, 'success');
}

// ── Confirm dialog ─────────────────────────────────────────────────────────
export function confirm(msg) {
  return window.confirm(msg);
}

// ── Format currency ────────────────────────────────────────────────────────
export function formatCurrency(val) {
  return `$${Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── Format date ────────────────────────────────────────────────────────────
export function formatDate(val) {
  if (!val) return '—';
  try { return new Date(val).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return String(val); }
}
