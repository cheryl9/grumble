import React from 'react';

const Avatar = ({ name, size = 'md' }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  return (
    <div className={`${sizes[size]} rounded-full bg-[#FCF1DD] flex items-center justify-center font-bold text-[#F78660] flex-shrink-0`}>
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  );
};

export default Avatar;