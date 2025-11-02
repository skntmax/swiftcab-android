import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  Path,
  Polygon,
  RadialGradient,
  Stop
} from 'react-native-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Props {
  children: React.ReactNode;
  variant?: 'default' | 'onboarding' | 'dashboard' | 'auth';
}

const StylishBackground: React.FC<Props> = ({ children, variant = 'default' }) => {
  const getGradientColors = () => {
    switch (variant) {
      case 'onboarding':
        return ['#FFF8DC', '#FAF0E6', '#F5E6A8'];
      case 'dashboard':
        return ['#FFF8DC', '#FFE4B5', '#DEB887'];
      case 'auth':
        return ['#FFFAF0', '#FFF8DC', '#F0E68C'];
      default:
        return ['#FFF8DC', '#FAF0E6', '#FFEFD5'];
    }
  };

  const renderDecoractiveElements = () => (
    <Svg
      width={screenWidth}
      height={screenHeight}
      style={StyleSheet.absoluteFillObject}
      viewBox={`0 0 ${screenWidth} ${screenHeight}`}
    >
      <Defs>
        <RadialGradient id="circleGradient" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#ED8902" stopOpacity="0.1" />
          <Stop offset="100%" stopColor="#ED8902" stopOpacity="0.02" />
        </RadialGradient>
      </Defs>
      
      {/* Large decorative circles */}
      <Circle 
        cx={screenWidth * 0.85} 
        cy={screenHeight * 0.15} 
        r="80" 
        fill="url(#circleGradient)" 
      />
      <Circle 
        cx={screenWidth * 0.15} 
        cy={screenHeight * 0.75} 
        r="60" 
        fill="url(#circleGradient)" 
      />
      
      {/* Taxi/Car silhouette pattern */}
      <G opacity="0.05">
        <Path
          d={`M${screenWidth * 0.7} ${screenHeight * 0.8} 
             Q${screenWidth * 0.75} ${screenHeight * 0.78} 
             ${screenWidth * 0.8} ${screenHeight * 0.8}
             L${screenWidth * 0.85} ${screenHeight * 0.82}
             Q${screenWidth * 0.87} ${screenHeight * 0.83}
             ${screenWidth * 0.85} ${screenHeight * 0.84}
             L${screenWidth * 0.8} ${screenHeight * 0.84}
             Q${screenWidth * 0.75} ${screenHeight * 0.86}
             ${screenWidth * 0.7} ${screenHeight * 0.84}
             Z`}
          fill="#ED8902"
        />
        
        {/* Small car icons scattered */}
        <Circle cx={screenWidth * 0.2} cy={screenHeight * 0.3} r="3" fill="#ED8902" />
        <Circle cx={screenWidth * 0.8} cy={screenHeight * 0.4} r="2" fill="#ED8902" />
        <Circle cx={screenWidth * 0.1} cy={screenHeight * 0.6} r="2.5" fill="#ED8902" />
      </G>

      {/* Geometric pattern */}
      <G opacity="0.08">
        {/* Road-like lines */}
        <Path
          d={`M0 ${screenHeight * 0.3} 
             Q${screenWidth * 0.3} ${screenHeight * 0.25} 
             ${screenWidth * 0.6} ${screenHeight * 0.3}
             T${screenWidth} ${screenHeight * 0.28}`}
          stroke="#ED8902"
          strokeWidth="1"
          fill="none"
        />
        <Path
          d={`M0 ${screenHeight * 0.7} 
             Q${screenWidth * 0.4} ${screenHeight * 0.72} 
             ${screenWidth * 0.7} ${screenHeight * 0.68}
             T${screenWidth} ${screenHeight * 0.7}`}
          stroke="#ED8902"
          strokeWidth="1"
          fill="none"
        />
      </G>

      {/* Corner decorations */}
      <G opacity="0.15">
        {/* Top left corner */}
        <Polygon
          points={`0,0 ${screenWidth * 0.15},0 0,${screenHeight * 0.1}`}
          fill="#ED8902"
        />
        
        {/* Bottom right corner */}
        <Polygon
          points={`${screenWidth},${screenHeight} 
                   ${screenWidth * 0.85},${screenHeight} 
                   ${screenWidth},${screenHeight * 0.9}`}
          fill="#ED8902"
        />
      </G>
    </Svg>
  );

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={getGradientColors()}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Decorative Elements */}
      {renderDecoractiveElements()}
      
      {/* Content */}
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
  },
});

export default StylishBackground;
