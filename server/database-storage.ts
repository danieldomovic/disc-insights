import {
  users,
  teams,
  teamMembers,
  organizations,
  organizationMembers,
  quizQuestions,
  quizResults,
  quizAnswers,
  teamAnalytics,
  organizationAnalytics,
  reportComparisons,
  type User,
  type InsertUser,
  type QuizQuestion,
  type InsertQuizQuestion,
  type QuizResult,
  type InsertQuizResult,
  type QuizAnswer,
  type InsertQuizAnswer,
  type Team,
  type InsertTeam,
  type TeamMember,
  type InsertTeamMember,
  type Organization,
  type InsertOrganization,
  type OrganizationMember,
  type InsertOrganizationMember,
  type TeamAnalytics,
  type InsertTeamAnalytics,
  type OrganizationAnalytics,
  type InsertOrgAnalytics,
  type ReportComparison,
  type InsertReportComparison,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { IStorage } from "./storage";
import { Store } from "express-session";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { pool } from "./db";
import { randomBytes } from "crypto";

export class DatabaseStorage implements IStorage {
  sessionStore: Store;

  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true,
      tableName: 'sessions'
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  // Quiz question methods
  async getAllQuizQuestions(): Promise<QuizQuestion[]> {
    const questions = await db.select().from(quizQuestions);
    // Cast to QuizQuestion for type compatibility
    return questions as unknown as QuizQuestion[];
  }

  async getQuizQuestion(id: number): Promise<QuizQuestion | undefined> {
    const [question] = await db.select().from(quizQuestions).where(eq(quizQuestions.id, id));
    // Cast to QuizQuestion for type compatibility
    return question as unknown as QuizQuestion;
  }

  async createQuizQuestion(question: InsertQuizQuestion): Promise<QuizQuestion> {
    const [newQuestion] = await db.insert(quizQuestions).values(question).returning();
    // Cast to QuizQuestion for type compatibility
    return newQuestion as unknown as QuizQuestion;
  }

  // Quiz result methods
  async createQuizResult(result: InsertQuizResult): Promise<QuizResult> {
    const [newResult] = await db.insert(quizResults).values(result).returning();
    return newResult;
  }

  async getQuizResult(id: number): Promise<QuizResult | undefined> {
    const [result] = await db.select().from(quizResults).where(eq(quizResults.id, id));
    return result;
  }
  
  async getUserQuizResults(userId: number): Promise<QuizResult[]> {
    return await db
      .select()
      .from(quizResults)
      .where(eq(quizResults.userId, userId))
      .orderBy(desc(quizResults.createdAt));
  }

  // Quiz answer methods
  async createQuizAnswer(answer: InsertQuizAnswer): Promise<QuizAnswer> {
    const [newAnswer] = await db.insert(quizAnswers).values(answer).returning();
    return newAnswer;
  }

  async getQuizAnswersByResultId(resultId: number): Promise<QuizAnswer[]> {
    return await db
      .select()
      .from(quizAnswers)
      .where(eq(quizAnswers.resultId, resultId));
  }

  // Team methods
  async createTeam(teamData: InsertTeam): Promise<Team> {
    // Generate a random invite code
    const inviteCode = randomBytes(6).toString('hex');
    
    const [team] = await db
      .insert(teams)
      .values({ ...teamData, inviteCode })
      .returning();
    
    // Automatically add creator as team leader
    await this.addTeamMember({
      teamId: team.id,
      userId: teamData.createdById,
      isLeader: true
    });
    
    return team;
  }

  async getTeam(id: number): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team;
  }

  async getUserTeams(userId: number): Promise<Team[]> {
    const userTeamMemberships = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.userId, userId));
    
    if (userTeamMemberships.length === 0) {
      return [];
    }
    
    const teamIds = userTeamMemberships.map(tm => tm.teamId);
    
    // Use a different approach for querying multiple IDs
    const allTeams = await db.select().from(teams);
    return allTeams.filter(team => teamIds.includes(team.id));
  }

  async getTeamMembers(teamId: number): Promise<TeamMember[]> {
    return await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.teamId, teamId));
  }

  async getTeamsByOrganization(organizationId: number): Promise<Team[]> {
    return await db
      .select()
      .from(teams)
      .where(eq(teams.organizationId, organizationId));
  }

  async addTeamMember(teamMember: InsertTeamMember): Promise<TeamMember> {
    const [newMember] = await db
      .insert(teamMembers)
      .values(teamMember)
      .returning();
    
    return newMember;
  }

  async isTeamLeader(userId: number, teamId: number): Promise<boolean> {
    const [membership] = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.userId, userId),
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.isLeader, true)
        )
      );
    
    return !!membership;
  }

  async isTeamMember(userId: number, teamId: number): Promise<boolean> {
    const [membership] = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.userId, userId),
          eq(teamMembers.teamId, teamId)
        )
      );
    
    return !!membership;
  }

  // Organization methods
  async createOrganization(orgData: InsertOrganization): Promise<Organization> {
    const [organization] = await db
      .insert(organizations)
      .values(orgData)
      .returning();
    
    // Add creator as organization admin
    await this.addOrganizationMember({
      organizationId: organization.id,
      userId: orgData.createdById,
      isAdmin: true
    });
    
    return organization;
  }

  async getOrganization(id: number): Promise<Organization | undefined> {
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, id));
    
    return org;
  }

  async getUserOrganizations(userId: number): Promise<Organization[]> {
    const userOrgMemberships = await db
      .select()
      .from(organizationMembers)
      .where(eq(organizationMembers.userId, userId));
    
    if (userOrgMemberships.length === 0) {
      return [];
    }
    
    const orgIds = userOrgMemberships.map(om => om.organizationId);
    
    // Use a different approach for querying multiple IDs
    const allOrgs = await db.select().from(organizations);
    return allOrgs.filter(org => orgIds.includes(org.id));
  }

  async addOrganizationMember(orgMember: InsertOrganizationMember): Promise<OrganizationMember> {
    const [newMember] = await db
      .insert(organizationMembers)
      .values(orgMember)
      .returning();
    
    return newMember;
  }

  async isOrganizationAdmin(userId: number, organizationId: number): Promise<boolean> {
    const [membership] = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.userId, userId),
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.isAdmin, true)
        )
      );
    
    return !!membership;
  }

  // Team analytics methods
  async createOrUpdateTeamAnalytics(data: InsertTeamAnalytics): Promise<TeamAnalytics> {
    // Check if analytics exist for the team
    const [existingAnalytics] = await db
      .select()
      .from(teamAnalytics)
      .where(eq(teamAnalytics.teamId, data.teamId));
    
    if (existingAnalytics) {
      // Update existing analytics
      const [updated] = await db
        .update(teamAnalytics)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(teamAnalytics.id, existingAnalytics.id))
        .returning();
      
      return updated;
    } else {
      // Create new analytics
      const [newAnalytics] = await db
        .insert(teamAnalytics)
        .values(data)
        .returning();
      
      return newAnalytics;
    }
  }

  async getTeamAnalytics(teamId: number): Promise<TeamAnalytics | undefined> {
    const [analytics] = await db
      .select()
      .from(teamAnalytics)
      .where(eq(teamAnalytics.teamId, teamId));
    
    return analytics;
  }

  // Organization analytics methods
  async createOrUpdateOrgAnalytics(data: InsertOrgAnalytics): Promise<OrganizationAnalytics> {
    // Check if analytics exist for the organization
    const [existingAnalytics] = await db
      .select()
      .from(organizationAnalytics)
      .where(eq(organizationAnalytics.organizationId, data.organizationId));
    
    if (existingAnalytics) {
      // Update existing analytics
      const [updated] = await db
        .update(organizationAnalytics)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(organizationAnalytics.id, existingAnalytics.id))
        .returning();
      
      return updated;
    } else {
      // Create new analytics
      const [newAnalytics] = await db
        .insert(organizationAnalytics)
        .values(data)
        .returning();
      
      return newAnalytics;
    }
  }

  async getOrganizationAnalytics(organizationId: number): Promise<OrganizationAnalytics | undefined> {
    const [analytics] = await db
      .select()
      .from(organizationAnalytics)
      .where(eq(organizationAnalytics.organizationId, organizationId));
    
    return analytics;
  }

  // Report comparison methods
  async createReportComparison(comparison: InsertReportComparison): Promise<ReportComparison> {
    const [newComparison] = await db
      .insert(reportComparisons)
      .values(comparison)
      .returning();
    
    return newComparison;
  }

  async getUserReportComparisons(userId: number): Promise<ReportComparison[]> {
    return await db
      .select()
      .from(reportComparisons)
      .where(eq(reportComparisons.userId, userId))
      .orderBy(desc(reportComparisons.createdAt));
  }

  async getReportComparison(id: number): Promise<ReportComparison | undefined> {
    const [comparison] = await db
      .select()
      .from(reportComparisons)
      .where(eq(reportComparisons.id, id));
    
    return comparison;
  }
}