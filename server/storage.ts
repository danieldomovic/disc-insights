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
    const result: QuizResult = { ...insertResult, id };
    this.quizResults.set(id, result);
    return result;
  }
  
  async getQuizResult(id: number): Promise<QuizResult | undefined> {
    return this.quizResults.get(id);
  }
  
  async createQuizAnswer(insertAnswer: InsertQuizAnswer): Promise<QuizAnswer> {
    const id = this.answerId++;
    const answer: QuizAnswer = { ...insertAnswer, id };
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
        text: "When making decisions, I typically:",
        options: [
          { text: "Act quickly and decisively", color: "fiery-red" },
          { text: "Consider all exciting possibilities", color: "sunshine-yellow" },
          { text: "Think about how it affects everyone involved", color: "earth-green" },
          { text: "Analyze all information carefully", color: "cool-blue" }
        ]
      },
      {
        text: "In meetings, I am most likely to:",
        options: [
          { text: "Get straight to the point", color: "fiery-red" },
          { text: "Generate enthusiasm and new ideas", color: "sunshine-yellow" },
          { text: "Ensure everyone has a chance to speak", color: "earth-green" },
          { text: "Ensure discussions are based on facts", color: "cool-blue" }
        ]
      },
      {
        text: "When faced with a problem, my first instinct is to:",
        options: [
          { text: "Take immediate action to solve it", color: "fiery-red" },
          { text: "Brainstorm multiple creative solutions", color: "sunshine-yellow" },
          { text: "Discuss it with others to get their perspective", color: "earth-green" },
          { text: "Gather all relevant information first", color: "cool-blue" }
        ]
      },
      {
        text: "I feel most energized when:",
        options: [
          { text: "Accomplishing tasks and seeing results", color: "fiery-red" },
          { text: "Engaging with others and sharing ideas", color: "sunshine-yellow" },
          { text: "Supporting others and building harmony", color: "earth-green" },
          { text: "Developing expertise and solving complex problems", color: "cool-blue" }
        ]
      },
      {
        text: "Under pressure, I tend to:",
        options: [
          { text: "Become more direct and demanding", color: "fiery-red" },
          { text: "Talk more and express my frustrations openly", color: "sunshine-yellow" },
          { text: "Become quiet and try to accommodate others", color: "earth-green" },
          { text: "Withdraw and focus on analyzing the situation", color: "cool-blue" }
        ]
      },
      {
        text: "My workspace is usually:",
        options: [
          { text: "Functional and organized for efficiency", color: "fiery-red" },
          { text: "Vibrant with personal touches and inspiration", color: "sunshine-yellow" },
          { text: "Comfortable and decorated with personal mementos", color: "earth-green" },
          { text: "Neat, organized and systematically arranged", color: "cool-blue" }
        ]
      },
      {
        text: "When communicating, I prefer to:",
        options: [
          { text: "Be brief, direct and to the point", color: "fiery-red" },
          { text: "Be expressive, enthusiastic and engaging", color: "sunshine-yellow" },
          { text: "Be supportive, thoughtful and considerate", color: "earth-green" },
          { text: "Be precise, detailed and logical", color: "cool-blue" }
        ]
      },
      {
        text: "I value projects that:",
        options: [
          { text: "Have clear objectives and deliver results", color: "fiery-red" },
          { text: "Involve collaboration and creative thinking", color: "sunshine-yellow" },
          { text: "Help people and improve relationships", color: "earth-green" },
          { text: "Require careful analysis and systematic approach", color: "cool-blue" }
        ]
      },
      {
        text: "When working with others, I appreciate those who:",
        options: [
          { text: "Are decisive and get things done", color: "fiery-red" },
          { text: "Are energetic and generate enthusiasm", color: "sunshine-yellow" },
          { text: "Consider everyone's feelings and needs", color: "earth-green" },
          { text: "Provide thorough, accurate information", color: "cool-blue" }
        ]
      },
      {
        text: "My contribution to a team is often:",
        options: [
          { text: "Providing direction and making things happen", color: "fiery-red" },
          { text: "Bringing energy and inspiring others", color: "sunshine-yellow" },
          { text: "Creating harmony and supporting team members", color: "earth-green" },
          { text: "Ensuring accuracy and attention to detail", color: "cool-blue" }
        ]
      },
      {
        text: "I find it most difficult to work with people who are:",
        options: [
          { text: "Indecisive or too slow to act", color: "fiery-red" },
          { text: "Too serious or don't show enthusiasm", color: "sunshine-yellow" },
          { text: "Insensitive or overly confrontational", color: "earth-green" },
          { text: "Disorganized or don't follow proper procedures", color: "cool-blue" }
        ]
      },
      {
        text: "When receiving feedback, I prefer it to be:",
        options: [
          { text: "Direct, straightforward and to the point", color: "fiery-red" },
          { text: "Positive, enthusiastic and motivating", color: "sunshine-yellow" },
          { text: "Gentle, supportive and considerate", color: "earth-green" },
          { text: "Detailed, specific and fact-based", color: "cool-blue" }
        ]
      },
      {
        text: "When learning something new, I prefer to:",
        options: [
          { text: "Jump in and learn by doing it", color: "fiery-red" },
          { text: "Explore different approaches with others", color: "sunshine-yellow" },
          { text: "Have a trusted guide show me step by step", color: "earth-green" },
          { text: "Study the instructions and theory first", color: "cool-blue" }
        ]
      },
      {
        text: "When faced with change, I typically:",
        options: [
          { text: "Take charge and make it happen", color: "fiery-red" },
          { text: "Get excited about new possibilities", color: "sunshine-yellow" },
          { text: "Consider how it affects everyone involved", color: "earth-green" },
          { text: "Analyze the situation before proceeding", color: "cool-blue" }
        ]
      },
      {
        text: "I am most productive when:",
        options: [
          { text: "I can focus on achieving clear goals", color: "fiery-red" },
          { text: "I'm in a dynamic, stimulating environment", color: "sunshine-yellow" },
          { text: "I'm in a supportive, harmonious team", color: "earth-green" },
          { text: "I can work methodically without interruptions", color: "cool-blue" }
        ]
      },
      {
        text: "My email communication style tends to be:",
        options: [
          { text: "Brief and to the point", color: "fiery-red" },
          { text: "Friendly and conversational", color: "sunshine-yellow" },
          { text: "Warm and considerate", color: "earth-green" },
          { text: "Formal and precisely worded", color: "cool-blue" }
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
        text: "In conflicts, I tend to:",
        options: [
          { text: "Address issues directly and move forward", color: "fiery-red" },
          { text: "Use humor to diffuse tension", color: "sunshine-yellow" },
          { text: "Seek compromise and restore harmony", color: "earth-green" },
          { text: "Analyze the situation objectively", color: "cool-blue" }
        ]
      },
      {
        text: "When planning my day, I usually:",
        options: [
          { text: "Focus on key priorities and outcomes", color: "fiery-red" },
          { text: "Leave room for spontaneity and new opportunities", color: "sunshine-yellow" },
          { text: "Consider how I can help others", color: "earth-green" },
          { text: "Create a detailed schedule and follow it", color: "cool-blue" }
        ]
      },
      {
        text: "I prefer managers who:",
        options: [
          { text: "Set clear expectations and give direct feedback", color: "fiery-red" },
          { text: "Are enthusiastic and recognize achievements publicly", color: "sunshine-yellow" },
          { text: "Are supportive and create a positive environment", color: "earth-green" },
          { text: "Provide thorough instructions and logical reasoning", color: "cool-blue" }
        ]
      },
      {
        text: "When explaining something to others, I tend to:",
        options: [
          { text: "Be concise and focus on what needs to be done", color: "fiery-red" },
          { text: "Be animated and use stories or analogies", color: "sunshine-yellow" },
          { text: "Be patient and check for understanding", color: "earth-green" },
          { text: "Be precise and provide complete information", color: "cool-blue" }
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
        text: "I feel most stressed when:",
        options: [
          { text: "Progress is too slow or I'm not in control", color: "fiery-red" },
          { text: "Things are boring or I feel restricted", color: "sunshine-yellow" },
          { text: "There is conflict or people are being inconsiderate", color: "earth-green" },
          { text: "Things are disorganized or procedures aren't followed", color: "cool-blue" }
        ]
      },
      {
        text: "My ideal work environment is:",
        options: [
          { text: "Fast-paced with clear objectives", color: "fiery-red" },
          { text: "Creative with opportunities for interaction", color: "sunshine-yellow" },
          { text: "Collaborative with a friendly atmosphere", color: "earth-green" },
          { text: "Structured with time for focused work", color: "cool-blue" }
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
