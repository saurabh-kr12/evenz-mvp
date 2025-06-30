import React from 'react';
import { STATS_COLOR_CLASSES } from '@/app/utils/constants';

export const StatsCard = ({ title, value, icon: Icon, color = 'blue' }) => {
  return (
    <div className="bg-white text-gray-700 rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${STATS_COLOR_CLASSES[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};