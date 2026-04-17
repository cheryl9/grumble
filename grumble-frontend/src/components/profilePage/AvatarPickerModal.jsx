import { useState } from 'react';
import api from '../../services/api';

export default function AvatarPickerModal({
  achievement,
  isCurrentlyEquipped,
  onEquip,
  onUnequip,
  onClose,
}) {
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleEquip = async () => {
    setLoading(true);
    try {
      await api.put('/auth/achievements/equip', {
        achievementKey: achievement.key,
      });
      onEquip(achievement.key);
    } catch (err) {
      console.error('Failed to equip avatar:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnequip = async () => {
    setLoading(true);
    try {
      await api.put('/auth/achievements/equip', { achievementKey: null });
      onUnequip();
    } catch (err) {
      console.error('Failed to unequip avatar:', err);
    } finally {
      setLoading(false);
    }
  };

  const rarityColors = {
    common: '#6baa75',
    rare: '#4a90d9',
    epic: '#9b59b6',
  };
  const rarityColor = rarityColors[achievement.rarity] ?? '#888';

  return (
    // Backdrop
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '16px',
      }}
    >
      {/* Modal card */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#fff',
          borderRadius: '20px',
          padding: '28px 24px 24px',
          width: '100%',
          maxWidth: '320px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          animation: 'modalIn 0.2s ease',
        }}
      >
        <style>{`
          @keyframes modalIn {
            from { transform: scale(0.92) translateY(8px); opacity: 0; }
            to   { transform: scale(1)    translateY(0);   opacity: 1; }
          }
        `}</style>

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#aaa',
            lineHeight: 1,
          }}
        >
          ×
        </button>

        {/* Large avatar preview */}
        <div
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: `0 0 0 4px ${rarityColor}33`,
            border: `2.5px solid ${rarityColor}`,
          }}
        >
          {!imgError ? (
            <img
              src={`/src/assets/avatars/${achievement.avatarFile}`}
              alt={achievement.label}
              style={{ width: '80px', height: '80px', objectFit: 'contain' }}
              onError={() => setImgError(true)}
            />
          ) : (
            <span style={{ fontSize: '48px' }}>{achievement.emoji}</span>
          )}
        </div>

        {/* Info */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#111' }}>
            {achievement.label}
          </div>
          <div
            style={{
              marginTop: '4px',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: rarityColor,
            }}
          >
            {achievement.rarity}
          </div>
          <div
            style={{
              marginTop: '8px',
              fontSize: '13px',
              color: '#666',
              lineHeight: 1.5,
            }}
          >
            {achievement.description}
          </div>
        </div>

        {/* Avatar hint */}
        <div
          style={{
            backgroundColor: '#FFF8F0',
            border: '1px solid #ffffff',
            borderRadius: '10px',
            padding: '10px 14px',
            fontSize: '12px',
            color: '#a07850',
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          This icon will appear as your <strong>profile picture</strong> and{' '}
          <strong>map pin</strong> when you set it as your avatar.
        </div>

        {/* Actions */}
        {isCurrentlyEquipped ? (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div
              style={{
                textAlign: 'center',
                fontSize: '12px',
                color: '#F78660',
                fontWeight: '700',
              }}
            >
              ✓ Currently equipped
            </div>
            <button
              onClick={handleUnequip}
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '10px',
                border: '1.5px solid #ddd',
                backgroundColor: 'transparent',
                color: '#888',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {loading ? 'Removing…' : 'Remove avatar'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleEquip}
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: '#F78660',
              color: '#fff',
              fontWeight: '800',
              fontSize: '15px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(247,134,96,0.35)',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            {loading ? 'Setting…' : 'Set as my avatar'}
          </button>
        )}
      </div>
    </div>
  );
}