import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Platform, StyleSheet, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface GlowingParticleProps {
  particleIndex: number;
  spacing: number;
}

const GlowingParticle: React.FC<GlowingParticleProps> = ({ particleIndex, spacing }) => {
  const rotationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let rotationSequence: Animated.CompositeAnimation;

    if (particleIndex === 0) {
      // 3n + 1: animate 10s alternate infinite
      rotationSequence = Animated.sequence([
        Animated.timing(rotationAnim, {
          toValue: 180,
          duration: 5000,
          useNativeDriver: true,
        }),
        Animated.timing(rotationAnim, {
          toValue: 360,
          duration: 5000,
          useNativeDriver: true,
        }),
      ]);
    } else if (particleIndex === 1) {
      // 3n + 2: animate-reverse 3s alternate infinite
      rotationSequence = Animated.sequence([
        Animated.timing(rotationAnim, {
          toValue: 360,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(rotationAnim, {
          toValue: 180,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(rotationAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]);
    } else {
      // 3n + 3: animate 8s alternate infinite
      rotationSequence = Animated.sequence([
        Animated.timing(rotationAnim, {
          toValue: 180,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(rotationAnim, {
          toValue: 360,
          duration: 4000,
          useNativeDriver: true,
        }),
      ]);
    }

    Animated.loop(rotationSequence).start();
  }, []);

  const rotation = rotationAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  // Get colors based on particle type
  const getParticleColor = () => {
    if (particleIndex === 0) {
      return {
        background: 'rgba(134,255,0,1)',
        shadow: 'rgba(134,255,0,1)',
      };
    } else if (particleIndex === 1) {
      return {
        background: 'rgba(255,214,0,1)',
        shadow: 'rgba(255,214,0,1)',
      };
    } else {
      return {
        background: 'rgba(0,226,255,1)',
        shadow: 'rgba(0,226,255,1)',
      };
    }
  };

  const colors = getParticleColor();

  return (
    <Animated.View
      style={[
        styles.particleContainer,
        {
          top: spacing,
          left: spacing,
          right: spacing,
          bottom: spacing,
          transform: [{ rotate: rotation }],
        },
      ]}
    >
      <View
        style={[
          styles.particleDot,
          {
            backgroundColor: colors.background,
            shadowColor: colors.shadow,
          },
        ]}
      />
    </Animated.View>
  );
};

interface GlowingGroupProps {
  index: number;
  position: { x: number; y: number };
}

const GlowingGroup: React.FC<GlowingGroupProps> = ({ index, position }) => {
  const groupRotationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Color change animation (hue-rotate equivalent) - rotates the whole group
    Animated.loop(
      Animated.timing(groupRotationAnim, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const isEven = index % 2 === 0;
  const groupRotation = groupRotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.glowingGroup,
        {
          left: position.x,
          top: position.y,
          transform: [{ rotate: groupRotation }],
        },
      ]}
    >
      {[0, 1, 2].map((particleIndex) => (
        <GlowingParticle
          key={particleIndex}
          particleIndex={particleIndex}
          spacing={80 * (particleIndex + 1)}
        />
      ))}
    </Animated.View>
  );
};

const ParticlesBackground: React.FC = () => {
  // Position 4 glowing groups across the screen
  const positions = [
    { x: SCREEN_WIDTH * 0.1, y: SCREEN_HEIGHT * 0.1 },
    { x: SCREEN_WIDTH * 0.6, y: SCREEN_HEIGHT * 0.2 },
    { x: SCREEN_WIDTH * 0.2, y: SCREEN_HEIGHT * 0.6 },
    { x: SCREEN_WIDTH * 0.7, y: SCREEN_HEIGHT * 0.7 },
  ];

  return (
    <View style={styles.container} pointerEvents="none">
      {positions.map((position, index) => (
        <GlowingGroup key={index} index={index} position={position} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    overflow: 'hidden',
  },
  glowingGroup: {
    position: 'absolute',
    width: 700,
    height: 550,
    marginLeft: -150,
    marginTop: -150,
  },
  particleContainer: {
    position: 'absolute',
  },
  particleDot: {
    position: 'absolute',
    top: '50%',
    left: -8,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 20,
    // Enhanced glow effect
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 20,
      },
      android: {
        elevation: 20,
      },
    }),
  },
});

export default ParticlesBackground;

