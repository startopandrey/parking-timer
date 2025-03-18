import React from 'react';
import { View } from 'react-native';
import { Svg, Circle } from 'react-native-svg';

interface DottedCircleProps {
  size?: number;
  dotSize?: number;
  bigDotSize?: number;
  dotColor?: string;
  bigDotColor?: string;
}

const DottedCircle: React.FC<DottedCircleProps> = ({
  size = 250,
  dotSize = 2,
  bigDotSize = 3,
  dotColor = 'black',
  bigDotColor = 'black',
}) => {
  const dotCount = 60;
  const radius = size / 2 - bigDotSize * 2;

  const dots = Array.from({ length: dotCount }).map((_, index) => {
    const angle = (index / dotCount) * 2 * Math.PI;
    const x = radius * Math.cos(angle) + size / 2;
    const y = radius * Math.sin(angle) + size / 2;
    const isBigDot = index % 5 === 0;

    return (
      <Circle
        key={index}
        cx={x}
        cy={y}
        r={isBigDot ? bigDotSize : dotSize}
        fill={isBigDot ? bigDotColor : dotColor}
      />
    );
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {dots}
      </Svg>
    </View>
  );
};

export default DottedCircle;
