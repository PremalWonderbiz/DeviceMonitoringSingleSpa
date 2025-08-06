// components/AlarmBadge.tsx
import React from 'react';
import * as styles from '@/styles/scss/Badge.module.scss';

interface BadgeProps {
  label: string;
  bgColor?: string;
  textColor?: string;
}

const Badge: React.FC<BadgeProps> = ({ label, bgColor, textColor }) => {
  
  return (
    <span className={`${styles.badge} ${styles[`badgebg--${bgColor}`]} ${styles[`badgetext--${textColor}`]}`} >
      {label}
    </span>
  );
};

export default Badge;