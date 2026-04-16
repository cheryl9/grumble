export default function StreakDisplay({ currentStreak = 0, longestStreak = 0 }) {
  // Visual level based on streak length
  const getStreakLevel = (n) => {
    if (n >= 30) return { emoji: '🔥🔥🔥', label: 'On Fire!', color: '#e53e3e' };
    if (n >= 14) return { emoji: '🔥🔥', label: 'Blazing!', color: '#F78660' };
    if (n >= 7)  return { emoji: '🔥', label: 'Heating Up', color: '#F78660' };
    if (n >= 3)  return { emoji: '✨', label: 'Getting Started', color: '#FFCC7A' };
    return { emoji: '🌱', label: 'Just Starting', color: '#4ecdc4' };
  };

  const level = getStreakLevel(currentStreak);

  return (
    <div
      style={{
        backgroundColor: '#FDDCB5',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            width: '56px', height: '56px', borderRadius: '50%',
            backgroundColor: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '26px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          {level.emoji}
        </div>
        <div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#111' }}>
            {currentStreak} day streak
          </div>
          <div style={{ fontSize: '13px', color: '#888', marginTop: '2px' }}>{level.label}</div>
        </div>
      </div>

      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '12px', color: '#888' }}>Best</div>
        <div style={{ fontSize: '18px', fontWeight: '700', color: '#333' }}>{longestStreak}d</div>
      </div>
    </div>
  );
}