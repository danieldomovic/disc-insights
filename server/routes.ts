import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertQuizResultSchema, insertUserSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import session from "express-session";
import MemoryStore from "memorystore";

// Interface to augment the Express Request type with user property
declare module "express-session" {
  interface SessionData {
    userId?: number;
    username?: string;
  }
}

// Auth middleware to check if user is logged in
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized - Please log in" });
  }
};

const answerSchema = z.object({
  questionId: z.number(),
  selectedColor: z.string()
});

const submissionSchema = z.object({
  answers: z.array(answerSchema)
});

export async function registerRoutes(app: Express): Promise<Server> {
  // User registration
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Hash password before storing
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user with hashed password
      const user = await storage.createUser({
        username: userData.username,
        password: hashedPassword
      });
      
      // Set user session
      req.session.userId = user.id;
      req.session.username = user.username;
      
      res.status(201).json({ 
        id: user.id, 
        username: user.username,
        message: "User registered successfully" 
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(400).json({ message: "Failed to register user" });
    }
  });
  
  // User login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Find user by username
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Set user session
      req.session.userId = user.id;
      req.session.username = user.username;
      
      res.json({ 
        id: user.id, 
        username: user.username,
        message: "Login successful" 
      });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(400).json({ message: "Failed to log in" });
    }
  });
  
  // User logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  
  // Get current user profile
  app.get("/api/auth/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId!);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        id: user.id,
        username: user.username
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });
  
  // Get quiz results for current user
  app.get("/api/profile/results", isAuthenticated, async (req, res) => {
    try {
      // Get all results for the current user
      const userId = req.session.userId!;
      const userResults = await storage.getQuizResultsByUserId(userId);
      
      // Transform results to include formatted data
      const formattedResults = userResults.map(result => ({
        id: result.id,
        scores: {
          "fiery-red": result.fieryRedScore,
          "sunshine-yellow": result.sunshineYellowScore,
          "earth-green": result.earthGreenScore,
          "cool-blue": result.coolBlueScore
        },
        dominantColor: result.dominantColor,
        secondaryColor: result.secondaryColor,
        personalityType: result.personalityType,
        createdAt: result.createdAt
      }));
      
      res.json(formattedResults);
    } catch (error) {
      console.error("Error fetching user results:", error);
      res.status(500).json({ message: "Failed to fetch user results" });
    }
  });
  
  // Get all quiz questions
  app.get("/api/quiz/questions", async (req, res) => {
    try {
      const questions = await storage.getAllQuizQuestions();
      res.json(questions);
    } catch (error) {
      console.error("Error fetching quiz questions:", error);
      res.status(500).json({ message: "Failed to fetch quiz questions" });
    }
  });

  // Submit quiz answers and get results
  app.post("/api/quiz/submit", async (req, res) => {
    try {
      const submission = submissionSchema.parse(req.body);
      
      // Count colors
      let fieryRedCount = 0;
      let sunshineYellowCount = 0;
      let earthGreenCount = 0;
      let coolBlueCount = 0;
      
      submission.answers.forEach(answer => {
        switch (answer.selectedColor) {
          case "fiery-red":
            fieryRedCount++;
            break;
          case "sunshine-yellow":
            sunshineYellowCount++;
            break;
          case "earth-green":
            earthGreenCount++;
            break;
          case "cool-blue":
            coolBlueCount++;
            break;
        }
      });
      
      // Calculate percentages
      const total = submission.answers.length;
      const fieryRedPercentage = Math.round((fieryRedCount / total) * 100);
      const sunshineYellowPercentage = Math.round((sunshineYellowCount / total) * 100);
      const earthGreenPercentage = Math.round((earthGreenCount / total) * 100);
      const coolBluePercentage = Math.round((coolBlueCount / total) * 100);
      
      // Find dominant and secondary colors
      const colorScores = [
        { color: "fiery-red", score: fieryRedPercentage },
        { color: "sunshine-yellow", score: sunshineYellowPercentage },
        { color: "earth-green", score: earthGreenPercentage },
        { color: "cool-blue", score: coolBluePercentage }
      ];
      
      colorScores.sort((a, b) => b.score - a.score);
      
      const dominantColor = colorScores[0].color;
      const secondaryColor = colorScores[1].color;
      
      // Determine personality type
      let personalityType = "Unknown";
      
      if (dominantColor === "fiery-red" && secondaryColor === "cool-blue") {
        personalityType = "Reformer";
      } else if (dominantColor === "cool-blue" && secondaryColor === "fiery-red") {
        personalityType = "Reformer";
      } else if (dominantColor === "cool-blue" && secondaryColor === "earth-green") {
        personalityType = "Coordinator";
      } else if (dominantColor === "earth-green" && secondaryColor === "cool-blue") {
        personalityType = "Coordinator";
      } else if (dominantColor === "sunshine-yellow" && secondaryColor === "earth-green") {
        personalityType = "Helper";
      } else if (dominantColor === "earth-green" && secondaryColor === "sunshine-yellow") {
        personalityType = "Helper";
      } else if (dominantColor === "fiery-red" && secondaryColor === "sunshine-yellow") {
        personalityType = "Motivator";
      } else if (dominantColor === "sunshine-yellow" && secondaryColor === "fiery-red") {
        personalityType = "Motivator";
      } else if (dominantColor === "fiery-red") {
        personalityType = "Director";
      } else if (dominantColor === "sunshine-yellow") {
        personalityType = "Inspirer";
      } else if (dominantColor === "earth-green") {
        personalityType = "Supporter";
      } else if (dominantColor === "cool-blue") {
        personalityType = "Observer";
      }
      
      // Save the result, associating with user if logged in
      const quizResult = await storage.createQuizResult({
        userId: req.session.userId || null,
        fieryRedScore: fieryRedPercentage,
        sunshineYellowScore: sunshineYellowPercentage,
        earthGreenScore: earthGreenPercentage,
        coolBlueScore: coolBluePercentage,
        dominantColor,
        secondaryColor,
        personalityType,
        createdAt: new Date().toISOString()
      });
      
      // Save individual answers
      for (const answer of submission.answers) {
        await storage.createQuizAnswer({
          resultId: quizResult.id,
          questionId: answer.questionId,
          selectedColor: answer.selectedColor
        });
      }
      
      // Return the result
      res.json({
        id: quizResult.id,
        scores: {
          "fiery-red": fieryRedPercentage,
          "sunshine-yellow": sunshineYellowPercentage,
          "earth-green": earthGreenPercentage,
          "cool-blue": coolBluePercentage
        },
        dominantColor,
        secondaryColor,
        personalityType
      });
    } catch (error) {
      console.error("Error processing quiz submission:", error);
      res.status(400).json({ message: "Invalid quiz submission" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
