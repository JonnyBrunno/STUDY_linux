import { useParams, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookMarked, Save, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";

export default function TopicDetail() {
  const { topicId } = useParams<{ topicId: string }>();
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [showNotes, setShowNotes] = useState(false);
  const [notesContent, setNotesContent] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);

  const topicIdNum = parseInt(topicId || "0", 10);

  const { data: topic } = trpc.topics.getById.useQuery(topicIdNum);
  const { data: userProgress } = trpc.progress.getByTopic.useQuery(topicIdNum);
  const { data: userNotes } = trpc.notes.getByTopic.useQuery(topicIdNum);

  const updateProgressMutation = trpc.progress.update.useMutation();
  const upsertNotesMutation = trpc.notes.upsert.useMutation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (userProgress) {
      setIsCompleted(userProgress.status === "completed");
    }
    if (userNotes) {
      setNotesContent(userNotes.content);
    }
  }, [userProgress, userNotes]);

  const handleMarkComplete = async () => {
    await updateProgressMutation.mutateAsync({
      topicId: topicIdNum,
      status: isCompleted ? "in_progress" : "completed",
    });
    setIsCompleted(!isCompleted);
  };

  const handleSaveNotes = async () => {
    await upsertNotesMutation.mutateAsync({
      topicId: topicIdNum,
      content: notesContent,
    });
    setShowNotes(false);
  };

  if (!topic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400">Tópico não encontrado</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="secondary">{topic.subsectionId}</Badge>
                {isCompleted && (
                  <Badge className="bg-green-600">Concluído</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                {topic.title}
              </h1>
            </div>
            <div className="flex gap-2">
              <Button
                variant={isCompleted ? "default" : "outline"}
                onClick={handleMarkComplete}
                className="gap-2"
              >
                <BookMarked className="w-4 h-4" />
                {isCompleted ? "Marcar como não concluído" : "Marcar como concluído"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowNotes(!showNotes)}
                className="gap-2"
              >
                {showNotes ? <X className="w-4 h-4" /> : <BookMarked className="w-4 h-4" />}
                {showNotes ? "Fechar" : "Anotações"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="p-8 border-slate-200 dark:border-slate-800">
              <div className="prose dark:prose-invert max-w-none">
                <Streamdown>{topic.content}</Streamdown>
              </div>
            </Card>
          </div>

          {/* Sidebar - Notes */}
          {showNotes && (
            <div className="lg:col-span-1">
              <Card className="p-6 border-slate-200 dark:border-slate-800 sticky top-24">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Minhas Anotações
                </h3>
                <Textarea
                  value={notesContent}
                  onChange={(e) => setNotesContent(e.target.value)}
                  placeholder="Adicione suas anotações pessoais aqui..."
                  className="min-h-64 mb-4 resize-none"
                />
                <Button
                  onClick={handleSaveNotes}
                  disabled={upsertNotesMutation.isPending}
                  className="w-full gap-2"
                >
                  <Save className="w-4 h-4" />
                  {upsertNotesMutation.isPending ? "Salvando..." : "Salvar Anotações"}
                </Button>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
