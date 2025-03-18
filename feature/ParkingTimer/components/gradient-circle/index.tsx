import React from 'react';
import Animated, {
  SharedValue,
  useAnimatedProps,
} from 'react-native-reanimated';
import {
  Defs,
  LinearGradient,
  Path,
  Stop,
  Svg,
} from 'react-native-svg';

export interface GradientCircularProgressProps {
  progress: SharedValue<number>;
  size: number;
  startColor: string;
  endColor: string;
  middleColor: string;
  id?: string;
  strokeWidth?: number;
  emptyColor?: string;
  baseColor?: string; // New prop for base circle color
  children?: React.ReactNode;
  rotation: SharedValue<number>;
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

const GradientCircularProgress: React.FC<
  GradientCircularProgressProps
> = ({
  size,
  progress,
  strokeWidth = 6,
  emptyColor,
  startColor,
  endColor,
  middleColor,
  baseColor = '#DDDDDD', // Default base circle color
  rotation,
  children,
}) => {
  const DIAMETER = 50;
  const WIDTH = DIAMETER + strokeWidth;
  const halfCircumference = (Math.PI * 2 * (DIAMETER / 2)) / 2;

  const animatedFirstHalfProg = useAnimatedProps(() => {
    const dashArray =
      progress.value > DIAMETER
        ? halfCircumference
        : (progress.value / DIAMETER) * halfCircumference;
    return {
      strokeDasharray: `${dashArray},${halfCircumference}`,
      opacity: progress.value <= 0 ? 0 : 1,
    };
  });

  const animatedSecondHalfProg = useAnimatedProps(() => {

    const secondHalf =
      progress.value <= DIAMETER ? 0 : (progress.value - DIAMETER) / DIAMETER;
    const dashArray = secondHalf * halfCircumference;
    return {
      strokeDasharray: `${dashArray},${halfCircumference}`,
      opacity: progress.value < 50 ? 0 : 1,
    };
  });

  const animatedRotation = useAnimatedProps(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          position: 'relative',
        },
        animatedRotation,
      ]}
    >
      <Svg viewBox={`0 0 ${WIDTH} ${WIDTH}`}>
        <Defs>
          <LinearGradient
            id="firstHalfGradient"
            x1="50%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <Stop offset="0%" stopColor={startColor} />
            <Stop offset="90%" stopColor={middleColor} />
          </LinearGradient>

          <LinearGradient
            id="secondHalfGradient"
            x1="0%"
            y1="0%"
            x2="50%"
            y2="100%"
          >
            <Stop offset="0%" stopColor={endColor} />
            <Stop offset="90%" stopColor={middleColor} />
          </LinearGradient>
        </Defs>
        <Path
          fill="none"
          stroke={baseColor}
          d={`
              M ${strokeWidth / 2} ${WIDTH / 2}
              a ${DIAMETER / 2} ${DIAMETER / 2} 0 1 1 ${DIAMETER} 0
              a ${DIAMETER / 2} ${DIAMETER / 2} 0 1 1 -${DIAMETER} 0
            `}
          strokeWidth={strokeWidth}
        />

        <Path
          fill="none"
          stroke={emptyColor}
          d={`
              M ${strokeWidth / 2} ${WIDTH / 2}
              a ${DIAMETER / 2} ${DIAMETER / 2} 0 1 1 ${DIAMETER} 0
              a ${DIAMETER / 2} ${DIAMETER / 2} 0 1 1 -${DIAMETER} 0
            `}
          strokeWidth={strokeWidth}
        />

        <AnimatedPath
          fill="none"
          stroke="url(#firstHalfGradient)"
          strokeLinecap="round"
          animatedProps={animatedFirstHalfProg}
          d={`
                M ${WIDTH / 2} ${strokeWidth / 2}
                a ${DIAMETER / 2} ${DIAMETER / 2} 0 1 1 0 ${DIAMETER}
              `}
          strokeWidth={strokeWidth}
        />

        <AnimatedPath
          fill="none"
          stroke="url(#secondHalfGradient)"
          animatedProps={animatedSecondHalfProg}
          strokeLinecap="round"
          d={`
              M ${WIDTH / 2} ${WIDTH - strokeWidth / 2}
              a ${DIAMETER / 2} ${DIAMETER / 2} 0 0 1 0 -${DIAMETER}
            `}
          strokeWidth={strokeWidth}
        />
      </Svg>

      {children}
    </Animated.View>
  );
};

export default GradientCircularProgress;
