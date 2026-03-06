import { eq, and, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, topics, quizQuestions, userProgress, userNotes, quizAnswers, Topic, QuizQuestion, UserProgress, UserNote, QuizAnswer, InsertUserProgress, InsertUserNote, InsertQuizAnswer } from "../drizzle/schema";
import { ENV } from './_core/env';


let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// RHCSA Study Platform Queries

export async function getAllTopics(): Promise<Topic[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(topics).orderBy(topics.subsectionId);
}

export async function getTopicById(id: number): Promise<Topic | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(topics).where(eq(topics.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTopicsBySection(sectionId: string): Promise<Topic[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(topics).where(eq(topics.sectionId, sectionId)).orderBy(topics.subsectionId);
}

export async function searchTopics(query: string): Promise<Topic[]> {
  const db = await getDb();
  if (!db) return [];
  
  const searchPattern = `%${query}%`;
  return await db.select().from(topics).where(
    like(topics.searchableText, searchPattern)
  ).limit(50);
}

export async function getAllQuizQuestions(): Promise<QuizQuestion[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(quizQuestions).orderBy(quizQuestions.questionNumber);
}

export async function getQuizQuestionById(id: number): Promise<QuizQuestion | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(quizQuestions).where(eq(quizQuestions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserProgress(userId: number): Promise<UserProgress[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(userProgress).where(eq(userProgress.userId, userId));
}

export async function getUserProgressByTopic(userId: number, topicId: number): Promise<UserProgress | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(userProgress).where(
    and(eq(userProgress.userId, userId), eq(userProgress.topicId, topicId))
  ).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertUserProgress(data: InsertUserProgress): Promise<UserProgress> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getUserProgressByTopic(data.userId, data.topicId);
  
  if (existing) {
    await db.update(userProgress).set({
      status: data.status,
      completedAt: data.status === 'completed' ? new Date() : existing.completedAt,
      updatedAt: new Date(),
    }).where(eq(userProgress.id, existing.id));
    
    const updated = await db.select().from(userProgress).where(eq(userProgress.id, existing.id)).limit(1);
    return updated[0]!;
  } else {
    await db.insert(userProgress).values(data);
    const inserted = await db.select().from(userProgress).where(
      and(eq(userProgress.userId, data.userId), eq(userProgress.topicId, data.topicId))
    ).limit(1);
    return inserted[0]!;
  }
}

export async function getUserNotes(userId: number, topicId: number): Promise<UserNote | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(userNotes).where(
    and(eq(userNotes.userId, userId), eq(userNotes.topicId, topicId))
  ).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertUserNote(data: InsertUserNote): Promise<UserNote> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getUserNotes(data.userId, data.topicId);
  
  if (existing) {
    await db.update(userNotes).set({
      content: data.content,
      updatedAt: new Date(),
    }).where(eq(userNotes.id, existing.id));
    
    const updated = await db.select().from(userNotes).where(eq(userNotes.id, existing.id)).limit(1);
    return updated[0]!;
  } else {
    await db.insert(userNotes).values(data);
    return data as any;
  }
}

export async function deleteUserNote(userId: number, topicId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db.delete(userNotes).where(
    and(eq(userNotes.userId, userId), eq(userNotes.topicId, topicId))
  );
  return true;
}

export async function submitQuizAnswer(data: InsertQuizAnswer): Promise<QuizAnswer> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(quizAnswers).values(data);
  return data as any;
}

export async function getUserQuizAnswers(userId: number): Promise<QuizAnswer[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(quizAnswers).where(eq(quizAnswers.userId, userId));
}
