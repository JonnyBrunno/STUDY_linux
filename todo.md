# RHCSA Study Platform - TODO

## Phase 1: Database & Backend Setup
- [x] Parse guia de estudo e estruturar dados (tópicos, seções, conteúdo)
- [x] Criar schema do banco de dados (topics, quiz_questions, user_progress, user_notes)
- [x] Implementar migrations e seed de dados

## Phase 2: Backend Implementation
- [x] Criar tRPC routers para topics (list, getById, search)
- [x] Implementar busca full-text (search procedure)
- [x] Criar routers para quiz (getQuestions, submitAnswer, getResults)
- [x] Implementar routers para progresso (updateProgress, getProgress)
- [x] Criar routers para anotações (createNote, updateNote, deleteNote, getNotes)
- [x] Escrever testes vitest para procedures críticas

## Phase 3: Frontend Layout & Navigation
- [x] Criar DashboardLayout elegante com sidebar
- [x] Implementar navegação hierárquica em árvore (collapsible sections)
- [x] Desenvolver página de tópico com renderização de conteúdo
- [x] Criar página do simulado com listagem de questões
- [x] Implementar dashboard com estatísticas

## Phase 4: Interactive Features
- [x] Implementar busca full-text com debounce
- [x] Criar renderizador de markdown com syntax highlighting
- [x] Desenvolver interface do simulado (questões, respostas, validação)
- [x] Implementar sistema de rastreamento de progresso
- [x] Criar área de anotações por tópico

## Phase 5: Styling & UX
- [x] Implementar tema escuro/claro com toggle
- [x] Otimizar responsividade para mobile/tablet
- [x] Refinar tipografia e espaçamento para leitura prolongada
- [x] Adicionar animações suaves e micro-interações
- [x] Validar contraste e acessibilidade

## Phase 6: Testing & Delivery
- [x] Testar navegação e busca
- [x] Validar simulado e cálculo de progresso
- [x] Testar responsividade em diferentes dispositivos
- [x] Criar checkpoint final
- [x] Entregar ao usuário
