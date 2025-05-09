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
    
    // Initialize quiz questions if they don't exist
    this.initializeQuizQuestions();
  }
  
  // Initialize quiz questions in the database
  private async initializeQuizQuestions() {
    try {
      // Check if questions already exist
      const result = await db.execute<{ count: string }>(
        `SELECT COUNT(*) as count FROM quiz_questions`
      );
      const count = parseInt(result.rows[0]?.count || '0', 10);
      
      if (count === 0) {
        console.log('Initializing quiz questions...');
        
        // The questions data
        const questionsData = this.getQuestionsData();
        
        // Insert questions into database
        for (const question of questionsData) {
          await db.insert(quizQuestions).values({
            text: question.text,
            options: question.options
          });
        }
        
        console.log('Quiz questions initialized successfully.');
      }
    } catch (error) {
      console.error('Error initializing quiz questions:', error);
    }
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
  
  async deleteQuizAnswersByResultId(resultId: number): Promise<void> {
    await db.delete(quizAnswers).where(eq(quizAnswers.resultId, resultId));
  }
  
  async deleteQuizResult(resultId: number): Promise<void> {
    await db.delete(quizResults).where(eq(quizResults.id, resultId));
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
    // Join with users table to get user information
    const members = await db
      .select({
        id: teamMembers.id,
        userId: teamMembers.userId,
        teamId: teamMembers.teamId,
        isLeader: teamMembers.isLeader,
        joinedAt: teamMembers.joinedAt,
        username: users.username,
        fullName: users.fullName,
        email: users.email
      })
      .from(teamMembers)
      .leftJoin(users, eq(teamMembers.userId, users.id))
      .where(eq(teamMembers.teamId, teamId));
    
    return members;
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
  
  // Get quiz questions data
  private getQuestionsData() {
    return [
      {
        text: "At my best, I am:",
        options: [
          { text: "Is determined and decisive", color: "fiery-red" },
          { text: "Is sociable and dynamic", color: "sunshine-yellow" },
          { text: "Is caring and patient", color: "earth-green" },
          { text: "Is precise and questioning", color: "cool-blue" }
        ]
      },
      {
        text: "When facing challenges, I prefer to:",
        options: [
          { text: "Act quickly and directly", color: "fiery-red" },
          { text: "Involve others and be enthusiastic", color: "sunshine-yellow" },
          { text: "Support the team and maintain harmony", color: "earth-green" },
          { text: "Analyze all options methodically", color: "cool-blue" }
        ]
      },
      {
        text: "My communication style can be described as:",
        options: [
          { text: "Brief and to the point", color: "fiery-red" },
          { text: "Expressive and persuasive", color: "sunshine-yellow" },
          { text: "Thoughtful and considerate", color: "earth-green" },
          { text: "Detailed and thorough", color: "cool-blue" }
        ]
      },
      {
        text: "I make decisions by:",
        options: [
          { text: "Taking immediate action", color: "fiery-red" },
          { text: "Considering how others feel", color: "sunshine-yellow" },
          { text: "Building consensus in the group", color: "earth-green" },
          { text: "Analyzing all available data", color: "cool-blue" }
        ]
      },
      {
        text: "Under pressure, I may become:",
        options: [
          { text: "Aggressive or controlling", color: "fiery-red" },
          { text: "Disorganized or impulsive", color: "sunshine-yellow" },
          { text: "Indecisive or withdrawn", color: "earth-green" },
          { text: "Critical or aloof", color: "cool-blue" }
        ]
      },
      {
        text: "I find it most motivating when:",
        options: [
          { text: "I can take charge of situations", color: "fiery-red" },
          { text: "I can interact with many people", color: "sunshine-yellow" },
          { text: "I can create a harmonious environment", color: "earth-green" },
          { text: "I can solve complex problems", color: "cool-blue" }
        ]
      },
      {
        text: "In meetings, I tend to:",
        options: [
          { text: "Focus on results and next steps", color: "fiery-red" },
          { text: "Generate ideas and share stories", color: "sunshine-yellow" },
          { text: "Ensure everyone is heard and comfortable", color: "earth-green" },
          { text: "Ask questions and analyze options", color: "cool-blue" }
        ]
      },
      {
        text: "I prefer working with people who are:",
        options: [
          { text: "Decisive and direct", color: "fiery-red" },
          { text: "Enthusiastic and creative", color: "sunshine-yellow" },
          { text: "Supportive and cooperative", color: "earth-green" },
          { text: "Accurate and logical", color: "cool-blue" }
        ]
      },
      {
        text: "I find it challenging to work with people who are:",
        options: [
          { text: "Slow to decide or overly cautious", color: "fiery-red" },
          { text: "Serious and lacking enthusiasm", color: "sunshine-yellow" },
          { text: "Aggressive or insensitive to others", color: "earth-green" },
          { text: "Disorganized or too impulsive", color: "cool-blue" }
        ]
      },
      {
        text: "In social settings, I tend to:",
        options: [
          { text: "Take the lead and be direct", color: "fiery-red" },
          { text: "Be lively and the center of attention", color: "sunshine-yellow" },
          { text: "Listen and focus on individual connections", color: "earth-green" },
          { text: "Observe and engage in meaningful conversations", color: "cool-blue" }
        ]
      },
      {
        text: "When explaining a concept, I typically:",
        options: [
          { text: "Get straight to the point", color: "fiery-red" },
          { text: "Use stories and analogies", color: "sunshine-yellow" },
          { text: "Focus on how it affects people", color: "earth-green" },
          { text: "Provide comprehensive details", color: "cool-blue" }
        ]
      },
      {
        text: "My workspace is usually:",
        options: [
          { text: "Functional and organized for efficiency", color: "fiery-red" },
          { text: "Vibrant and stimulating", color: "sunshine-yellow" },
          { text: "Comfortable and personalized", color: "earth-green" },
          { text: "Neat and systematically arranged", color: "cool-blue" }
        ]
      },
      {
        text: "When working on a team project, I focus on:",
        options: [
          { text: "Achieving results quickly", color: "fiery-red" },
          { text: "Making the process fun and engaging", color: "sunshine-yellow" },
          { text: "Ensuring everyone works well together", color: "earth-green" },
          { text: "Maintaining high standards and accuracy", color: "cool-blue" }
        ]
      },
      {
        text: "I'm most productive when:",
        options: [
          { text: "I have autonomy and control", color: "fiery-red" },
          { text: "I'm in a stimulating environment", color: "sunshine-yellow" },
          { text: "I feel supported by my team", color: "earth-green" },
          { text: "I have clear guidelines and quiet time", color: "cool-blue" }
        ]
      },
      {
        text: "My approach to change is typically:",
        options: [
          { text: "Embrace it and move forward quickly", color: "fiery-red" },
          { text: "Get excited about new possibilities", color: "sunshine-yellow" },
          { text: "Consider how it affects everyone involved", color: "earth-green" },
          { text: "Analyze the risks and benefits thoroughly", color: "cool-blue" }
        ]
      },
      {
        text: "My leadership style tends to be:",
        options: [
          { text: "Direct and results-oriented", color: "fiery-red" },
          { text: "Inspirational and encouraging", color: "sunshine-yellow" },
          { text: "Supportive and collaborative", color: "earth-green" },
          { text: "Systematic and thorough", color: "cool-blue" }
        ]
      },
      {
        text: "In conflict situations, I typically:",
        options: [
          { text: "Confront issues directly", color: "fiery-red" },
          { text: "Try to lighten the mood", color: "sunshine-yellow" },
          { text: "Seek harmony and compromise", color: "earth-green" },
          { text: "Analyze the facts objectively", color: "cool-blue" }
        ]
      },
      {
        text: "When learning something new, I prefer:",
        options: [
          { text: "Practical, hands-on experience", color: "fiery-red" },
          { text: "Interactive, group activities", color: "sunshine-yellow" },
          { text: "Personal guidance and mentoring", color: "earth-green" },
          { text: "Detailed instructions and research", color: "cool-blue" }
        ]
      },
      {
        text: "Others may see me as:",
        options: [
          { text: "Confident and strong-willed", color: "fiery-red" },
          { text: "Outgoing and enthusiastic", color: "sunshine-yellow" },
          { text: "Patient and accommodating", color: "earth-green" },
          { text: "Analytical and precise", color: "cool-blue" }
        ]
      },
      {
        text: "When giving feedback, I tend to be:",
        options: [
          { text: "Direct and to the point", color: "fiery-red" },
          { text: "Positive and encouraging", color: "sunshine-yellow" },
          { text: "Gentle and supportive", color: "earth-green" },
          { text: "Detailed and constructive", color: "cool-blue" }
        ]
      },
      {
        text: "I value most in a workplace:",
        options: [
          { text: "Efficiency and results", color: "fiery-red" },
          { text: "Creativity and enthusiasm", color: "sunshine-yellow" },
          { text: "Harmony and cooperation", color: "earth-green" },
          { text: "Quality and accuracy", color: "cool-blue" }
        ]
      },
      {
        text: "When setting goals, I focus on:",
        options: [
          { text: "Ambitious targets and quick wins", color: "fiery-red" },
          { text: "Exciting possibilities and innovation", color: "sunshine-yellow" },
          { text: "Sustainable progress and team wellbeing", color: "earth-green" },
          { text: "Detailed plans and measured outcomes", color: "cool-blue" }
        ]
      },
      {
        text: "My biggest strength is:",
        options: [
          { text: "Taking action and driving results", color: "fiery-red" },
          { text: "Inspiring others and generating enthusiasm", color: "sunshine-yellow" },
          { text: "Building relationships and supporting others", color: "earth-green" },
          { text: "Analyzing situations and ensuring accuracy", color: "cool-blue" }
        ]
      },
      {
        text: "When making a presentation, I typically:",
        options: [
          { text: "Focus on key points and bottom line", color: "fiery-red" },
          { text: "Use engaging stories and visuals", color: "sunshine-yellow" },
          { text: "Create a comfortable atmosphere", color: "earth-green" },
          { text: "Provide detailed information and analysis", color: "cool-blue" }
        ]
      },
      {
        text: "My ideal weekend would include:",
        options: [
          { text: "Challenging activities and achievements", color: "fiery-red" },
          { text: "Social events and spontaneous fun", color: "sunshine-yellow" },
          { text: "Relaxing with close friends or family", color: "earth-green" },
          { text: "Pursuing interests and learning new things", color: "cool-blue" }
        ]
      }
    ];
  }
}