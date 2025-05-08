import {
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
import { Store } from "express-session";
import session from "express-session";
import createMemoryStore from "memorystore";
import { DatabaseStorage } from "./database-storage";

// Interface that defines all storage operations
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Quiz question methods
  getAllQuizQuestions(): Promise<QuizQuestion[]>;
  getQuizQuestion(id: number): Promise<QuizQuestion | undefined>;
  createQuizQuestion(question: InsertQuizQuestion): Promise<QuizQuestion>;
  
  // Quiz result methods
  createQuizResult(result: InsertQuizResult): Promise<QuizResult>;
  getQuizResult(id: number): Promise<QuizResult | undefined>;
  getUserQuizResults(userId: number): Promise<QuizResult[]>;
  
  // Quiz answer methods
  createQuizAnswer(answer: InsertQuizAnswer): Promise<QuizAnswer>;
  getQuizAnswersByResultId(resultId: number): Promise<QuizAnswer[]>;
  deleteQuizAnswersByResultId(resultId: number): Promise<void>;
  deleteQuizResult(resultId: number): Promise<void>;
  
  // Team methods
  createTeam(team: InsertTeam): Promise<Team>;
  getTeam(id: number): Promise<Team | undefined>;
  getUserTeams(userId: number): Promise<Team[]>;
  getTeamMembers(teamId: number): Promise<TeamMember[]>;
  getTeamsByOrganization(organizationId: number): Promise<Team[]>;
  addTeamMember(teamMember: InsertTeamMember): Promise<TeamMember>;
  isTeamLeader(userId: number, teamId: number): Promise<boolean>;
  isTeamMember(userId: number, teamId: number): Promise<boolean>;
  
  // Organization methods
  createOrganization(organization: InsertOrganization): Promise<Organization>;
  getOrganization(id: number): Promise<Organization | undefined>;
  getUserOrganizations(userId: number): Promise<Organization[]>;
  addOrganizationMember(orgMember: InsertOrganizationMember): Promise<OrganizationMember>;
  isOrganizationAdmin(userId: number, organizationId: number): Promise<boolean>;
  
  // Team analytics methods
  createOrUpdateTeamAnalytics(analytics: InsertTeamAnalytics): Promise<TeamAnalytics>;
  getTeamAnalytics(teamId: number): Promise<TeamAnalytics | undefined>;
  
  // Organization analytics methods
  createOrUpdateOrgAnalytics(analytics: InsertOrgAnalytics): Promise<OrganizationAnalytics>;
  getOrganizationAnalytics(organizationId: number): Promise<OrganizationAnalytics | undefined>;
  
  // Report comparison methods
  createReportComparison(comparison: InsertReportComparison): Promise<ReportComparison>;
  getUserReportComparisons(userId: number): Promise<ReportComparison[]>;
  getReportComparison(id: number): Promise<ReportComparison | undefined>;
  
  // Session store for authentication
  sessionStore: Store;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private quizQuestions: Map<number, QuizQuestion>;
  private quizResults: Map<number, QuizResult>;
  private quizAnswers: Map<number, QuizAnswer>;
  
  private userId: number;
  private questionId: number;
  private resultId: number;
  private answerId: number;
  sessionStore: Store;

  constructor() {
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // One day
    });

    this.users = new Map();
    this.quizQuestions = new Map();
    this.quizResults = new Map();
    this.quizAnswers = new Map();
    
    this.userId = 1;
    this.questionId = 1;
    this.resultId = 1;
    this.answerId = 1;
    
    // Initialize with quiz questions
    this.initializeQuizQuestions();
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    // We need to cast here because the User type requires more fields
    // than what we provide, but this is fine for in-memory storage
    const user = { ...insertUser, id } as User;
    this.users.set(id, user);
    return user;
  }
  
  async getAllQuizQuestions(): Promise<QuizQuestion[]> {
    return Array.from(this.quizQuestions.values());
  }
  
  async getQuizQuestion(id: number): Promise<QuizQuestion | undefined> {
    return this.quizQuestions.get(id);
  }
  
  async createQuizQuestion(insertQuestion: InsertQuizQuestion): Promise<QuizQuestion> {
    const id = this.questionId++;
    // Cast to QuizQuestion for in-memory storage
    const question = { ...insertQuestion, id } as QuizQuestion;
    this.quizQuestions.set(id, question);
    return question;
  }
  
  async createQuizResult(insertResult: InsertQuizResult): Promise<QuizResult> {
    const id = this.resultId++;
    // Cast to QuizResult for in-memory storage
    const result = { 
      ...insertResult, 
      id,
      userId: insertResult.userId || null,
      createdAt: new Date()
    } as QuizResult;
    this.quizResults.set(id, result);
    return result;
  }
  
  async getQuizResult(id: number): Promise<QuizResult | undefined> {
    return this.quizResults.get(id);
  }
  
  async getUserQuizResults(userId: number): Promise<QuizResult[]> {
    return Array.from(this.quizResults.values()).filter(
      (result) => result.userId === userId
    );
  }
  
  async createQuizAnswer(insertAnswer: InsertQuizAnswer): Promise<QuizAnswer> {
    const id = this.answerId++;
    // Cast to QuizAnswer for in-memory storage
    const answer = { 
      ...insertAnswer, 
      id,
      resultId: insertAnswer.resultId || null,
      questionId: insertAnswer.questionId || null
    } as QuizAnswer;
    this.quizAnswers.set(id, answer);
    return answer;
  }
  
  async getQuizAnswersByResultId(resultId: number): Promise<QuizAnswer[]> {
    return Array.from(this.quizAnswers.values()).filter(
      (answer) => answer.resultId === resultId
    );
  }
  
  async deleteQuizAnswersByResultId(resultId: number): Promise<void> {
    // Find all answers for this result
    const answersToDelete = Array.from(this.quizAnswers.entries())
      .filter(([_, answer]) => answer.resultId === resultId)
      .map(([id, _]) => id);
    
    // Delete each answer
    for (const id of answersToDelete) {
      this.quizAnswers.delete(id);
    }
  }
  
  async deleteQuizResult(resultId: number): Promise<void> {
    this.quizResults.delete(resultId);
  }
  
  // Stubbed team methods
  async createTeam(team: InsertTeam): Promise<Team> {
    throw new Error("MemStorage does not implement team functionality");
  }
  
  async getTeam(id: number): Promise<Team | undefined> {
    throw new Error("MemStorage does not implement team functionality");
  }
  
  async getUserTeams(userId: number): Promise<Team[]> {
    return [];
  }
  
  async getTeamMembers(teamId: number): Promise<TeamMember[]> {
    return [];
  }
  
  async getTeamsByOrganization(organizationId: number): Promise<Team[]> {
    return [];
  }
  
  async addTeamMember(teamMember: InsertTeamMember): Promise<TeamMember> {
    throw new Error("MemStorage does not implement team functionality");
  }
  
  async isTeamLeader(userId: number, teamId: number): Promise<boolean> {
    return false;
  }
  
  async isTeamMember(userId: number, teamId: number): Promise<boolean> {
    return false;
  }
  
  // Stubbed organization methods
  async createOrganization(organization: InsertOrganization): Promise<Organization> {
    throw new Error("MemStorage does not implement organization functionality");
  }
  
  async getOrganization(id: number): Promise<Organization | undefined> {
    throw new Error("MemStorage does not implement organization functionality");
  }
  
  async getUserOrganizations(userId: number): Promise<Organization[]> {
    return [];
  }
  
  async addOrganizationMember(orgMember: InsertOrganizationMember): Promise<OrganizationMember> {
    throw new Error("MemStorage does not implement organization functionality");
  }
  
  async isOrganizationAdmin(userId: number, organizationId: number): Promise<boolean> {
    return false;
  }
  
  // Stubbed analytics methods
  async createOrUpdateTeamAnalytics(analytics: InsertTeamAnalytics): Promise<TeamAnalytics> {
    throw new Error("MemStorage does not implement analytics functionality");
  }
  
  async getTeamAnalytics(teamId: number): Promise<TeamAnalytics | undefined> {
    throw new Error("MemStorage does not implement analytics functionality");
  }
  
  async createOrUpdateOrgAnalytics(analytics: InsertOrgAnalytics): Promise<OrganizationAnalytics> {
    throw new Error("MemStorage does not implement analytics functionality");
  }
  
  async getOrganizationAnalytics(organizationId: number): Promise<OrganizationAnalytics | undefined> {
    throw new Error("MemStorage does not implement analytics functionality");
  }
  
  // Stubbed comparison methods
  async createReportComparison(comparison: InsertReportComparison): Promise<ReportComparison> {
    throw new Error("MemStorage does not implement comparison functionality");
  }
  
  async getUserReportComparisons(userId: number): Promise<ReportComparison[]> {
    return [];
  }
  
  async getReportComparison(id: number): Promise<ReportComparison | undefined> {
    throw new Error("MemStorage does not implement comparison functionality");
  }
  
  private initializeQuizQuestions() {
    const questions: InsertQuizQuestion[] = [
      {
        text: "I am perceived as someone who:",
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
          { text: "Considerate and agreeable", color: "earth-green" },
          { text: "Factual and precise", color: "cool-blue" }
        ]
      },
      {
        text: "In a team environment, I naturally:",
        options: [
          { text: "Take charge and focus on results", color: "fiery-red" },
          { text: "Motivate others and generate ideas", color: "sunshine-yellow" },
          { text: "Create harmony and support colleagues", color: "earth-green" },
          { text: "Ensure accuracy and maintain quality", color: "cool-blue" }
        ]
      },
      {
        text: "When making decisions, I tend to:",
        options: [
          { text: "Be direct and focus on outcomes", color: "fiery-red" },
          { text: "Consider what's exciting and engaging", color: "sunshine-yellow" },
          { text: "Think about how others will feel", color: "earth-green" },
          { text: "Analyze the facts and logical implications", color: "cool-blue" }
        ]
      },
      {
        text: "My ideal work environment is:",
        options: [
          { text: "Fast-paced with clear goals", color: "fiery-red" },
          { text: "Varied and people-oriented", color: "sunshine-yellow" },
          { text: "Collaborative and supportive", color: "earth-green" },
          { text: "Structured and detail-focused", color: "cool-blue" }
        ]
      },
      {
        text: "Others might describe me as:",
        options: [
          { text: "Determined and assertive", color: "fiery-red" },
          { text: "Enthusiastic and persuasive", color: "sunshine-yellow" },
          { text: "Calm and accommodating", color: "earth-green" },
          { text: "Analytical and thorough", color: "cool-blue" }
        ]
      },
      {
        text: "Under pressure, I may become:",
        options: [
          { text: "Demanding and controlling", color: "fiery-red" },
          { text: "Excitable and disorganized", color: "sunshine-yellow" },
          { text: "Submissive and indecisive", color: "earth-green" },
          { text: "Withdrawn and nitpicking", color: "cool-blue" }
        ]
      },
      {
        text: "My conflict resolution approach tends to be:",
        options: [
          { text: "Confronting issues directly", color: "fiery-red" },
          { text: "Discussing openly and expressively", color: "sunshine-yellow" },
          { text: "Finding compromises and maintaining relationships", color: "earth-green" },
          { text: "Analyzing the facts and being objective", color: "cool-blue" }
        ]
      },
      {
        text: "I am motivated by:",
        options: [
          { text: "Challenges and achieving results", color: "fiery-red" },
          { text: "Recognition and social interaction", color: "sunshine-yellow" },
          { text: "Helping others and creating harmony", color: "earth-green" },
          { text: "Intellectual stimulation and expertise", color: "cool-blue" }
        ]
      },
      {
        text: "When leading others, I emphasize:",
        options: [
          { text: "Clear direction and accountability", color: "fiery-red" },
          { text: "Inspiration and team spirit", color: "sunshine-yellow" },
          { text: "Consensus and personal development", color: "earth-green" },
          { text: "High standards and systematic approaches", color: "cool-blue" }
        ]
      },
      {
        text: "My primary contribution to a team is:",
        options: [
          { text: "Driving action and focusing on goals", color: "fiery-red" },
          { text: "Creating energy and generating ideas", color: "sunshine-yellow" },
          { text: "Promoting cooperation and supporting members", color: "earth-green" },
          { text: "Ensuring accuracy and questioning assumptions", color: "cool-blue" }
        ]
      },
      {
        text: "In meetings, I typically:",
        options: [
          { text: "Focus on objectives and outcomes", color: "fiery-red" },
          { text: "Share ideas and encourage participation", color: "sunshine-yellow" },
          { text: "Listen carefully and build consensus", color: "earth-green" },
          { text: "Examine details and provide analysis", color: "cool-blue" }
        ]
      },
      {
        text: "When implementing change, I prefer to:",
        options: [
          { text: "Move quickly and deal with resistance firmly", color: "fiery-red" },
          { text: "Sell the benefits and make it exciting", color: "sunshine-yellow" },
          { text: "Ensure everyone is comfortable and supported", color: "earth-green" },
          { text: "Provide a detailed plan with clear rationale", color: "cool-blue" }
        ]
      },
      {
        text: "I value others who are:",
        options: [
          { text: "Decisive and straightforward", color: "fiery-red" },
          { text: "Engaging and optimistic", color: "sunshine-yellow" },
          { text: "Supportive and considerate", color: "earth-green" },
          { text: "Accurate and logical", color: "cool-blue" }
        ]
      },
      {
        text: "My approach to planning is:",
        options: [
          { text: "Focus on immediate actions and results", color: "fiery-red" },
          { text: "Keep options open and be adaptable", color: "sunshine-yellow" },
          { text: "Consider how the plan affects everyone", color: "earth-green" },
          { text: "Create detailed strategies with contingencies", color: "cool-blue" }
        ]
      },
      {
        text: "When receiving feedback, I prefer it to be:",
        options: [
          { text: "Direct and results-focused", color: "fiery-red" },
          { text: "Enthusiastic and future-oriented", color: "sunshine-yellow" },
          { text: "Supportive and constructive", color: "earth-green" },
          { text: "Detailed and specific", color: "cool-blue" }
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
          { text: "Get straight to the point and focus on application", color: "fiery-red" },
          { text: "Make it engaging and use stories", color: "sunshine-yellow" },
          { text: "Ensure it's accessible and check for understanding", color: "earth-green" },
          { text: "Provide comprehensive information with precise details", color: "cool-blue" }
        ]
      },
      {
        text: "My greatest strength is being:",
        options: [
          { text: "Action-oriented and decisive", color: "fiery-red" },
          { text: "Optimistic and inspirational", color: "sunshine-yellow" },
          { text: "Patient and supportive", color: "earth-green" },
          { text: "Analytical and systematic", color: "cool-blue" }
        ]
      },
      {
        text: "I am at my best when:",
        options: [
          { text: "Taking control of challenging situations", color: "fiery-red" },
          { text: "Generating enthusiasm for new initiatives", color: "sunshine-yellow" },
          { text: "Bringing people together harmoniously", color: "earth-green" },
          { text: "Solving complex problems methodically", color: "cool-blue" }
        ]
      },
      {
        text: "When evaluating success, I focus on:",
        options: [
          { text: "Measurable results and achievements", color: "fiery-red" },
          { text: "Innovation and positive impact on people", color: "sunshine-yellow" },
          { text: "Team cohesion and personal growth", color: "earth-green" },
          { text: "Quality, accuracy and process improvement", color: "cool-blue" }
        ]
      },
      {
        text: "Others may misinterpret my intentions when I am being:",
        options: [
          { text: "Direct and focused on the task", color: "fiery-red" },
          { text: "Expressive and quick to change course", color: "sunshine-yellow" },
          { text: "Accommodating and reluctant to disagree", color: "earth-green" },
          { text: "Reserved and analytical about decisions", color: "cool-blue" }
        ]
      },
      {
        text: "My approach to time management is:",
        options: [
          { text: "Prioritize efficiently and take prompt action", color: "fiery-red" },
          { text: "Keep schedules flexible and focus on what's enjoyable", color: "sunshine-yellow" },
          { text: "Allow sufficient time for people's needs", color: "earth-green" },
          { text: "Plan meticulously and be punctual", color: "cool-blue" }
        ]
      }
    ];
    
    questions.forEach(question => {
      const id = this.questionId++;
      // Cast to QuizQuestion for in-memory storage
      const newQuestion = { ...question, id } as QuizQuestion;
      this.quizQuestions.set(id, newQuestion);
    });
  }
}

// Use DatabaseStorage for production
export const storage = new DatabaseStorage();