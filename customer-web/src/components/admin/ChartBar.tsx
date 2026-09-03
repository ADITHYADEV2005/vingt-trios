'use client';

interface ChartBarProps {
  data: Record<string, number>;
  height?: number;
  formatValue?: (val: number) => string;
}

export function ChartBar({ data, height = 180, formatValue = (v) => `₹${v.toLocaleString('en-IN')}` }: ChartBarProps) {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const maxVal = Math.max(...values, 1);

  return (
    <div className="vt-chart-bar-container" style={{ height }}>
      <div className="vt-bar-grid">
        {keys.map((key, idx) => {
          const val = values[idx];
          const pct = Math.min(100, Math.max(4, (val / maxVal) * 100));
          return (
            <div key={key} className="vt-bar-column" title={`${key}: ${formatValue(val)}`}>
              <div className="vt-bar-wrapper">
                <div className="vt-bar-fill" style={{ height: `${pct}%` }}>
                  <span className="vt-bar-tooltip">{formatValue(val)}</span>
                </div>
              </div>
              <span className="vt-bar-label">{key.slice(5)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ChartDonutProps {
  data: Record<string, number>;
  title?: string;
}

const COLORS = ['#ECBB0D', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function ChartDonut({ data, title }: ChartDonutProps) {
  const entries = Object.entries(data).filter(([_, v]) => v > 0);
  const total = entries.reduce((sum, [_, v]) => sum + v, 0);

  let accumulatedPct = 0;

  return (
    <div className="vt-chart-donut-wrapper">
      {title && <div className="vt-chart-title">{title}</div>}
      <div className="vt-chart-donut-body">
        <svg viewBox="0 0 100 100" className="vt-donut-svg">
          {total === 0 ? (
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.08)" strokeWidth="15" />
          ) : (
            entries.map(([label, val], idx) => {
              const pct = val / total;
              const strokeDasharray = `${pct * 251.2} ${251.2 * (1 - pct)}`;
              const strokeDashoffset = -accumulatedPct * 251.2;
              accumulatedPct += pct;
              const color = COLORS[idx % COLORS.length];

              return (
                <circle
                  key={label}
                  cx="50" cy="50" r="40"
                  fill="transparent"
                  stroke={color}
                  strokeWidth="15"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                />
              );
            })
          )}
        </svg>
        <div className="vt-donut-center">
          <div className="vt-donut-total">{total}</div>
          <div className="vt-donut-sub">Total</div>
        </div>
      </div>

      <div className="vt-donut-legend">
        {entries.map(([label, val], idx) => {
          const color = COLORS[idx % COLORS.length];
          const pct = total ? Math.round((val / total) * 100) : 0;
          return (
            <div key={label} className="vt-legend-item">
              <span className="vt-legend-color" style={{ background: color }} />
              <span className="vt-legend-name">{label}</span>
              <span className="vt-legend-val">{val} ({pct}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
