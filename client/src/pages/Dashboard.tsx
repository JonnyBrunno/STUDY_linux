import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, CheckCircle2, Clock, Target } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const { data: allTopics = [] } = trpc.topics.getAll.useQuery();
  const { data: userProgress = [] } = trpc.progress.getAll.useQuery();
  const { data: quizQuestions = [] } = trpc.quiz.getAll.useQuery();
  const { data: userAnswers = [] } = trpc.quiz.getUserAnswers.useQuery();

  const completedTopics = userProgress.filter(p => p.status === "completed").length;
  const inProgressTopics = userProgress.filter(p => p.status === "in_progress").length;
  const completedQuestions = userAnswers.length;
  const progressPercentage = allTopics.length > 0 ? (completedTopics / allTopics.length) * 100 : 0;

  const navigationItems = [
    {
      title: "Estudo",
      items: [
        { label: "Tópicos", href: "/topics", icon: BookOpen },
        { label: "Simulado", href: "/quiz", icon: Target },
      ],
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Bem-vindo, {user?.name || "Estudante"}!
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Seu progresso no caminho para a certificação RHCSA
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="p-6 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Tópicos Concluídos</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {completedTopics}/{allTopics.length}
                </p>
              </div>
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
          </Card>

          <Card className="p-6 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Em Progresso</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {inProgressTopics}
                </p>
              </div>
              <Clock className="w-12 h-12 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Questões Resolvidas</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {completedQuestions}/{quizQuestions.length}
                </p>
              </div>
              <Target className="w-12 h-12 text-purple-500" />
            </div>
          </Card>

          <Card className="p-6 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Progresso Geral</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {Math.round(progressPercentage)}%
                </p>
              </div>
              <BookOpen className="w-12 h-12 text-orange-500" />
            </div>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="p-6 border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Progresso Geral do Estudo
          </h2>
          <Progress value={progressPercentage} className="h-3" />
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            {completedTopics} de {allTopics.length} tópicos concluídos
          </p>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-8 border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-colors cursor-pointer"
            onClick={() => navigate("/topics")}>
            <BookOpen className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Continuar Estudando
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Explore os {allTopics.length} tópicos estruturados do RHCSA
            </p>
            <Button variant="outline">Ver Tópicos</Button>
          </Card>

          <Card className="p-8 border-slate-200 dark:border-slate-800 hover:border-purple-500 transition-colors cursor-pointer"
            onClick={() => navigate("/quiz")}>
            <Target className="w-12 h-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Praticar com Simulado
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Resolva as {quizQuestions.length} questões práticas do exame
            </p>
            <Button variant="outline">Ir para Simulado</Button>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
