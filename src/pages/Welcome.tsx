import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import satoshiMascot from "@/assets/satoshi-mascot.png";
import heroFinance from "@/assets/hero-finance.jpg";

export default function Welcome() {
  const [step, setStep] = useState(0);
  const [userInfo, setUserInfo] = useState({
    nickname: "",
    email: "",
    financialGoal: ""
  });
  const navigate = useNavigate();

  const steps = [
    {
      title: "Bem-vindo ao Satoshi! 🎉",
      description: "Aprenda finanças de forma divertida e gamificada",
      content: (
        <div className="text-center">
          <img src={heroFinance} alt="Hero" className="w-full h-48 object-cover rounded-lg mb-6" />
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Transforme sua educação financeira em uma jornada épica!
            </p>
            <ul className="text-left space-y-2 text-muted-foreground">
              <li>🎯 Aprenda com lições interativas</li>
              <li>🏆 Ganhe XP e suba de nível</li>
              <li>🔥 Mantenha sua sequência diária</li>
              <li>👥 Compete com outros usuários</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Conte-nos sobre você",
      description: "Vamos personalizar sua experiência",
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Como devemos te chamar?</label>
            <Input
              placeholder="Seu apelido"
              value={userInfo.nickname}
              onChange={(e) => setUserInfo({...userInfo, nickname: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={userInfo.email}
              onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
            />
          </div>
        </div>
      )
    },
    {
      title: "Qual é seu objetivo?",
      description: "Escolha seu foco principal",
      content: (
        <div className="space-y-3">
          {[
            "💰 Organizar meu orçamento",
            "🏦 Criar uma reserva de emergência", 
            "📈 Começar a investir",
            "🎯 Planejamento de longo prazo",
            "📚 Aprender sobre finanças"
          ].map((goal) => (
            <Button
              key={goal}
              variant={userInfo.financialGoal === goal ? "default" : "outline"}
              className="w-full text-left justify-start"
              onClick={() => setUserInfo({...userInfo, financialGoal: goal})}
            >
              {goal}
            </Button>
          ))}
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      // Salvar dados do usuário no localStorage
      localStorage.setItem('satoshi_user', JSON.stringify({
        ...userInfo,
        level: 1,
        xp: 0,
        streak: 0,
        completedLessons: 0,
        achievements: [],
        coins: 100
      }));
      navigate('/dashboard');
    }
  };

  const canProceed = () => {
    if (step === 1) return userInfo.nickname && userInfo.email;
    if (step === 2) return userInfo.financialGoal;
    return true;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <img src={satoshiMascot} alt="Satoshi" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {steps[step].title}
          </h1>
          <p className="text-muted-foreground">
            {steps[step].description}
          </p>
        </div>

        <div className="mb-8">
          {steps[step].content}
        </div>

        <div className="space-y-4">
          <Button 
            onClick={handleNext}
            disabled={!canProceed()}
            className="w-full"
          >
            {step === steps.length - 1 ? "Começar Jornada!" : "Continuar"}
          </Button>
          
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="w-full">
              Voltar
            </Button>
          )}
        </div>

        <div className="flex justify-center mt-6 space-x-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}