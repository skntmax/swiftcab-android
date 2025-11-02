import { Step, Stepper } from '@/components/ui/Stepper/Stepper';
import React, { useState } from 'react';
import LocationStep from './steps/LocationStep';
import MobileVerificationScreen from './steps/Step1';

function Singup() {
   const [currentStep, setCurrentStep] = useState<number>(0);
   const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  
  const steps: Step[] = [
    { label: 'Location', description: 'Allow location access', icon: 'map-marker', activeIcon: 'map-marker-radius', completedIcon: 'check-circle' },
    { label: 'Verify', description: 'Phone and OTP', icon: 'shield-key', activeIcon: 'shield-check', completedIcon: 'check-circle' },
    { label: 'Profile', description: 'Details', icon: 'account', activeIcon: 'account-check', completedIcon: 'check-circle' },
    { label: 'Finish', description: 'Complete', icon: 'flag-checkered', activeIcon: 'flag', completedIcon: 'check-circle' },
  ];

  const handleStepChange = (stepIndex: number): void => {
    setCurrentStep(stepIndex);
  };
  return (
    <>
    <Stepper
      steps={steps}
      currentStep={currentStep}
      onStepChange={handleStepChange}
      orientation="horizontal"
      />

 

   {currentStep === 0 && (
     <LocationStep onGranted={(c) => { setCoords(c); setCurrentStep(1); }} />
   )}
   {currentStep === 1 && <MobileVerificationScreen />}
   {currentStep === 2 && (
     <div style={{ padding: 16 }}>Profile details coming soon…</div>
   )}
      </>
  )
}


export default Singup