
import React, { useEffect, useState } from 'react';

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

const fontSizeMap = {
  sm: '14px',
  md: '18px',
  lg: '24px',
  xl: '32px',
};

const getInitials = (firstName: string, lastName: string): string => {
  const first = firstName.trim();
  const last = lastName.trim();

  if (first && last) {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  }

  const name = first || last;

  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);

    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }

    return name.slice(0, 2).toUpperCase();
  }

  return 'U';
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  firstName = '',
  lastName = '',
  size = 'md',
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  // Reset the failed-image state when the avatar URL changes.
  useEffect(() => {
    setImageError(false);
  }, [src]);

  const dimension = sizeMap[size];
  const initials = getInitials(firstName, lastName);
  const fullName = `${firstName} ${lastName}`.trim();
  const imageAlt = fullName
    ? `${fullName}'s avatar`
    : 'User avatar';

  const containerStyle: React.CSSProperties = {
    width: `${dimension}px`,
    height: `${dimension}px`,
    minWidth: `${dimension}px`,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--color-primary)',
    color: '#fff',
    fontWeight: 600,
    fontSize: fontSizeMap[size],
    flexShrink: 0,
    overflow: 'hidden',
  };

  const shouldShowImage = Boolean(src?.trim()) && !imageError;

  return (
    <div
      style={containerStyle}
      className={className}
      role="img"
      aria-label={fullName || 'User'}
    >
      {shouldShowImage ? (
        <img
          src={src!}
          alt={imageAlt}
          onError={() => setImageError(true)}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </div>
  );
};
