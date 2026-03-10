import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Heart, BookOpen, Target, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SetupStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  badgeColor: string;
  completed: boolean;
  link?: string;
}

const Setup = () => {
  const navigate = useNavigate();
  const [steps, setSteps] = useState<SetupStep[]>([
    {
      id: 1,
      title: "Define Your Core Values",
      description: "These guide your decisions in Daily & Weekly Journals",
      icon: <Heart className="w-6 h-6" />,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      badgeColor: "bg-blue-100 text-blue-700",
      completed: false,
      link: "/vision-values",
    },
    {
      id: 2,
      title: "Write Your Vision Statement",
      description: "Define where you want to be",
      icon: <BookOpen className="w-6 h-6" />,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      badgeColor: "bg-purple-100 text-purple-700",
      completed: false,
      link: "/vision-values",
    },
    {
      id: 3,
      title: "Write Your Life Mission",
      description: "Define your purpose and direction",
      icon: <Target className="w-6 h-6" />,
      color: "bg-pink-500",
      bgColor: "bg-pink-50",
      badgeColor: "bg-pink-100 text-pink-700",
      completed: false,
      link: "/vision-values",
    },
    {
      id: 4,
      title: "Start Daily Journaling",
      description: "Track your progress and stay aligned",
      icon: <BookOpen className="w-6 h-6" />,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      badgeColor: "bg-green-100 text-green-700",
      completed: true,
      link: "/daily-journal",
    },
    {
      id: 5,
      title: "Set Your Goals",
      description: "Define what you want to achieve",
      icon: <Target className="w-6 h-6" />,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      badgeColor: "bg-green-100 text-green-700",
      completed: true,
      link: "/goals-habits",
    },
  ]);

  const completedSteps = steps.filter((step) => step.completed).length;
  const totalSteps = steps.length;
  const progressPercent = (completedSteps / totalSteps) * 100;

  // Save completed count to localStorage
  useEffect(() => {
    localStorage.setItem("setupCompletedCount", completedSteps.toString());
    localStorage.setItem("setupTotalCount", totalSteps.toString());
  }, [completedSteps, totalSteps]);

  const handleGetStarted = (step: SetupStep) => {
    if (step.link) {
      navigate(step.link);
    }
  };

  const handleDone = (stepId: number) => {
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId ? { ...step, completed: true } : step
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>

          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-1">
                Complete Your Setup
              </h1>
              <p className="text-slate-600 text-sm">
                Get the most out of Life Compass
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-xs font-bold text-blue-700">
                {completedSteps}/{totalSteps} Complete
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-2 mt-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`rounded-2xl p-8 border-2 transition-all ${
                step.completed
                  ? "bg-green-50 border-green-200 shadow-sm"
                  : `${step.bgColor} border-slate-200 shadow-md hover:shadow-lg`
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-6 flex-1">
                  {/* Step Number / Icon */}
                  <div
                    className={`flex-shrink-0 ${step.color} rounded-full w-20 h-20 flex items-center justify-center text-white shadow-md`}
                  >
                    {step.completed ? (
                      <CheckCircle2 className="w-10 h-10" />
                    ) : (
                      <span className="text-3xl font-bold">{step.id}</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 mt-1">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      {step.title}
                      {step.completed && (
                        <span className="ml-2 text-lg text-green-600">✓</span>
                      )}
                    </h3>
                    <p className="text-base text-slate-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex-shrink-0 ml-6">
                  {step.completed ? (
                    <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold border border-green-300">
                      Done
                    </span>
                  ) : (
                    <Button
                      onClick={() => handleGetStarted(step)}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90 gap-2 text-base font-semibold shadow-md px-6 py-3"
                      size="lg"
                    >
                      <span className="text-lg">✨</span>
                      Get Started
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Message */}
        <div className="mt-10 text-center">
          <p className="text-base text-slate-600 font-medium">
            Complete all steps to unlock the full potential of Life Compass
          </p>
        </div>
      </div>
    </div>
  );
};

export default Setup;
