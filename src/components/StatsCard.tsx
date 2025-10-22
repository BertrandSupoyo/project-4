import React from 'react';
import { Card, CardContent } from './ui/Card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
  trend: string;
  onClick?: () => void;
  loading?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  onClick,
  loading = false
}) => {
  const isTrendUp = trend.startsWith('+');
  const isTrendDown = trend.startsWith('-');

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        onClick ? 'hover:scale-105' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            {loading ? (
              <div className="mt-2 h-8 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {value.toLocaleString()}
              </p>
            )}
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${
                isTrendUp ? 'text-green-600' : 
                isTrendDown ? 'text-red-600' : 'text-gray-600'
              }`}>
                {trend}
              </span>
              <span className="text-sm text-gray-500 ml-1">dari bulan lalu</span>
            </div>
          </div>
          <div className={`p-3 rounded-lg ${
            loading ? 'bg-gray-200 animate-pulse' : 'bg-blue-100'
          }`}>
            {!loading && <Icon className="h-6 w-6 text-blue-600" />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};