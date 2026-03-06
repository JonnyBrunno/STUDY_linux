import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Brain, Zap, Target } from "lucide-react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      window.location.href = getLoginUrl();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900 dark:text-white">RHCSA Study</span>
          </div>
          <Button onClick={handleGetStarted} variant="default" size="sm">
            {isAuthenticated ? "Dashboard" : "Começar Agora"}
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
                Domine o Exame <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700">RHCSA EX200</span>
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
                Plataforma de estudo elegante e interativa com navegação por tópicos, simulado prático e rastreamento de progresso em tempo real.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button onClick={handleGetStarted} size="lg" className="bg-blue-600 hover:bg-blue-700">
                Começar Estudo
              </Button>
              <Button variant="outline" size="lg">
                Ver Tópicos
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-3xl font-bold text-blue-600">63</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Tópicos</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">26</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Questões</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">10</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Seções</div>
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-blue-700/20 rounded-2xl blur-3xl"></div>
              <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-slate-700">
                <div className="space-y-4">
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                  <div className="pt-4 space-y-2">
                    <div className="h-2 bg-blue-200 dark:bg-blue-900 rounded w-1/3"></div>
                    <div className="h-2 bg-blue-200 dark:bg-blue-900 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-900 dark:bg-slate-950 py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Recursos Poderosos</h2>
            <p className="text-xl text-slate-400">Tudo que você precisa para dominar o RHCSA</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-slate-800 border-slate-700 p-6 hover:border-blue-600 transition-colors">
              <Brain className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Aprendizado Estruturado</h3>
              <p className="text-slate-400">Navegação hierárquica por 10 seções principais com 63 tópicos detalhados</p>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-6 hover:border-blue-600 transition-colors">
              <Zap className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Busca Inteligente</h3>
              <p className="text-slate-400">Encontre comandos, conceitos e exemplos em segundos</p>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-6 hover:border-blue-600 transition-colors">
              <Target className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Simulado Prático</h3>
              <p className="text-slate-400">26 questões práticas do exame com validação de respostas</p>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-6 hover:border-blue-600 transition-colors">
              <BookOpen className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Anotações Pessoais</h3>
              <p className="text-slate-400">Adicione observações em cada tópico durante o estudo</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Pronto para Começar?</h2>
          <p className="text-xl mb-8 text-blue-100">Inicie seu caminho para a certificação RHCSA hoje mesmo</p>
          <Button onClick={handleGetStarted} size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-slate-100">
            Acessar Plataforma
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-600 dark:text-slate-400">
          <p>© 2026 RHCSA Study Platform. Desenvolvido para o exame Red Hat Certified System Administrator EX200.</p>
        </div>
      </footer>
    </div>
  );
}
