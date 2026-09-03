import React from 'react';
import { IconType } from 'react-icons';

interface KpiCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  change?: string;
  isPositive?: boolean;
  icon: IconType;
  accentColor?: string;
  onClick?: () => void;
}

export function KpiCard({
  title,
  value,
  subValue,
  change,
  isPositive = true,
  icon: Icon,
  accentColor = 'var(--gold)',
  onClick,
}: KpiCardProps) {
  return (
    <div
      className={`vt-kpi-card ${onClick ? 'interactive' : ''}`}
      onClick={onClick}
    >
      <div className="vt-kpi-top">
        <span className="vt-kpi-title">{title}</span>
        <div className="vt-kpi-icon-box" style={{ color: accentColor, background: `${accentColor}18` }}>
          <Icon size={18} />
        </div>
      </div>

      <div className="vt-kpi-main">
        <div className="vt-kpi-value">{value}</div>
        {change && (
          <span className={`vt-kpi-change ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? '+' : ''}{change}
          </span>
        )}
      </div>

      {subValue && <div className="vt-kpi-sub">{subValue}</div>}
    </div>
  );
}
