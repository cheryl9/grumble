import { getStageForStreak } from './StreakStages';

export default function StreakDisplay({ currentStreak }) {
  const stage = getStageForStreak(currentStreak);

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: '#fde8d8',
      border: '1.5px solid #e8721a',
      borderRadius: '12px',
      padding: '10px 16px',
      fontSize: '14px',
      fontWeight: '600',
      color: '#c45e10',
    }}>
      <span>{currentStreak} day streak</span>
      <span style={{ color: '#999', fontWeight: '400' }}>· {stage.name}</span>
    </div>
  );
}