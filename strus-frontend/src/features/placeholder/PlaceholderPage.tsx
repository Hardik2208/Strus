import React from 'react';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description }) => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100%', 
      minHeight: '400px',
      padding: 'var(--space-48)',
      textAlign: 'center',
      backgroundColor: 'var(--color-surface)',
      borderRadius: '8px',
      border: '1px dashed var(--color-border)'
    }}>
      <h1 style={{ 
        fontSize: 'var(--text-xl)', 
        fontWeight: 600, 
        color: 'var(--color-text-primary)',
        marginBottom: 'var(--space-16)'
      }}>
        {title}
      </h1>
      <p style={{ 
        color: 'var(--color-text-secondary)',
        maxWidth: '400px',
        lineHeight: 1.5
      }}>
        {description}
      </p>
    </div>
  );
};
