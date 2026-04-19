import React from "react";
import { getAvatarSrc } from "../../utils/avatarUtils";

const withCacheKey = (url, cacheKey) => {
  if (!url || cacheKey === null || cacheKey === undefined || cacheKey === "") {
    return url;
  }

  const joiner = url.includes("?") ? "&" : "?";
  return `${url}${joiner}v=${encodeURIComponent(String(cacheKey))}`;
};

const UserAvatar = ({
  avatarUrl = null,
  equippedAvatar,
  cacheKey = null,
  size = 40,
  className = "",
}) => {
  const src = avatarUrl
    ? withCacheKey(avatarUrl, cacheKey)
    : getAvatarSrc(equippedAvatar);

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