import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, G, Path, RadialGradient, Stop } from 'react-native-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Props {
  children: React.ReactNode;
  variant?: 'default' | 'onboarding' | 'dashboard' | 'auth';
}

const LightDriverBackground: React.FC<Props> = ({ children, variant = 'default' }) => {
  const getGradientColors = () => {
    switch (variant) {
      case 'onboarding':
        return ['#FFFFFF', '#FFF9E8', '#FFF3D1'];
      case 'dashboard':
        return ['#FFFFFF', '#FDF5E6', '#FFEEC2'];
      case 'auth':
        return ['#FFFFFF', '#FFF8E7', '#FFF0C9'];
      default:
        return ['#FFFFFF', '#FFF9EC', '#FFF3D7'];
    }
  };

  const renderDecorativeElements = () => (
    <Svg
      width={screenWidth}
      height={screenHeight}
      style={StyleSheet.absoluteFillObject}
      viewBox={`0 0 ${screenWidth} ${screenHeight}`}
    >
      <Defs>
        <RadialGradient id="lightCircleGradient" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#FFD580" stopOpacity="0.08" />
          <Stop offset="100%" stopColor="#F2C87E" stopOpacity="0.02" />
        </RadialGradient>
      </Defs>

      {/* Soft glowing circles */}
      <Circle cx={screenWidth * 0.8} cy={screenHeight * 0.2} r="90" fill="url(#lightCircleGradient)" />
      <Circle cx={screenWidth * 0.25} cy={screenHeight * 0.7} r="70" fill="url(#lightCircleGradient)" />

      {/* Thin smooth road paths */}
      <G opacity="0.08">
        <Path
          d={`M0 ${screenHeight * 0.45}
              Q${screenWidth * 0.35} ${screenHeight * 0.4}
              ${screenWidth * 0.65} ${screenHeight * 0.45}
              T${screenWidth} ${screenHeight * 0.43}`}
          stroke="#CFA96A"
          strokeWidth="1"
          fill="none"
        />
        <Path
          d={`M0 ${screenHeight * 0.8}
              Q${screenWidth * 0.4} ${screenHeight * 0.83}
              ${screenWidth * 0.7} ${screenHeight * 0.78}
              T${screenWidth} ${screenHeight * 0.8}`}
          stroke="#CFA96A"
          strokeWidth="1"
          fill="none"
        />
      </G>

      {/* Minimal car shape (very subtle, light tone) */}
      <G opacity="0.05">
        <Path
          d={`M${screenWidth * 0.35},${screenHeight * 0.88}
              h${screenWidth * 0.3}
              q20,-8 0,-20
              h-${screenWidth * 0.3}
              q-20,8 0,20z`}
          fill="#BFA35E"
        />
        <Circle cx={screenWidth * 0.4} cy={screenHeight * 0.88} r="6" fill="#BFA35E" />
        <Circle cx={screenWidth * 0.6} cy={screenHeight * 0.88} r="6" fill="#BFA35E" />
      </G>

      {/* Faint bottom fade resembling road reflection */}
      <G opacity="0.1">
        <Path
          d={`M0 ${screenHeight}
              Q${screenWidth * 0.5} ${screenHeight * 0.94}
              ${screenWidth} ${screenHeight}`}
          fill="#F2C87E"
        />
      </G>
    </Svg>
  );

  return (
    <View style={styles.container}>
      {/* Gentle Gradient Background */}
      <LinearGradient
        colors={getGradientColors()}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Decorative SVGs */}
      {renderDecorativeElements()}

      {/* Foreground content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    zIndex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
});

export default LightDriverBackground;
