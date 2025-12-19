import React from 'react';

const ViewSwitcher = ({ currentView, onViewChange }) => {
  return (
    <div className="mt-4">
      <div className="flex space-x-2">
        <button
          onClick={() => onViewChange('day')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            currentView === 'day'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          日视图
        </button>
        <button
          onClick={() => onViewChange('week')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            currentView === 'week'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          周视图
        </button>
      </div>
    </div>
  );
};

export default ViewSwitcher;
