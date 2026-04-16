// Shared helpers for user's current avatar

import logoImg from "../assets/logo.png";
import defaultPng from "../assets/avatars/default.png";

export function getAvatarSrc(equippedAvatar) {
  if (!equippedAvatar) return defaultPng;
  return `/src/assets/avatars/${equippedAvatar}.png`;
}

// map pins
export function makeAvatarMapIcon(equippedAvatar) {
  if (typeof window === "undefined") return null;
  const L = window.L || require("leaflet");

  const src = getAvatarSrc(equippedAvatar);

  return L.divIcon({
    className: "",
    iconSize: [44, 52],
    iconAnchor: [22, 52],
    popupAnchor: [0, -52],
    html: `
      <div style="
        position: relative;
        width: 44px;
        height: 52px;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      ">
        <!-- Pin teardrop shape -->
        <div style="
          width: 44px;
          height: 44px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          background: #F78660;
          position: absolute;
          top: 0; left: 0;
          box-shadow: 0 2px 8px rgba(247,134,96,0.5);
        "></div>

        <!-- Avatar image inside pin -->
        <div style="
          position: absolute;
          top: 4px; left: 4px;
          width: 36px; height: 36px;
          border-radius: 50%;
          overflow: hidden;
          background: #FCF1DD;
          border: 2px solid #fff;
          display: flex; align-items: center; justify-content: center;
        ">
          <img
            src="${src}"
            style="width: 30px; height: 30px; object-fit: contain;"
            onerror="this.src='${logoImg}'"
          />
        </div>

        <!-- Pin tail -->
        <div style="
          position: absolute;
          bottom: 0; left: 50%;
          transform: translateX(-50%);
          width: 0; height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 10px solid #F78660;
        "></div>
      </div>
    `,
  });
}
