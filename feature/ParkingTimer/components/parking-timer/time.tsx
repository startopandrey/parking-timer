import React from 'react';
import { Text } from 'react-native';

interface TimeProps {
  seconds: number; // accepts a total number of seconds
}

const Time: React.FC<TimeProps> = ({ seconds }) => {
  const formatTime = (totalSeconds: number) => {
    const days = Math.floor(totalSeconds / 86400);
    const remainderAfterDays = totalSeconds % 86400;
    const hours = Math.floor(remainderAfterDays / 3600);
    const remainderAfterHours = remainderAfterDays % 3600;
    const minutes = Math.floor(remainderAfterHours / 60);
    const secs = Math.floor(remainderAfterHours % 60);

    const parts: string[] = [];

    if (days > 0) {
      parts.push(`${days}d`);
    }
    if (hours > 0 || (days > 0 && secs > 0)) {
      parts.push(`${hours}h`);
    }
    if (minutes > 0) {
      parts.push(`${minutes}m`);
    }
    if (secs >= 0) {
      parts.push(`${secs}s`);
    }
    return parts.length > 0 ? parts.join(' ') : '0s';
  };

  return (
    <Text style={{ fontSize: 40, fontWeight: '700' }}>
      {formatTime(seconds)}
    </Text>
  );
};

export default Time;