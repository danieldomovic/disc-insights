import {
  type User,
  type InsertUser,
  type QuizQuestion,
  type InsertQuizQuestion,
  type QuizResult,
  type InsertQuizResult,
  type QuizAnswer,
  type InsertQuizAnswer,
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Quiz question methods
  getAllQuizQuestions(): Promise<QuizQuestion[]>;
  getQuizQuestion(id: number): Promise<QuizQuestion | undefined>;
  createQuizQuestion(question: InsertQuizQuestion): Promise<QuizQuestion>;
  
  // Quiz result methods
  createQuizResult(result: InsertQuizResult): Promise<QuizResult>;
  getQuizResult(id: number): Promise<QuizResult | undefined>;
  
  // Quiz answer methods
  createQuizAnswer(answer: InsertQuizAnswer): Promise<QuizAnswer>;
  getQuizAnswersByResultId(resultId: number): Promise<QuizAnswer[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private quizQuestions: Map<number, QuizQuestion>;
  private quizResults: Map<number, QuizResult>;
  private quizAnswers: Map<number, QuizAnswer>;
  
  private userId: number;
  private questionId: number;
  private resultId: number;
  private answerId: number;

  constructor() {
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
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
    const question: QuizQuestion = { ...insertQuestion, id };
    this.quizQuestions.set(id, question);
    return question;
  }
  
  async createQuizResult(insertResult: InsertQuizResult): Promise<QuizResult> {
    const id = this.resultId++;
    const result: QuizResult = { 
      ...insertResult, 
      id,
      userId: insertResult.userId || null 
    };
    this.quizResults.set(id, result);
    return result;
  }
  
  async getQuizResult(id: number): Promise<QuizResult | undefined> {
    return this.quizResults.get(id);
  }
  
  async createQuizAnswer(insertAnswer: InsertQuizAnswer): Promise<QuizAnswer> {
    const id = this.answerId++;
    const answer: QuizAnswer = { 
      ...insertAnswer, 
      id,
      resultId: insertAnswer.resultId || null,
      questionId: insertAnswer.questionId || null
    };
    this.quizAnswers.set(id, answer);
    return answer;
  }
  
  async getQuizAnswersByResultId(resultId: number): Promise<QuizAnswer[]> {
    return Array.from(this.quizAnswers.values()).filter(
      (answer) => answer.resultId === resultId
    );
  }
  
  private initializeQuizQuestions() {
    const questions: InsertQuizQuestion[] = [
      {
        text: "I am perceived as someone who is:",
        options: [
          { text: "Determined and dominant", color: "fiery-red" },
          { text: "Sociable and dynamic", color: "sunshine-yellow" },
          { text: "Caring and patient", color: "earth-green" },
          { text: "Precise and questioning", color: "cool-blue" }
        ]
      },
      {
        text: "When interacting with others, I am:",
        options: [
          { text: "Direct and straightforward", color: "fiery-red" },
          { text: "Enthusiastic and expressive", color: "sunshine-yellow" },
          { text: "Supportive and considerate", color: "earth-green" },
          { text: "Formal and analytical", color: "cool-blue" }
        ]
      },
      {
        text: "I contribute to a team by being:",
        options: [
          { text: "Action-oriented and decisive", color: "fiery-red" },
          { text: "Inspiring and persuasive", color: "sunshine-yellow" },
          { text: "Patient and diplomatic", color: "earth-green" },
          { text: "Cautious and accurate", color: "cool-blue" }
        ]
      },
      {
        text: "What motivates me most is:",
        options: [
          { text: "Challenge and control", color: "fiery-red" },
          { text: "Recognition and involvement", color: "sunshine-yellow" },
          { text: "Harmony and appreciation", color: "earth-green" },
          { text: "Precision and expertise", color: "cool-blue" }
        ]
      },
      {
        text: "Under pressure, I can be:",
        options: [
          { text: "Demanding and forceful", color: "fiery-red" },
          { text: "Excitable and disorganized", color: "sunshine-yellow" },
          { text: "Compliant and indecisive", color: "earth-green" },
          { text: "Withdrawn and critical", color: "cool-blue" }
        ]
      },
      {
        text: "I value others who are:",
        options: [
          { text: "Efficient and competent", color: "fiery-red" },
          { text: "Optimistic and flexible", color: "sunshine-yellow" },
          { text: "Sincere and harmonious", color: "earth-green" },
          { text: "Factual and correct", color: "cool-blue" }
        ]
      },
      {
        text: "I believe a good leader should be:",
        options: [
          { text: "Authoritative and results-focused", color: "fiery-red" },
          { text: "Visionary and engaging", color: "sunshine-yellow" },
          { text: "Supportive and team-oriented", color: "earth-green" },
          { text: "Objective and strategic", color: "cool-blue" }
        ]
      },
      {
        text: "In my communication, I tend to be:",
        options: [
          { text: "Brief and to the point", color: "fiery-red" },
          { text: "Animated and persuasive", color: "sunshine-yellow" },
          { text: "Amiable and people-focused", color: "earth-green" },
          { text: "Detailed and systematic", color: "cool-blue" }
        ]
      },
      {
        text: "My ideal working environment is:",
        options: [
          { text: "Fast-paced and results-oriented", color: "fiery-red" },
          { text: "Creative and stimulating", color: "sunshine-yellow" },
          { text: "Calm and collaborative", color: "earth-green" },
          { text: "Structured and methodical", color: "cool-blue" }
        ]
      },
      {
        text: "When making decisions, I prefer to:",
        options: [
          { text: "Act quickly and assertively", color: "fiery-red" },
          { text: "Follow intuition and explore options", color: "sunshine-yellow" },
          { text: "Seek consensus and consider feelings", color: "earth-green" },
          { text: "Gather facts and be methodical", color: "cool-blue" }
        ]
      },
      {
        text: "My strengths include being:",
        options: [
          { text: "Bold and purposeful", color: "fiery-red" },
          { text: "Outgoing and enthusiastic", color: "sunshine-yellow" },
          { text: "Reliable and relationship-oriented", color: "earth-green" },
          { text: "Thorough and logical", color: "cool-blue" }
        ]
      },
      {
        text: "I may need to develop my ability to be more:",
        options: [
          { text: "Patient and empathetic", color: "fiery-red" },
          { text: "Focused and organized", color: "sunshine-yellow" },
          { text: "Assertive and decisive", color: "earth-green" },
          { text: "Open and adaptable", color: "cool-blue" }
        ]
      },
      {
        text: "Others may describe me as:",
        options: [
          { text: "Competitive and driven", color: "fiery-red" },
          { text: "Spontaneous and lively", color: "sunshine-yellow" },
          { text: "Accommodating and gentle", color: "earth-green" },
          { text: "Methodical and reserved", color: "cool-blue" }
        ]
      },
      {
        text: "When making plans, I tend to be:",
        options: [
          { text: "Focused on immediate results", color: "fiery-red" },
          { text: "Adaptable and embracing change", color: "sunshine-yellow" },
          { text: "Thoughtful about everyone involved", color: "earth-green" },
          { text: "Systematic and thorough", color: "cool-blue" }
        ]
      },
      {
        text: "In group discussions, I typically:",
        options: [
          { text: "Get straight to the point", color: "fiery-red" },
          { text: "Generate enthusiasm and ideas", color: "sunshine-yellow" },
          { text: "Listen carefully to others' views", color: "earth-green" },
          { text: "Analyze different perspectives", color: "cool-blue" }
        ]
      },
      {
        text: "My approach to relationships is being:",
        options: [
          { text: "Direct and purposeful", color: "fiery-red" },
          { text: "Expressive and fun-loving", color: "sunshine-yellow" },
          { text: "Loyal and supportive", color: "earth-green" },
          { text: "Reserved and selective", color: "cool-blue" }
        ]
      },
      {
        text: "When setting goals, I prioritize:",
        options: [
          { text: "Achieving results as quickly as possible", color: "fiery-red" },
          { text: "Making the process enjoyable for everyone", color: "sunshine-yellow" },
          { text: "Ensuring everyone's needs are considered", color: "earth-green" },
          { text: "Creating a detailed plan with clear metrics", color: "cool-blue" }
        ]
      },
      {
        text: "My preferred way to celebrate success is:",
        options: [
          { text: "Acknowledging achievements and moving to the next challenge", color: "fiery-red" },
          { text: "Having a lively social gathering", color: "sunshine-yellow" },
          { text: "Showing personal appreciation to each team member", color: "earth-green" },
          { text: "Reflecting on what worked well and why", color: "cool-blue" }
        ]
      },
      {
        text: "In challenging situations, I tend to become:",
        options: [
          { text: "Assertive and take control", color: "fiery-red" },
          { text: "Expressive and talk things through", color: "sunshine-yellow" },
          { text: "Agreeable and seek compromise", color: "earth-green" },
          { text: "Reflective and analyze options", color: "cool-blue" }
        ]
      },
      {
        text: "I find it difficult to work with people who are:",
        options: [
          { text: "Overly cautious and indecisive", color: "fiery-red" },
          { text: "Too serious or rigid", color: "sunshine-yellow" },
          { text: "Too forceful or confrontational", color: "earth-green" },
          { text: "Disorganized or impulsive", color: "cool-blue" }
        ]
      },
      {
        text: "My greatest strength at work is being:",
        options: [
          { text: "Results-oriented and determined", color: "fiery-red" },
          { text: "Enthusiastic and persuasive", color: "sunshine-yellow" },
          { text: "Patient and supportive", color: "earth-green" },
          { text: "Detailed and analytical", color: "cool-blue" }
        ]
      },
      {
        text: "The way I process information is:",
        options: [
          { text: "Quickly, focusing on main points", color: "fiery-red" },
          { text: "Intuitively, looking for possibilities", color: "sunshine-yellow" },
          { text: "Carefully, considering implications for people", color: "earth-green" },
          { text: "Methodically, examining all aspects", color: "cool-blue" }
        ]
      },
      {
        text: "I make decisions based primarily on:",
        options: [
          { text: "What will achieve results most efficiently", color: "fiery-red" },
          { text: "What feels right and will engage others", color: "sunshine-yellow" },
          { text: "What will maintain harmony and support people", color: "earth-green" },
          { text: "What makes the most logical sense", color: "cool-blue" }
        ]
      },
      {
        text: "In social situations, I tend to be:",
        options: [
          { text: "Bold and direct with my opinions", color: "fiery-red" },
          { text: "Energetic and the center of attention", color: "sunshine-yellow" },
          { text: "Quiet and focused on others' needs", color: "earth-green" },
          { text: "Reserved and observant", color: "cool-blue" }
        ]
      },
      {
        text: "When implementing new ideas, I prefer to:",
        options: [
          { text: "Take immediate action and adjust as needed", color: "fiery-red" },
          { text: "Generate enthusiasm and involve others", color: "sunshine-yellow" },
          { text: "Make gradual changes with team input", color: "earth-green" },
          { text: "Plan thoroughly before starting", color: "cool-blue" }
        ]
      },
      {
        text: "When giving feedback, I tend to be:",
        options: [
          { text: "Direct and straightforward", color: "fiery-red" },
          { text: "Enthusiastic and encouraging", color: "sunshine-yellow" },
          { text: "Diplomatic and considerate", color: "earth-green" },
          { text: "Objective and specific", color: "cool-blue" }
        ]
      },
      {
        text: "At my best, I am known for being:",
        options: [
          { text: "Confident and achievement-oriented", color: "fiery-red" },
          { text: "Creative and inspirational", color: "sunshine-yellow" },
          { text: "Dependable and supportive", color: "earth-green" },
          { text: "Knowledgeable and precise", color: "cool-blue" }
        ]
      }
    ];
    
    questions.forEach(question => {
      const id = this.questionId++;
      const newQuestion = { ...question, id };
      this.quizQuestions.set(id, newQuestion);
    });
  }
}

export const storage = new MemStorage();
