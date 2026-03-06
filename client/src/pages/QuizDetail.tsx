import { useParams, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, CheckCircle2, Send } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";

export default function QuizDetail() {
  const { questionId } = useParams<{ questionId: string }>();
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [userAnswer, setUserAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const questionIdNum = parseInt(questionId || "0", 10);

  const { data: question } = trpc.quiz.getById.useQuery(questionIdNum);
  const { data: allQuestions = [] } = trpc.quiz.getAll.useQuery();
  const { data: existingAnswer } = trpc.quiz.getUserAnswers.useQuery();
  const submitAnswerMutation = trpc.quiz.submitAnswer.useMutation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (existingAnswer) {
      const answer = existingAnswer.find(a => a.questionId === questionIdNum);
      if (answer) {
        setUserAnswer(answer.userAnswer);
        setSubmitted(true);
        setIsCorrect(answer.isCorrect || false);
      }
    }
  }, [existingAnswer, questionIdNum]);

  const handleSubmit = async () => {
    if (!userAnswer.trim()) return;

    const result = await submitAnswerMutation.mutateAsync({
      questionId: questionIdNum,
      userAnswer,
    });

    setSubmitted(true);
    setIsCorrect(result.isCorrect || false);
  };

  const currentIndex = allQuestions.findIndex(q => q.id === questionIdNum);
  const previousQuestion = currentIndex > 0 ? allQuestions[currentIndex - 1] : null;
  const nextQuestion = currentIndex < allQuestions.length - 1 ? allQuestions[currentIndex + 1] : null;

  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => navigate("/quiz")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400">Questão não encontrada</p>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button variant="ghost" onClick={() => navigate("/quiz")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="secondary">Questão {question.questionNumber}</Badge>
                <Badge className={getDifficultyColor(question.difficulty || 'medium')}>
                  {question.difficulty === "easy"
                    ? "Fácil"
                    : question.difficulty === "medium"
                    ? "Médio"
                    : "Difícil"}
                </Badge>
                {submitted && (
                  <Badge className={isCorrect ? "bg-green-600" : "bg-red-600"}>
                    {isCorrect ? "Correto" : "Incorreto"}
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {question.title}
              </h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Questão {currentIndex + 1} de {allQuestions.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Question Description */}
          <Card className="p-8 border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Descrição da Questão
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              <Streamdown>{question.description}</Streamdown>
            </div>
          </Card>

          {/* Answer Section */}
          <Card className="p-8 border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Sua Resposta
            </h2>
            <div className="space-y-4">
              <Textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Digite sua resposta ou solução aqui..."
                disabled={submitted}
                className="min-h-40 resize-none"
              />
              {!submitted && (
                <Button
                  onClick={handleSubmit}
                  disabled={!userAnswer.trim() || submitAnswerMutation.isPending}
                  className="gap-2"
                >
                  <Send className="w-4 h-4" />
                  {submitAnswerMutation.isPending ? "Enviando..." : "Enviar Resposta"}
                </Button>
              )}
            </div>
          </Card>

          {/* Feedback */}
          {submitted && (
            <Card className={`p-8 border-2 ${isCorrect ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-red-500 bg-red-50 dark:bg-red-950"}`}>
              <div className="flex items-start gap-4">
                <CheckCircle2 className={`w-6 h-6 flex-shrink-0 ${isCorrect ? "text-green-600" : "text-red-600"}`} />
                <div>
                  <h3 className={`text-lg font-semibold ${isCorrect ? "text-green-900 dark:text-green-200" : "text-red-900 dark:text-red-200"}`}>
                    {isCorrect ? "Resposta Correta!" : "Resposta Incorreta"}
                  </h3>
                  <p className={`mt-2 ${isCorrect ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"}`}>
                    {isCorrect
                      ? "Parabéns! Sua resposta está correta."
                      : "Sua resposta não está completamente correta. Revise o conteúdo e tente novamente."}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Expected Answer */}
          {submitted && (
            <Card className="p-8 border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                Resposta Esperada
              </h2>
              <div className="prose dark:prose-invert max-w-none">
                <Streamdown>{question.expectedAnswer}</Streamdown>
              </div>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between gap-4 pt-8 border-t border-slate-200 dark:border-slate-800">
            {previousQuestion ? (
              <Button
                variant="outline"
                onClick={() => navigate(`/quiz/${previousQuestion.id}`)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Questão Anterior
              </Button>
            ) : (
              <div />
            )}
            {nextQuestion ? (
              <Button
                onClick={() => navigate(`/quiz/${nextQuestion.id}`)}
                className="gap-2"
              >
                Próxima Questão
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={() => navigate("/quiz")}
                className="gap-2"
              >
                Voltar ao Simulado
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
