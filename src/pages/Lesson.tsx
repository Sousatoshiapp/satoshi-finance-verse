import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { FloatingNavbar } from "@/components/floating-navbar";
import { lessons } from "@/data/lessons";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Lesson() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [course, setCourse] = useState(null);
  const [userProgress, setUserProgress] = useState({});

  useEffect(() => {
    const foundCourse = lessons.find(lesson => lesson.id === parseInt(courseId));
    if (!foundCourse) {
      navigate('/dashboard');
      return;
    }

    setCourse(foundCourse);
    
    if (lessonId) {
      const lessonIndex = foundCourse.lessons.findIndex(lesson => lesson.id === parseInt(lessonId));
      if (lessonIndex !== -1) {
        setCurrentLessonIndex(lessonIndex);
      }
    }

    // Load user progress
    const savedProgress = localStorage.getItem('satoshi_user');
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress));
    }
  }, [courseId, lessonId, navigate]);

  const currentLesson = course?.lessons[currentLessonIndex];
  
  const completeLesson = () => {
    const userData = JSON.parse(localStorage.getItem('satoshi_user') || '{}');
    const newXP = (userData.xp || 0) + currentLesson.xpReward;
    const newLevel = Math.floor(newXP / 100) + 1;
    
    const updatedUser = {
      ...userData,
      xp: newXP,
      level: newLevel,
      completedLessons: (userData.completedLessons || 0) + 1
    };

    localStorage.setItem('satoshi_user', JSON.stringify(updatedUser));
    setUserProgress(updatedUser);

    toast({
      title: "Lição Completa! 🎉",
      description: `Você ganhou ${currentLesson.xpReward} XP!`,
    });

    // Move to next lesson or back to course
    if (currentLessonIndex < course.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
      navigate(`/lesson/${courseId}/${course.lessons[currentLessonIndex + 1].id}`);
    } else {
      toast({
        title: "Curso Completo! 🏆",
        description: "Parabéns! Você completou todo o curso!",
      });
      navigate('/dashboard');
    }
  };

  const goToPrevious = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
      navigate(`/lesson/${courseId}/${course.lessons[currentLessonIndex - 1].id}`);
    }
  };

  const goToNext = () => {
    if (currentLessonIndex < course.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
      navigate(`/lesson/${courseId}/${course.lessons[currentLessonIndex + 1].id}`);
    }
  };

  if (!course || !currentLesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Lição não encontrada</h2>
          <Button onClick={() => navigate('/dashboard')}>Voltar ao Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 py-4 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Dashboard
              </Button>
              <div>
                <h1 className="text-lg font-bold text-foreground">{course.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {currentLessonIndex + 1} de {course.lessons.length} lições
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline">{course.difficulty}</Badge>
              <span className="text-2xl">{course.icon}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="mb-8">
          <ProgressBar
            value={currentLessonIndex + 1}
            max={course.lessons.length}
            showLabel
            className="mb-2"
          />
        </div>

        {/* Lesson Content */}
        <Card className="p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">
              {currentLesson.title}
            </h2>
          </div>
          
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <div 
              className="text-foreground leading-relaxed whitespace-pre-line"
              dangerouslySetInnerHTML={{ 
                __html: currentLesson.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              }}
            />
          </div>
          
          <div className="mt-8 p-4 bg-primary/10 rounded-lg border">
            <div className="flex items-center gap-2">
              <span className="text-primary font-semibold">🪙 Recompensa:</span>
              <span className="text-foreground">{currentLesson.xpReward} XP</span>
            </div>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={goToPrevious}
            disabled={currentLessonIndex === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={goToNext}
              disabled={currentLessonIndex === course.lessons.length - 1}
            >
              Próxima
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <Button onClick={completeLesson} className="bg-primary">
              {currentLessonIndex === course.lessons.length - 1 ? 'Finalizar Curso' : 'Completar Lição'}
              <CheckCircle className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      <FloatingNavbar />
    </div>
  );
}