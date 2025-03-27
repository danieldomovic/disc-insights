import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertQuizResultSchema } from "@shared/schema";

const answerSchema = z.object({
  questionId: z.number(),
  selectedColor: z.string(),
  rating: z.string() // L, 1, 2, 3, 4, 5, or M
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
  
  // Get quiz results by ID
  app.get("/api/quiz/results/:id", async (req, res) => {
    try {
      const resultId = parseInt(req.params.id, 10);
      if (isNaN(resultId)) {
        return res.status(400).json({ message: "Invalid result ID" });
      }
      
      const result = await storage.getQuizResult(resultId);
      if (!result) {
        return res.status(404).json({ message: "Quiz result not found" });
      }
      
      // Return the formatted result
      res.json({
        id: result.id,
        scores: {
          "fiery-red": result.fieryRedScore,
          "sunshine-yellow": result.sunshineYellowScore,
          "earth-green": result.earthGreenScore,
          "cool-blue": result.coolBlueScore
        },
        dominantColor: result.dominantColor,
        secondaryColor: result.secondaryColor,
        personalityType: result.personalityType
      });
    } catch (error) {
      console.error("Error fetching quiz result:", error);
      res.status(500).json({ message: "Failed to fetch quiz result" });
    }
  });

  // Submit quiz answers and get results
  app.post("/api/quiz/submit", async (req, res) => {
    try {
      const submission = submissionSchema.parse(req.body);
      
      // Initialize color scores
      let fieryRedScore = 0;
      let sunshineYellowScore = 0;
      let earthGreenScore = 0;
      let coolBlueScore = 0;
      
      // Calculate scores using the ratings
      submission.answers.forEach(answer => {
        // Convert rating to numeric value
        let ratingValue = 0;
        switch (answer.rating) {
          case 'L': ratingValue = 1; break;
          case '1': ratingValue = 2; break;
          case '2': ratingValue = 3; break;
          case '3': ratingValue = 4; break;
          case '4': ratingValue = 5; break;
          case '5': ratingValue = 6; break;
          case 'M': ratingValue = 7; break;
          default: ratingValue = 0;
        }
        
        // Add the weighted score to the appropriate color
        switch (answer.selectedColor) {
          case "fiery-red":
            fieryRedScore += ratingValue;
            break;
          case "sunshine-yellow":
            sunshineYellowScore += ratingValue;
            break;
          case "earth-green":
            earthGreenScore += ratingValue;
            break;
          case "cool-blue":
            coolBlueScore += ratingValue;
            break;
        }
      });
      
      // Calculate total score
      const totalScore = fieryRedScore + sunshineYellowScore + earthGreenScore + coolBlueScore;
      
      // Calculate percentages
      const fieryRedPercentage = Math.round((fieryRedScore / totalScore) * 100);
      const sunshineYellowPercentage = Math.round((sunshineYellowScore / totalScore) * 100);
      const earthGreenPercentage = Math.round((earthGreenScore / totalScore) * 100);
      const coolBluePercentage = Math.round((coolBlueScore / totalScore) * 100);
      
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
          selectedColor: answer.selectedColor,
          rating: answer.rating
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
