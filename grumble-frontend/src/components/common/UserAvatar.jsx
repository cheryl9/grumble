import React from "react";
import { getAvatarSrc } from "../../utils/avatarUtils";

const UserAvatar = ({ avatarUrl = null, equippedAvatar, size = 40, className = "" }) => {
  const src = avatarUrl || getAvatarSrc(equippedAvatar);

  return (
    <img
      src={src}
      alt="User avatar"
      className={`rounded-full object-cover ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      onError={(e) => { e.target.src = getAvatarSrc(null); }}
    />
  );
};

export default UserAvatar;