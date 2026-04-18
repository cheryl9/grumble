import React from "react";
import { User } from "lucide-react";
import { getAvatarSrc } from "../../utils/avatarUtils";

/**
 * Displays a user's avatar image if available, otherwise shows a placeholder
 * @param {string} avatarUrl - Direct avatar image URL, if available
 * @param {string} equippedAvatar - The achievement key of the equipped avatar (e.g., 'tiny_tummy')
 * @param {number} size - Avatar size in pixels (default: 40)
 * @param {string} className - Additional CSS classes
 */
const UserAvatar = ({ avatarUrl = null, equippedAvatar, size = 40, className = "" }) => {
  const hasAvatar = Boolean(avatarUrl || equippedAvatar);

  if (hasAvatar) {
    const src = avatarUrl || getAvatarSrc(equippedAvatar);

    return (
      <img
        src={src}
        alt="User avatar"
        className={`rounded-full object-cover ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
        }}
        onError={(e) => {
          // Fallback to placeholder if image fails to load
          e.target.style.display = "none";
        }}
      />
    );
  }

  // Placeholder with User icon
  return (
    <div
      className={`rounded-full bg-[#FCF1DD] border border-[#F4DAB8] flex items-center justify-center ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <User size={Math.round(size * 0.5)} className="text-gray-600" />
    </div>
  );
};

export default UserAvatar;
