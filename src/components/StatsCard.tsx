import React from 'react';
import { Card, CardContent } from './ui/Card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'red' | 'purple' | 'gray';
  trend?: string;
  onClick?: () => void;
  loading?: boolean;
  description?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  color = 'blue',
  trend,
  onClick,
  loading = false,
  description = 'dari bulan lalu'
}) => {
  // 🔧 PERBAIKAN 1: Map color ke styling
  const colorMap = {
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      icon: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      icon: 'text-green-600'
    },
    red: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      icon: 'text-red-600'
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-600',
      icon: 'text-purple-600'
    },
    gray: {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      icon: 'text-gray-600'
    }
  };

  const colors = colorMap[color];

  // 🔧 PERBAIKAN 2: Determine trend direction
  const isTrendUp = trend?.startsWith('+');
  const isTrendDown = trend?.startsWith('-');

  // 🔧 PERBAIKAN 3: Trend color
  const trendColor = isTrendUp 
    ? 'text-green-600' 
    : isTrendDown 
    ? 'text-red-600' 
    : 'text-gray-600';

  return (
    <Card 
      className={`transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-lg hover:scale-105' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {/* Title */}
            <p className="text-sm font-medium text-gray-600 truncate">
              {title}
            </p>
            
            {/* Value */}
            {loading ? (
              <div className="mt-2 h-8 bg-gray-200 rounded animate-pulse w-24"></div>
            ) : (
              <p className="text-3xl font-bold text-gray-900 mt-2 tabular-nums">
                {value.toLocaleString('id-ID')}
              </p>
            )}
            
            {/* Trend */}
            {trend && (
              <div className="flex items-center gap-2 mt-3">
                <span className={`text-sm font-semibold ${trendColor}`}>
                  {trend}
                </span>
                <span className="text-xs text-gray-500">
                  {description}
                </span>
              </div>
            )}
          </div>

          {/* Icon */}
          <div className={`p-3 rounded-lg ${
            loading ? 'bg-gray-200 animate-pulse' : colors.bg
          }`}>
            {!loading && (
              <Icon className={`h-6 w-6 ${colors.icon}`} />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};