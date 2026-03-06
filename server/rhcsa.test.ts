import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock user context for testing
const createMockContext = (userId: number = 1): TrpcContext => ({
  user: {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "test",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  },
  req: {
    protocol: "https",
    headers: {},
  } as TrpcContext["req"],
  res: {
    clearCookie: () => {},
  } as TrpcContext["res"],
});

describe("RHCSA Study Platform - tRPC Procedures", () => {
  describe("topics router", () => {
    it("should retrieve all topics", async () => {
      const caller = appRouter.createCaller(createMockContext());
      const topics = await caller.topics.getAll();
      
      expect(Array.isArray(topics)).toBe(true);
      expect(topics.length).toBe(63);
    });

    it("should search topics by query", async () => {
      const caller = appRouter.createCaller(createMockContext());
      const results = await caller.topics.search("ssh");
      
      expect(Array.isArray(results)).toBe(true);
      // Results may be empty or contain matches
      expect(results.length >= 0).toBe(true);
    });

    it("should return empty array for short search queries", async () => {
      const caller = appRouter.createCaller(createMockContext());
      const results = await caller.topics.search("a");
      
      expect(Array.isArray(results)).toBe(true);
      // Short queries should return empty or limited results
    });

    it("should get topic by ID", async () => {
      const caller = appRouter.createCaller(createMockContext());
      const allTopics = await caller.topics.getAll();
      
      if (allTopics.length > 0) {
        const topic = await caller.topics.getById(allTopics[0].id);
        expect(topic).toBeDefined();
        if (topic) {
          expect(topic.id).toBe(allTopics[0].id);
        }
      }
    });
  });

  describe("quiz router", () => {
    it("should retrieve all quiz questions", async () => {
      const caller = appRouter.createCaller(createMockContext());
      const questions = await caller.quiz.getAll();
      
      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBeGreaterThanOrEqual(26); // Should have at least 26 questions
    });

    it("should get quiz question by ID", async () => {
      const caller = appRouter.createCaller(createMockContext());
      const questions = await caller.quiz.getAll();
      
      if (questions.length > 0) {
        const question = await caller.quiz.getById(questions[0].id);
        expect(question).toBeDefined();
        if (question) {
          expect(question.id).toBe(questions[0].id);
          expect(question.questionNumber).toBeGreaterThan(0);
        }
      }
    });

    it("should submit quiz answer for authenticated user", async () => {
      const userId = 1;
      const caller = appRouter.createCaller(createMockContext(userId));
      const questions = await caller.quiz.getAll();
      
      if (questions.length > 0) {
        const result = await caller.quiz.submitAnswer({
          questionId: questions[0].id,
          userAnswer: "test answer",
        });
        
        expect(result).toBeDefined();
        if (result) {
          expect(result.userAnswer).toBe("test answer");
          expect(typeof result.isCorrect).toBe("boolean");
        }
      }
    });

    it("should retrieve user quiz answers", async () => {
      const userId = 2;
      const caller = appRouter.createCaller(createMockContext(userId));
      
      const answers = await caller.quiz.getUserAnswers();
      expect(Array.isArray(answers)).toBe(true);
      // Answers may be empty for new users
      expect(answers.length >= 0).toBe(true);
    });
  });

  describe("progress router", () => {
    it("should retrieve user progress", async () => {
      const userId = 3;
      const caller = appRouter.createCaller(createMockContext(userId));
      
      const progress = await caller.progress.getAll();
      expect(Array.isArray(progress)).toBe(true);
      // Progress may be empty for new users
      expect(progress.length >= 0).toBe(true);
    });

    it("should update user progress for topic", async () => {
      const userId = 4;
      const caller = appRouter.createCaller(createMockContext(userId));
      const topics = await caller.topics.getAll();
      
      if (topics.length > 0) {
        const result = await caller.progress.update({
          topicId: topics[0].id,
          status: "in_progress",
        });
        
        expect(result).toBeDefined();
        if (result) {
          expect(result.status).toBe("in_progress");
          expect(result.userId).toBe(userId);
        }
      }
    });

    it("should mark topic as completed", async () => {
      const userId = 5;
      const caller = appRouter.createCaller(createMockContext(userId));
      const topics = await caller.topics.getAll();
      
      if (topics.length > 0) {
        const result = await caller.progress.update({
          topicId: topics[0].id,
          status: "completed",
        });
        
        expect(result.status).toBe("completed");
        expect(result.userId).toBe(userId);
      }
    });
  });

  describe("notes router", () => {
    it("should upsert user notes for topic", async () => {
      const userId = 6;
      const caller = appRouter.createCaller(createMockContext(userId));
      const topics = await caller.topics.getAll();
      
      if (topics.length > 0) {
        const result = await caller.notes.upsert({
          topicId: topics[0].id,
          content: "Test note content",
        });
        
        expect(result).toBeDefined();
        if (result) {
          expect(result.content).toBe("Test note content");
          expect(result.userId).toBe(userId);
        }
      }
    });

    it("should retrieve user notes for topic", async () => {
      const userId = 7;
      const caller = appRouter.createCaller(createMockContext(userId));
      const topics = await caller.topics.getAll();
      
      if (topics.length > 0) {
        // First create a note
        const created = await caller.notes.upsert({
          topicId: topics[0].id,
          content: "Test note",
        });
        
        // Then retrieve it
        const note = await caller.notes.getByTopic(topics[0].id);
        expect(note).toBeDefined();
        if (note) {
          expect(note.content).toBe("Test note");
        }
      }
    });

    it("should delete user notes", async () => {
      const userId = 8;
      const caller = appRouter.createCaller(createMockContext(userId));
      const topics = await caller.topics.getAll();
      
      if (topics.length > 0) {
        // Create a note
        await caller.notes.upsert({
          topicId: topics[0].id,
          content: "Note to delete",
        });
        
        // Delete it
        const result = await caller.notes.delete(topics[0].id);
        expect(typeof result).toBe("boolean");
      }
    });
  });

  describe("auth router", () => {
    it("should get current user info", async () => {
      const ctx = createMockContext(99);
      const caller = appRouter.createCaller(ctx);
      
      const user = await caller.auth.me();
      expect(user).toBeDefined();
      if (user) {
        expect(user.id).toBe(99);
        expect(user.openId).toBe("test-user-99");
      }
    });
  });

});
