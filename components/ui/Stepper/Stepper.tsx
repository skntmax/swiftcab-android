import React, { JSX } from 'react';
import {
    ScrollView,
    StyleSheet,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';
import {
    Button,
    Divider,
    IconButton,
    Surface,
    Text,
    useTheme
} from 'react-native-paper';
// Types
interface Step {
  label: string;
  description?: string;
  icon?: string;
  activeIcon?: string;
  completedIcon?: string;
}

type StepStatus = 'completed' | 'active' | 'inactive';
type Orientation = 'horizontal' | 'vertical';

interface StepperProps {
  steps?: Step[];
  currentStep?: number;
  onStepChange?: (stepIndex: number) => void;
  showStepNumbers?: boolean;
  showProgressBar?: boolean;
  allowStepClick?: boolean;
  orientation?: Orientation;
  style?: ViewStyle;
  stepStyle?: ViewStyle;
  activeStepStyle?: ViewStyle;
  completedStepStyle?: ViewStyle;
  contentStyle?: ViewStyle;
}

interface StepContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface StepperNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext?: () => void;
  onPrevious?: () => void;
  onFinish?: () => void;
  nextLabel?: string;
  previousLabel?: string;
  finishLabel?: string;
  style?: ViewStyle;
}

// Generic Stepper Component
const Stepper: React.FC<StepperProps> = ({
  steps = [],
  currentStep = 0,
  onStepChange,
  showStepNumbers = true,
  showProgressBar = true,
  allowStepClick = true,
  orientation = 'horizontal',
  style,
  stepStyle,
  activeStepStyle,
  completedStepStyle,
}) => {
  const theme = useTheme();

  const handleStepPress = (stepIndex: number): void => {
    if (allowStepClick && onStepChange) {
      onStepChange(stepIndex);
    }
  };

  const getStepStatus = (stepIndex: number): StepStatus => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'active';
    return 'inactive';
  };

  const getStepColor = (status: StepStatus): string => {
    switch (status) {
      case 'completed':
        return theme.colors.primary;
      case 'active':
        return theme.colors.primary;
      case 'inactive':
      default:
        return theme.colors.outline;
    }
  };

  const getStepIcon = (status: StepStatus, stepIndex: number): string => {
    const step = steps[stepIndex];
    if (status === 'completed') {
      return step?.completedIcon || step?.icon || 'check';
    }
    if (status === 'active') {
      return step?.activeIcon || step?.icon || (showStepNumbers ? (stepIndex + 1).toString() : 'record-circle');
    }
    return step?.icon || (showStepNumbers ? (stepIndex + 1).toString() : 'circle-outline');
  };

  const renderHorizontalStepper = (): JSX.Element => (
    <View style={[styles.horizontalContainer, style]}>
      {/* Progress Bar */}
      {showProgressBar && (
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              { backgroundColor: theme.colors.outline },
            ]}
          />
          <View
            style={[
              styles.progressBarFill,
              {
                backgroundColor: theme.colors.primary,
                width: `${(currentStep / Math.max(steps.length - 1, 1)) * 100}%`,
              },
            ]}
          />
        </View>
      )}

      {/* Steps */}
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const stepColor = getStepColor(status);
          const icon = getStepIcon(status, index);

          return (
            <View key={index} style={styles.stepContainer}>
              <Surface
                style={[
                  styles.stepCircle,
                  stepStyle,
                  status === 'active' && activeStepStyle,
                  status === 'completed' && completedStepStyle,
                  {
                    backgroundColor:
                      status === 'inactive' ? theme.colors.surface : stepColor,
                    borderColor: stepColor,
                  },
                ]}
                elevation={status === 'active' ? 2 : 0}
              >
                <IconButton
                  icon={icon}
                  size={20}
                  iconColor={
                    status === 'inactive' ? theme.colors.outline : theme.colors.onPrimary
                  }
                  onPress={() => handleStepPress(index)}
                  disabled={!allowStepClick}
                />
              </Surface>
              <Text
                variant="bodySmall"
                style={[
                  styles.stepLabel,
                  { color: status === 'inactive' ? theme.colors.outline : stepColor },
                ]}
              >
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderVerticalStepper = (): JSX.Element => (
    <View style={[styles.verticalContainer, style]}>
      {steps.map((step, index) => {
        const status = getStepStatus(index);
        const stepColor = getStepColor(status);
        const icon = getStepIcon(status, index);
        const isLast = index === steps.length - 1;

        return (
          <View key={index} style={styles.verticalStepContainer}>
            <View style={styles.verticalStepHeader}>
              <Surface
                style={[
                  styles.stepCircle,
                  stepStyle,
                  status === 'active' && activeStepStyle,
                  status === 'completed' && completedStepStyle,
                  {
                    backgroundColor:
                      status === 'inactive' ? theme.colors.surface : stepColor,
                    borderColor: stepColor,
                  },
                ]}
                elevation={status === 'active' ? 2 : 0}
              >
                <IconButton
                  icon={icon}
                  size={20}
                  iconColor={
                    status === 'inactive' ? theme.colors.outline : theme.colors.onPrimary
                  }
                  onPress={() => handleStepPress(index)}
                  disabled={!allowStepClick}
                />
              </Surface>
              <Text
                variant="titleMedium"
                style={[
                  styles.verticalStepLabel,
                  { color: status === 'inactive' ? theme.colors.outline : stepColor },
                ]}
              >
                {step.label}
              </Text>
            </View>
            {step.description && (
              <Text
                variant="bodyMedium"
                style={[
                  styles.stepDescription,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                {step.description}
              </Text>
            )}
            {!isLast && (
              <View
                style={[
                  styles.verticalConnector,
                  {
                    backgroundColor:
                      status === 'completed' ? theme.colors.primary : theme.colors.outline,
                  },
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );

  return orientation === 'horizontal' ? renderHorizontalStepper() : renderVerticalStepper();
};

// Step Content Component
const StepContent: React.FC<StepContentProps> = ({ children, style }) => (
  <Surface style={[styles.contentContainer, style]} elevation={1}>
    {children}
  </Surface>
);

// Navigation Buttons Component
const StepperNavigation: React.FC<StepperNavigationProps> = ({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onFinish,
  nextLabel = 'Next',
  previousLabel = 'Previous',
  finishLabel = 'Finish',
  style,
}) => {
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  return (
    <View style={[styles.navigationContainer, style]}>
      <Button
        mode="outlined"
        onPress={onPrevious}
        disabled={isFirst}
        style={styles.navButton}
      >
        {previousLabel}
      </Button>
      <Button
        mode="contained"
        onPress={isLast ? onFinish : onNext}
        style={styles.navButton}
      >
        {isLast ? finishLabel : nextLabel}
      </Button>
    </View>
  );
};

// Example Usage Component
const StepperExample: React.FC = () => {
  const [currentStep, setCurrentStep] = React.useState<number>(0);

  const steps: Step[] = [
    {
      label: 'Personal Info',
      description: 'Enter your personal details',
    },
    {
      label: 'Address',
      description: 'Provide your address information',
    },
    {
      label: 'Payment',
      description: 'Add payment method',
    },
    {
      label: 'Review',
      description: 'Review and confirm your order',
    },
  ];

  const handleNext = (): void => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = (): void => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = (): void => {
    alert('Stepper completed!');
  };

  const renderStepContent = (): JSX.Element | null => {
    switch (currentStep) {
      case 0:
        return (
          <StepContent>
            <Text variant="headlineSmall">Personal Information</Text>
            <Text variant="bodyMedium" style={styles.contentText}>
              This is where you would add form fields for personal information like name, email, phone number, etc.
            </Text>
          </StepContent>
        );
      case 1:
        return (
          <StepContent>
            <Text variant="headlineSmall">Address Information</Text>
            <Text variant="bodyMedium" style={styles.contentText}>
              Add form fields for address, city, state, zip code, etc.
            </Text>
          </StepContent>
        );
      case 2:
        return (
          <StepContent>
            <Text variant="headlineSmall">Payment Method</Text>
            <Text variant="bodyMedium" style={styles.contentText}>
              Credit card form, PayPal integration, or other payment options.
            </Text>
          </StepContent>
        );
      case 3:
        return (
          <StepContent>
            <Text variant="headlineSmall">Review & Confirm</Text>
            <Text variant="bodyMedium" style={styles.contentText}>
              Show a summary of all entered information for review.
            </Text>
          </StepContent>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Stepper Component Examples
      </Text>

      {/* Horizontal Stepper */}
      <Text variant="titleLarge" style={styles.sectionTitle}>
        Horizontal Stepper
      </Text>
      <Stepper
        steps={steps}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        orientation="horizontal"
      />

      {renderStepContent()}

      <StepperNavigation
        currentStep={currentStep}
        totalSteps={steps.length}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onFinish={handleFinish}
      />

      <Divider style={styles.divider} />

      {/* Vertical Stepper */}
      <Text variant="titleLarge" style={styles.sectionTitle}>
        Vertical Stepper
      </Text>
      <Stepper
        steps={steps}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        orientation="vertical"
        allowStepClick={false}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
  } as TextStyle,
  sectionTitle: {
    marginBottom: 16,
    marginTop: 8,
  } as TextStyle,
  divider: {
    marginVertical: 32,
  },

  // Horizontal Stepper Styles
  horizontalContainer: {
    marginBottom: 16,
  },
  progressBarContainer: {
    position: 'relative',
    height: 2,
    marginBottom: 20,
    marginHorizontal: 40,
  },
  progressBar: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 1,
  },
  progressBarFill: {
    position: 'absolute',
    height: '100%',
    borderRadius: 1,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 80,
  } as TextStyle,

  // Vertical Stepper Styles
  verticalContainer: {
    marginBottom: 16,
  },
  verticalStepContainer: {
    position: 'relative',
    paddingBottom: 24,
  },
  verticalStepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  verticalStepLabel: {
    marginLeft: 16,
    flex: 1,
  } as TextStyle,
  stepDescription: {
    marginLeft: 64,
    marginBottom: 8,
  } as TextStyle,
  verticalConnector: {
    position: 'absolute',
    left: 23,
    top: 48,
    width: 2,
    height: 24,
  },

  // Content Styles
  contentContainer: {
    padding: 20,
    marginVertical: 16,
    borderRadius: 8,
  },
  contentText: {
    marginTop: 8,
    lineHeight: 20,
  } as TextStyle,

  // Navigation Styles
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 24,
  },
  navButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export { StepContent, Stepper, StepperNavigation };
export type { Step, StepContentProps, StepperNavigationProps, StepperProps };
export default StepperExample;