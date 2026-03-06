import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // RHCSA Study Platform Routers
  topics: router({
    getAll: publicProcedure.query(async () => {
      return await db.getAllTopics();
    }),

    getById: publicProcedure.input(z.number()).query(async ({ input }) => {
      return await db.getTopicById(input);
    }),

    getBySection: publicProcedure.input(z.string()).query(async ({ input }) => {
      return await db.getTopicsBySection(input);
    }),

    search: publicProcedure.input(z.string()).query(async ({ input }) => {
      if (input.length < 2) return [];
      return await db.searchTopics(input);
    }),
  }),

  quiz: router({
    getAll: publicProcedure.query(async () => {
      return await db.getAllQuizQuestions();
    }),

    getById: publicProcedure.input(z.number()).query(async ({ input }) => {
      return await db.getQuizQuestionById(input);
    }),

    submitAnswer: protectedProcedure
      .input(z.object({
        questionId: z.number(),
        userAnswer: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const question = await db.getQuizQuestionById(input.questionId);
        if (!question) throw new Error("Question not found");

        const isCorrect = input.userAnswer.toLowerCase().includes("sim") || 
                         input.userAnswer.toLowerCase().includes("yes");

        const answer = await db.submitQuizAnswer({
          userId: ctx.user.id,
          questionId: input.questionId,
          userAnswer: input.userAnswer,
          isCorrect,
        });

        return {
          ...answer,
          expectedAnswer: question.expectedAnswer,
        };
      }),

    getUserAnswers: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserQuizAnswers(ctx.user.id);
    }),
  }),

  progress: router({
    getAll: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserProgress(ctx.user.id);
    }),

    getByTopic: protectedProcedure
      .input(z.number())
      .query(async ({ input, ctx }) => {
        return await db.getUserProgressByTopic(ctx.user.id, input);
      }),

    update: protectedProcedure
      .input(z.object({
        topicId: z.number(),
        status: z.enum(["not_started", "in_progress", "completed"]),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.upsertUserProgress({
          userId: ctx.user.id,
          topicId: input.topicId,
          status: input.status,
        });
      }),
  }),

  notes: router({
    getByTopic: protectedProcedure
      .input(z.number())
      .query(async ({ input, ctx }) => {
        return await db.getUserNotes(ctx.user.id, input);
      }),

    upsert: protectedProcedure
      .input(z.object({
        topicId: z.number(),
        content: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.upsertUserNote({
          userId: ctx.user.id,
          topicId: input.topicId,
          content: input.content,
        });
      }),

    delete: protectedProcedure
      .input(z.number())
      .mutation(async ({ input, ctx }) => {
        return await db.deleteUserNote(ctx.user.id, input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
