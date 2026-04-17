import { useEffect, useRef, useState } from "react";
import { getStageForStreak } from "../profilePage/StreakStages";

const petAnimationStyle = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-10px) rotate(2deg); }
  }
  
  @keyframes bounce {
    0%, 100% { transform: scaleY(1); }
    50% { transform: scaleY(0.95); }
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0px); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  
  .pet-container {
    animation: float 3s ease-in-out infinite, bounce 2s ease-in-out infinite, shake 2.5s ease-in-out infinite;
  }
`;

// Inject animation styles
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = petAnimationStyle;
  document.head.appendChild(style);
}

export default function FloatingPet({ streak = 0 }) {
  const petRef = useRef(null);
  const [position, setPosition] = useState({
    x: window.innerWidth - 140,
    y: window.innerHeight - 160,
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, petX: 0, petY: 0 });
  const [imgError, setImgError] = useState(false);

  // Load position from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("petPosition");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migrate old format where y could be null
        setPosition({
          x: parsed.x ?? window.innerWidth - 200,
          y: parsed.y ?? window.innerHeight - 2400,
        });
      } catch (e) {
        console.error("Failed to load pet position:", e);
      }
    }
  }, []);

  // Save position to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("petPosition", JSON.stringify(position));
  }, [position]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      petX: position.x,
      petY: position.y,
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;

      const newX = Math.max(
        0,
        Math.min(window.innerWidth - 140, dragStart.current.petX + dx),
      );
      const newY = Math.max(
        0,
        Math.min(window.innerHeight - 160, dragStart.current.petY + dy),
      );

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => setIsDragging(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const stage = getStageForStreak(streak);

  return (
    <div
      ref={petRef}
      onMouseDown={handleMouseDown}
      className="pet-container"
      style={{
        position: "fixed",
        left: position.x + "px",
        top: position.y + "px",
        width: 150,
        height: 180,
        zIndex: 999,
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        pointerEvents: "auto",
      }}
    >
      {!imgError ? (
        <img
          src={stage.image}
          alt={stage.name}
          draggable={false}
          style={{ width: "100%", height: "150px", objectFit: "contain" }}
          onError={() => setImgError(true)}
        />
      ) : (
        <span
          style={{ fontSize: "36px", display: "block", textAlign: "center" }}
        >
          🦠
        </span>
      )}
    </div>
  );
}
