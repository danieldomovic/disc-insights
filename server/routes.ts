import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertQuizResultSchema } from "@shared/schema";

const answerSchema = z.object({
  questionId: z.number(),
  selectedColor: z.string()
});

const submissionSchema = z.object({
  answers: z.array(answerSchema)
});

export async function registerRoutes(app: Express): Promise<Server> {
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
      
      // Save the result
      const quizResult = await storage.createQuizResult({
        userId: null,
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
