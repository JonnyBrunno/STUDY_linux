import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Quiz() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  const { data: questions = [] } = trpc.quiz.getAll.useQuery();
  const { data: userAnswers = [] } = trpc.quiz.getUserAnswers.useQuery();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const answeredQuestionIds = new Set(userAnswers.map(a => a.questionId));
  const correctAnswers = userAnswers.filter(a => a.isCorrect).length;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Simulado RHCSA EX200
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Pratique com {questions.length} questões do exame
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {correctAnswers}/{userAnswers.length}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Questões Corretas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total de Questões</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {questions.length}
                </p>
              </div>
              <Clock className="w-12 h-12 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Respondidas</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {userAnswers.length}
                </p>
              </div>
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
          </Card>

          <Card className="p-6 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Taxa de Acerto</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {userAnswers.length > 0 ? Math.round((correctAnswers / userAnswers.length) * 100) : 0}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <span className="text-lg font-bold text-purple-600 dark:text-purple-200">%</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {questions.map((question) => {
            const isAnswered = answeredQuestionIds.has(question.id);
            const userAnswer = userAnswers.find(a => a.questionId === question.id);

            return (
              <Card
                key={question.id}
                className="p-6 border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-colors cursor-pointer"
                onClick={() => navigate(`/quiz/${question.id}`)}
              >
                <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg font-bold text-slate-600 dark:text-slate-400">
                    #{question.questionNumber}
                  </span>
                  <Badge className={getDifficultyColor(question.difficulty || 'medium')}>
                        {question.difficulty === "easy"
                          ? "Fácil"
                          : question.difficulty === "medium"
                          ? "Médio"
                          : "Difícil"}
                      </Badge>
                      {isAnswered && (
                        <Badge className={userAnswer?.isCorrect ? "bg-green-600" : "bg-red-600"}>
                          {userAnswer?.isCorrect ? "Correto" : "Incorreto"}
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      {question.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 line-clamp-2">
                      {question.description}
                    </p>
                  </div>
                  <div className="ml-4">
                    {isAnswered ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                    ) : (
                      <div className="w-6 h-6 border-2 border-slate-300 dark:border-slate-600 rounded-full flex-shrink-0" />
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
