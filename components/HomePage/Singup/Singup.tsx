import { Step, Stepper } from '@/components/ui/Stepper/Stepper';
import React, { useState } from 'react';
import MobileVerificationScreen from './steps/Step1';

function Singup() {
   const [currentStep, setCurrentStep] = useState<number>(0);
  
  const steps: Step[] = [
    { label: 'Step 1', description: 'Optional description' },
    { label: 'Step 2' ,description: 'Optional description'  }, // description is optional
    { label: 'Step 3' ,description: 'Optional description'  }, // description is optional
    { label: 'Step 4' ,description: 'Optional description'  }, // description is optional
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

 

   {currentStep === 0 && <MobileVerificationScreen />}
   {currentStep === 1 && <div>Step 1 Content</div>}
   {currentStep === 2 && <div>Step 2 Content</div>}
      </>
  )
}


export default Singup