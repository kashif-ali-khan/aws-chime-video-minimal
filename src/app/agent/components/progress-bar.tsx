import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  return (
    <div style={{ alignItems: 'center' }} className="flex justify-between p-2 gap-2">
      {/* Segment-wise Progress Bar */}
      <div className="flex gap-1 w-full">
        {Array.from({ length: total }, (_, index) => (
          <div
            key={index}
            className={`h-2 flex-1 rounded-full transition-all duration-300 ease-in-out ${
              index <= current ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Progress Text */}
      <div className="text-[15px] text-gray-600 whitespace-nowrap">
        <span className="text-[20px] font-bold">{current + 1}</span>/{total}
      </div>
    </div>
  );
};

export default ProgressBar;
