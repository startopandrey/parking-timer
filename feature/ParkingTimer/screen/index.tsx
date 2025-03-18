import { Text, View } from 'react-native';
import React, { useState } from 'react';
import ParkingTimerSpinner from '../components/parking-timer';

const ParkingTimer = () => {
  const [endTime, setEndTime] = useState<string | null>(null);
  const [totalSeconds, setTotalSeconds] = useState<number | null>(null);

  const onChangeSeconds = (time: number) => {
    setEndTime(calculateEndTime(time));
    setTotalSeconds(time);
    console.log(time);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 22, fontWeight: '500' }}>{endTime}</Text>
      <ParkingTimerSpinner onChangeSeconds={onChangeSeconds} />
    </View>
  );
};

function calculateEndTime(seconds: number | null): string {
  if (seconds === null) return '--:--';

  const now = new Date();
  const endTimeDate = new Date(now.getTime() + seconds * 1000);

  const hours = endTimeDate.getHours().toString().padStart(2, '0');
  const minutes = endTimeDate.getMinutes().toString().padStart(2, '0');

  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const dayName = days[endTimeDate.getDay()];

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  let dayText = '';
  if (endTimeDate.toDateString() === today.toDateString()) {
    dayText = 'today';
  } else if (endTimeDate.toDateString() === tomorrow.toDateString()) {
    dayText = 'tomorrow';
  } else {
    dayText = dayName;
  }

  return `Ends ${dayText} (${hours}:${minutes})`;
}

export default ParkingTimer;
