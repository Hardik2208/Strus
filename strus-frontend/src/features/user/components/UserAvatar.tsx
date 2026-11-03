import React, { useState } from 'react';

interface UserAvatarProps {
  src?: string | null;
  firstName?: string;
  lastName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
};

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  src, 
  firstName = '', 
  lastName = '', 
  size = 'md',
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);

  const dimension = sizeMap[size];
  const initial = `${firstName.charAt(0) || ''}${lastName.charAt(0) || ''}`.toUpperCase() || 'U';

  const containerStyle: React.CSSProperties = {
    width: `${dimension}px`,
    height: `${dimension}px`,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--color-primary)',
    color: '#fff',
    fontWeight: 600,
    fontSize: size === 'sm' ? '14px' : size === 'md' ? '18px' : '28px',
    flexShrink: 0,
    overflow: 'hidden',
  };

  if (src && !imageError) {
    return (
      <div style={containerStyle} className={className}>
        <img 
          src={src} 
          alt={`${firstName} ${lastName}`.trim() || 'User avatar'} 
          onError={() => setImageError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    );
  }

  return (
    <div style={containerStyle} className={className} aria-label={`${firstName} ${lastName}`.trim()}>
      {initial}
    </div>
  );
};
