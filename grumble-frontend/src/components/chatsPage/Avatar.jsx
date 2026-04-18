import React from "react";

const Avatar = ({ name, src = null, size = "md" }) => {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
  };

  return (
    <div
      className={`${sizes[size]} rounded-full bg-[#FCF1DD] flex items-center justify-center font-bold text-[#F78660] flex-shrink-0 overflow-hidden`}
    >
      {src ? (
        <img
          src={src}
          alt={name || "Avatar"}
          className="w-full h-full object-cover"
        />
      ) : (
        (name?.[0]?.toUpperCase() ?? "?")
      )}
    </div>
  );
};

export default Avatar;
