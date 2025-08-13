import { SmartOnboarding } from '@/components/onboarding/SmartOnboarding';
import { useNavigate } from 'react-router-dom';

export default function Onboarding() {
  const navigate = useNavigate();

  const handleOnboardingComplete = () => {
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <SmartOnboarding onComplete={handleOnboardingComplete} />
    </div>
  );
}