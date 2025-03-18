import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Animated,
  PanResponder,
  Dimensions,
  StyleSheet,
  Easing,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import GradientCircularProgress from '../gradient-circle';
import { useSharedValue } from 'react-native-reanimated';
import DottedCircle from './dotted-circle';
import Time from './time';
import AdditionalTimeButtons from './additional-time-buttons';

const { width, height } = Dimensions.get('window');

const CIRCLE_DIAMETER = 300;
const CIRCLE_STROKE_WIDTH = 2;
const DOTTED_CIRCLE_DIAMETER = 270;

const DOT_COLOR = '#DEE2ED';
const BIG_DOT_COLOR = '#6D6F72';
const GRADIENT_COLORS = ['#a6c3fa', '#528df9', '#0E61FE'];

function normalizeAngle(angle: number) {
  return ((angle % 360) + 360) % 360;
}

// Helper to compute the minimal angular difference (in degrees) between two angles.
const getAngleDelta = (current: number, previous: number) => {
  let delta = current - previous;
  if (delta > 180) {
    delta -= 360;
  } else if (delta < -180) {
    delta += 360;
  }
  return delta;
};

function getBothAngleDifferences(
  mainAngle: number,
  otherAngle: number
): number {
  let clockwise = (otherAngle - mainAngle + 360) % 360;
  return clockwise;
}

const normalizeAngleToPercent = (angle: number) => {
  return (((angle % 360) + 360) % 360) / 3.6;
};

// convert degrees to seconds
const degreesToSeconds = (degrees: number) => {
  const seconds = Math.round(degrees * 10);
  return seconds;
};

export default function ParkingTimer({
  onChangeSeconds,
}: {
  onChangeSeconds: (value: number) => void;
}) {
  const rotateRef = useRef(new Animated.Value(0)).current;
  const initialAngle = useRef(0);
  const centerRef = useRef({ x: width / 2, y: height / 2 });

  const circleRef = useRef(null);
  const progressValue = useSharedValue(0);
  const rotationValue = useSharedValue(0);
  const totalRotatedDegRef = useRef(0);
  const prevPercentageWithOffset = useRef(0);
  const [totalDeg, setTotalDeg] = useState(0);
  const currentDirection = useRef('forward');
  const currentVelocity = useRef(0);
  const totalDegBeforeAdditional = useRef(0);
  const isAnimating = useRef(false);

  const onChangeRotation = (value: number) => {
    progressValue.value = value >= 0 ? (value <= 360 ? value / 3.6 : 100) : 0;
    rotationValue.value = value > 0 ? (value > 360 ? value - 360 : 0) : 0;

    setTotalDeg(value);
    totalRotatedDegRef.current = value;
  };

  const onNegativeRotation = () => {
    setTotalDeg(0);
    progressValue.value = 0;
    rotationValue.value = 0;
  };

  // Update progress based on rotation
  useEffect(() => {
    const id = rotateRef.addListener(({ value }) => {
      if (value > 0) {
        onChangeRotation(value);
        if (!isAnimating.current) {
          totalDegBeforeAdditional.current = value;
        }
      } else {
        onNegativeRotation();
      }
    });
    return () => rotateRef.removeListener(id);
  }, []);

  const calculateAngle = useCallback(
    (x: number, y: number): number => {
      const dx = x - centerRef.current.x;
      const dy = y - centerRef.current.y;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      return angle;
    },
    [centerRef.current.x, centerRef.current.y]
  );

  useEffect(() => {
    if (totalRotatedDegRef.current >= 0 && onChangeSeconds) {
      onChangeSeconds(degreesToSeconds(totalRotatedDegRef.current));
    }
  }, [totalRotatedDegRef.current]);

  // Update circle center position on layout change
  useEffect(() => {
    if (circleRef.current) {
      // @ts-ignore
      circleRef.current?.measure(
        (
          x: number,
          y: number,
          w: number,
          h: number,
          pageX: number,
          pageY: number
        ) => {
          centerRef.current = { x: pageX + w / 2, y: pageY + h / 2 };
        }
      );
    }
  }, [circleRef.current]);

  const onFirstTouch = (evt: GestureResponderEvent) => {
    currentVelocity.current = 0;
    rotateRef.stopAnimation();

    // Calculated angle from touch point
    initialAngle.current = calculateAngle(
      evt.nativeEvent.pageX,
      evt.nativeEvent.pageY
    );
  };

  const onGestureMove = (
    evt: GestureResponderEvent,
    gestureState: PanResponderGestureState
  ) => {
    const newAngle = calculateAngle(gestureState.moveX, gestureState.moveY);

    const newAngleWithOffset = getBothAngleDifferences(
      normalizeAngle(initialAngle.current),
      normalizeAngle(newAngle)
    );

    const delta = getAngleDelta(
      newAngleWithOffset,
      prevPercentageWithOffset.current * 3.6
    );

    currentDirection.current =
      delta > 0 ? 'forward' : delta < 0 ? 'backward' : '';

    // In presentage
    const newAngleInPercentageWithOffset =
      normalizeAngleToPercent(newAngleWithOffset);

    prevPercentageWithOffset.current = newAngleInPercentageWithOffset;

    const angleDiff = totalRotatedDegRef.current + (delta || 0);

    totalRotatedDegRef.current = angleDiff;

    setTotalDeg(totalRotatedDegRef.current);

    const rotation = totalRotatedDegRef.current;

    rotateRef.setValue(rotation);
  };

  const onTouchRelease = (
    e: GestureResponderEvent,
    gestureState: PanResponderGestureState
  ) => {
    prevPercentageWithOffset.current = 0;
    if (totalRotatedDegRef.current < 0) {
      totalRotatedDegRef.current = 0;
      rotateRef.setValue(0);
      progressValue.value = 0;
      rotationValue.value = 0;
      return;
    }

    let direction = currentDirection.current == 'forward' ? 1 : -1;

    // calculate the rotational momentum based on the gesture
    const velocityMagnitude = Math.sqrt(
      gestureState.vx * gestureState.vx + gestureState.vy * gestureState.vy
    );

    // ignore small gestures
    if (velocityMagnitude < 0.2) return;

    let additionalRotation = velocityMagnitude * 1.1;
    additionalRotation *= direction;

    const currentVelocity = additionalRotation / 10;

    Animated.decay(rotateRef, {
      velocity: currentVelocity,
      deceleration: 0.997, // closer to 1 = longer spin
      useNativeDriver: true,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => true,
      onPanResponderGrant: onFirstTouch,
      onPanResponderMove: onGestureMove,
      onPanResponderRelease: onTouchRelease,
    })
  ).current;

  const addMinutes = (minutes: number) => {
    const additionalDegrees = minutes * 6; // 360/60 = 6

    const newTotalDeg = totalDegBeforeAdditional.current + additionalDegrees;
    totalDegBeforeAdditional.current += additionalDegrees;

    if (minutes >= 1440) {
      rotateRef.setValue(newTotalDeg);
      return;
    }

    const duration = minutes * 20;
    isAnimating.current = true;

    Animated.timing(rotateRef, {
      toValue: newTotalDeg,
      duration: duration,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => (isAnimating.current = false));
  };

  const rotateAnimated = rotateRef.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.mainContainer}>
      <Time seconds={degreesToSeconds(totalDeg)}></Time>
      <View style={{ marginTop: 32 }}></View>
      <GradientCircularProgress
        startColor={GRADIENT_COLORS[0]}
        middleColor={GRADIENT_COLORS[1]}
        endColor={GRADIENT_COLORS[2]}
        strokeWidth={CIRCLE_STROKE_WIDTH}
        rotation={rotationValue}
        progress={progressValue}
        size={CIRCLE_DIAMETER}
      >
        <View style={styles.container} {...panResponder.panHandlers}>
          <Animated.View
            ref={circleRef}
            style={[styles.wheel, { transform: [{ rotate: rotateAnimated }] }]}
          >
            <DottedCircle
              size={DOTTED_CIRCLE_DIAMETER}
              dotColor={DOT_COLOR}
              bigDotColor={BIG_DOT_COLOR}
            ></DottedCircle>
          </Animated.View>
        </View>
      </GradientCircularProgress>
      <View style={{ marginTop: 32 }}></View>
      <AdditionalTimeButtons addMinutes={addMinutes}></AdditionalTimeButtons>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { justifyContent: 'center', alignItems: 'center' },
  container: {
    position: 'absolute',
    top: 15,
    left: 15,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheel: {
    width: DOTTED_CIRCLE_DIAMETER,
    height: DOTTED_CIRCLE_DIAMETER,
    borderRadius: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
