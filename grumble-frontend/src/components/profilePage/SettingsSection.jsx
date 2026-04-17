import { Settings, Lock, HelpCircle } from 'lucide-react';

export default function SettingsSection({ onAccountInfo, onChangePassword, onHelpSupport }) {
  const items = [
    {
      icon: <Settings size={20} color="#2945A8" />,
      label: 'Account Information',
      onClick: onAccountInfo,
    },
    {
      icon: <Lock size={20} color="#2945A8" />,
      label: 'Change Password',
      onClick: onChangePassword,
    },
    {
      icon: <HelpCircle size={20} color="#2945A8" />,
      label: 'Help & Support',
      onClick: onHelpSupport,
    },
  ];

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
      <span style={{ fontSize: '16px', fontWeight: '600', color: '#111', display: 'block', marginBottom: '14px' }}>
        Settings
      </span>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {items.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '14px 16px',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
              fontSize: '15px',
              fontWeight: '500',
              color: '#222',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FCF1DD')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}