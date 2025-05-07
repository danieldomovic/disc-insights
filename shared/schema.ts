import { pgTable, text, serial, integer, jsonb, timestamp, boolean, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations will be defined after all tables are declared

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  username: true,
  password: true,
  fullName: true,
}).extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
  email: z.string().email("Please enter a valid email address"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Teams
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdById: integer("created_by_id").references(() => users.id).notNull(),
  organizationId: integer("organization_id").references(() => organizations.id),
  inviteCode: text("invite_code").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations will be defined after all tables are declared

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
  inviteCode: true,
});

export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teams.$inferSelect;

// Team Members
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").references(() => teams.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  isLeader: boolean("is_leader").default(false).notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
}));

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  joinedAt: true,
});

export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;

// Organizations
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  domain: text("domain"),
  createdById: integer("created_by_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations will be defined after all tables are declared

export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
});

export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type Organization = typeof organizations.$inferSelect;

// Organization Members
export const organizationMembers = pgTable("organization_members", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const organizationMembersRelations = relations(organizationMembers, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationMembers.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [organizationMembers.userId],
    references: [users.id],
  }),
}));

export const insertOrganizationMemberSchema = createInsertSchema(organizationMembers).omit({
  id: true,
  joinedAt: true,
});

export type InsertOrganizationMember = z.infer<typeof insertOrganizationMemberSchema>;
export type OrganizationMember = typeof organizationMembers.$inferSelect;

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
  teamId: integer("team_id").references(() => teams.id),
  organizationId: integer("organization_id").references(() => organizations.id),
  title: text("title"),
  fieryRedScore: integer("fiery_red_score").notNull(),
  sunshineYellowScore: integer("sunshine_yellow_score").notNull(),
  earthGreenScore: integer("earth_green_score").notNull(),
  coolBlueScore: integer("cool_blue_score").notNull(),
  dominantColor: text("dominant_color").notNull(),
  secondaryColor: text("secondary_color").notNull(),
  personalityType: text("personality_type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isPrivate: boolean("is_private").default(false),
});

// Relations will be defined after all tables are declared

export const insertQuizResultSchema = createInsertSchema(quizResults).omit({
  id: true,
  createdAt: true,
});

export type InsertQuizResult = z.infer<typeof insertQuizResultSchema>;
export type QuizResult = typeof quizResults.$inferSelect;

// Report Comparisons
export const reportComparisons = pgTable("report_comparisons", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  reportAId: integer("report_a_id").references(() => quizResults.id).notNull(),
  reportBId: integer("report_b_id").references(() => quizResults.id).notNull(),
  title: text("title"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations will be defined after all tables are declared

export const insertReportComparisonSchema = createInsertSchema(reportComparisons).omit({
  id: true,
  createdAt: true,
});

export type InsertReportComparison = z.infer<typeof insertReportComparisonSchema>;
export type ReportComparison = typeof reportComparisons.$inferSelect;

// Quiz answers
export const quizAnswers = pgTable("quiz_answers", {
  id: serial("id").primaryKey(),
  resultId: integer("result_id").references(() => quizResults.id),
  questionId: integer("question_id").references(() => quizQuestions.id),
  selectedColor: text("selected_color").notNull(),
  rating: text("rating").notNull(),
});

export const insertQuizAnswerSchema = createInsertSchema(quizAnswers).omit({
  id: true,
});

export type InsertQuizAnswer = z.infer<typeof insertQuizAnswerSchema>;
export type QuizAnswer = typeof quizAnswers.$inferSelect;

// Team Analytics
export const teamAnalytics = pgTable("team_analytics", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").references(() => teams.id).notNull(),
  fieryRedAvg: integer("fiery_red_avg").notNull(),
  sunshineYellowAvg: integer("sunshine_yellow_avg").notNull(),
  earthGreenAvg: integer("earth_green_avg").notNull(),
  coolBlueAvg: integer("cool_blue_avg").notNull(),
  dominantTeamColor: text("dominant_team_color").notNull(),
  teamPersonalityDistribution: jsonb("team_personality_distribution").notNull(),
  strengthsAnalysis: text("strengths_analysis"),
  blindspotsAnalysis: text("blindspots_analysis"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const teamAnalyticsRelations = relations(teamAnalytics, ({ one }) => ({
  team: one(teams, {
    fields: [teamAnalytics.teamId],
    references: [teams.id],
  }),
}));

export const insertTeamAnalyticsSchema = createInsertSchema(teamAnalytics).omit({
  id: true,
  updatedAt: true,
});

export type InsertTeamAnalytics = z.infer<typeof insertTeamAnalyticsSchema>;
export type TeamAnalytics = typeof teamAnalytics.$inferSelect;

// Organization Analytics
export const organizationAnalytics = pgTable("organization_analytics", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  fieryRedAvg: integer("fiery_red_avg").notNull(),
  sunshineYellowAvg: integer("sunshine_yellow_avg").notNull(),
  earthGreenAvg: integer("earth_green_avg").notNull(),
  coolBlueAvg: integer("cool_blue_avg").notNull(),
  dominantOrgColor: text("dominant_org_color").notNull(),
  orgPersonalityDistribution: jsonb("org_personality_distribution").notNull(),
  teamsSummary: jsonb("teams_summary"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const organizationAnalyticsRelations = relations(organizationAnalytics, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationAnalytics.organizationId],
    references: [organizations.id],
  }),
}));

export const insertOrgAnalyticsSchema = createInsertSchema(organizationAnalytics).omit({
  id: true,
  updatedAt: true,
});

export type InsertOrgAnalytics = z.infer<typeof insertOrgAnalyticsSchema>;
export type OrganizationAnalytics = typeof organizationAnalytics.$inferSelect;
