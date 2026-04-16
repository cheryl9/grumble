// All possible achievements — used to determine locked vs unlocked state
export const ALL_ACHIEVEMENTS = [
  {
    key: 'streak_grumbler',
    label: 'Streak Grumbler',
    description: 'Updated for 2 weeks in a row',
    emoji: '🫃',
  },
  {
    key: 'grumble_savior',
    label: 'Grumble Savior',
    description: 'Helped others find food spots',
    emoji: '🫀',
  },
  {
    key: 'grumble_frequent',
    label: 'Grumble Frequent',
    description: 'Connected with more than 20 friends',
    emoji: '🫁',
  },
  {
    key: 'connected_grumbler',
    label: 'Connected Grumbler',
    description: 'Recommended Grumble to another friend',
    emoji: '🧠',
  },
  {
    key: 'first_bite',
    label: 'First Bite',
    description: 'Post your very first Grumble to the feed',
    emoji: '🍽️',
  },
  {
    key: 'grumble_chef',
    label: 'Grumble Chef',
    description: 'Upload 10 high-quality photos of your meals',
    emoji: '👨‍🍳',
  },
  {
    key: 'wandering_womb',
    label: 'Wandering Womb',
    description: 'Post food spots in 5 different planning areas',
    emoji: '🗺️',
  },
  {
    key: 'digestive_duo',
    label: 'Digestive Duo',
    description: 'Tag a friend in a Grumble for the first time',
    emoji: '👥',
  },
  {
    key: 'mouth_watering',
    label: 'Mouth-Watering',
    description: "Have one of your Grumbles saved to 20 different users' maps",
    emoji: '💧',
  },
  {
    key: 'bottomless_pit',
    label: 'Bottomless Pit',
    description: 'Maintain a 30-day streak of posting your daily lunch',
    emoji: '🔥',
  },
  {
    key: 'midnight_munchies',
    label: 'Midnight Munchies',
    description: 'Find and share a supper spot open past 2:00 AM',
    emoji: '🌙',
  },
  {
    key: 'grumble_general',
    label: 'Grumble General',
    description: 'Successfully host a 5-person dinner',
    emoji: '🎖️',
  },
  {
    key: 'savvy_stomach',
    label: 'Savvy Stomach',
    description: 'Share 5 "Under $10" hidden gems with at least 10 likes',
    emoji: '💰',
  },
  {
    key: 'grand_grumbler',
    label: 'The Grand Grumbler',
    description: 'Complete 50 unique food missions',
    emoji: '🏆',
  },
];

export default function AchievementsSection({ unlockedKeys = [], onViewAll }) {
  // Show only first 4 unlocked, or first 4 total if none unlocked yet
  const unlocked = ALL_ACHIEVEMENTS.filter((a) => unlockedKeys.includes(a.key));
  const displayed = unlocked.length > 0 ? unlocked.slice(0, 4) : ALL_ACHIEVEMENTS.slice(0, 4);
  const total = unlocked.length;

  return (
    <div
      style={{
        backgroundColor: '#FDDCB5',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ fontSize: '16px', fontWeight: '600', color: '#111' }}>
          Achievements ({total})
        </span>
        <button
          onClick={onViewAll}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#2945A8',
            fontSize: '13px',
            textDecoration: 'underline',
          }}
        >
          View all →
        </button>
      </div>

      {/* Achievement cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {displayed.map((achievement) => {
          const isUnlocked = unlockedKeys.includes(achievement.key);
          return (
            <div
              key={achievement.key}
              title={achievement.description}
              style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '16px 12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                opacity: isUnlocked ? 1 : 0.45,
                filter: isUnlocked ? 'none' : 'grayscale(60%)',
                cursor: 'default',
              }}
            >
              {/* Organ-style illustration placeholder */}
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#FCF1DD',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                }}
              >
                {achievement.emoji}
              </div>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#333',
                  textAlign: 'center',
                  lineHeight: 1.3,
                }}
              >
                {achievement.label}
              </span>
              <span
                style={{
                  fontSize: '10px',
                  color: '#888',
                  textAlign: 'center',
                  lineHeight: 1.3,
                }}
              >
                {achievement.description}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}