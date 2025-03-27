import { pgTable, text, serial, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Quiz questions and options
export const quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  options: jsonb("options").notNull(),
});

export const quizOptions = z.object({
  text: z.string(),
  color: z.enum(["fiery-red", "sunshine-yellow", "earth-green", "cool-blue"]),
});

export const insertQuizQuestionSchema = createInsertSchema(quizQuestions).extend({
  options: z.array(quizOptions),
});

export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;
export type QuizQuestion = typeof quizQuestions.$inferSelect & {
  options: z.infer<typeof quizOptions>[];
};

// Quiz results
export const quizResults = pgTable("quiz_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  fieryRedScore: integer("fiery_red_score").notNull(),
  sunshineYellowScore: integer("sunshine_yellow_score").notNull(),
  earthGreenScore: integer("earth_green_score").notNull(),
  coolBlueScore: integer("cool_blue_score").notNull(),
  dominantColor: text("dominant_color").notNull(),
  secondaryColor: text("secondary_color").notNull(),
  personalityType: text("personality_type").notNull(),
  createdAt: text("created_at").notNull(),
});

export const insertQuizResultSchema = createInsertSchema(quizResults).omit({
  id: true,
});

export type InsertQuizResult = z.infer<typeof insertQuizResultSchema>;
export type QuizResult = typeof quizResults.$inferSelect;

// Quiz answers
export const quizAnswers = pgTable("quiz_answers", {
  id: serial("id").primaryKey(),
  resultId: integer("result_id").references(() => quizResults.id),
  questionId: integer("question_id").references(() => quizQuestions.id),
  selectedColor: text("selected_color").notNull(),
});

export const insertQuizAnswerSchema = createInsertSchema(quizAnswers).omit({
  id: true,
});

export type InsertQuizAnswer = z.infer<typeof insertQuizAnswerSchema>;
export type QuizAnswer = typeof quizAnswers.$inferSelect;
