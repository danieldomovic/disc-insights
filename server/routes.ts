import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertQuizResultSchema } from "@shared/schema";
import { setupAuth, requireAuth } from "./auth";
import { log } from "./vite";

const answerSchema = z.object({
  questionId: z.number(),
  selectedColor: z.string(),
  rating: z.string() // L, 1, 2, 3, 4, 5, or M
});

const submissionSchema = z.object({
  answers: z.array(answerSchema)
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  
  // Forgot username endpoint
  app.post("/api/forgot-username", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      const user = await storage.getUserByEmail(email);
      
      // For security, always return a success response even if no user is found
      // This prevents user enumeration attacks
      
      if (user) {
        // In a real implementation, this would send an email with the user's username
        log(`Username recovery email would be sent to ${email} with username: ${user.username}`, "auth");
        
        // If SendGrid was set up:
        // await sendEmail(process.env.SENDGRID_API_KEY, {
        //   to: email,
        //   from: "support@insightsdiscovery.com",
        //   subject: "Your Username Recovery",
        //   text: `Hello ${user.fullName},\n\nYour username is: ${user.username}\n\nIf you did not request this, please ignore this email.`,
        //   html: `<p>Hello ${user.fullName},</p><p>Your username is: <strong>${user.username}</strong></p><p>If you did not request this, please ignore this email.</p>`
        // });
      } else {
        log(`Username recovery requested for email: ${email}, but no user was found`, "auth");
      }
      
      res.json({ success: true, message: "If an account exists with that email, we've sent the username to that address." });
    } catch (error) {
      console.error("Error processing username recovery:", error);
      res.status(500).json({ message: "Failed to process username recovery request" });
    }
  });
  
  // User results endpoints
  app.get("/api/user/results", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const results = await storage.getUserQuizResults(userId);
      res.json(results.map(result => ({
        id: result.id,
        createdAt: result.createdAt,
        scores: {
          "fiery-red": result.fieryRedScore,
          "sunshine-yellow": result.sunshineYellowScore,
          "earth-green": result.earthGreenScore,
          "cool-blue": result.coolBlueScore
        },
        dominantColor: result.dominantColor,
        secondaryColor: result.secondaryColor,
        personalityType: result.personalityType,
        title: result.title
      })));
    } catch (error) {
      console.error("Error fetching user results:", error);
      res.status(500).json({ message: "Failed to fetch user results" });
    }
  });
  
  // Delete a quiz result
  app.delete("/api/user/results/:id", requireAuth, async (req, res) => {
    try {
      const resultId = parseInt(req.params.id, 10);
      if (isNaN(resultId)) {
        return res.status(400).json({ message: "Invalid result ID" });
      }
      
      const userId = req.user!.id;
      const result = await storage.getQuizResult(resultId);
      
      if (!result) {
        return res.status(404).json({ message: "Quiz result not found" });
      }
      
      // Verify that the result belongs to the user
      if (result.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to delete this result" });
      }
      
      // Check if the result is referenced in any comparisons
      const userComparisons = await storage.getUserReportComparisons(userId);
      const isUsedInComparison = userComparisons.some(
        comparison => comparison.reportAId === resultId || comparison.reportBId === resultId
      );
      
      if (isUsedInComparison) {
        return res.status(400).json({ 
          message: "This result is used in one or more comparisons. Please delete those comparisons first." 
        });
      }
      
      // Delete all answers associated with this result
      await storage.deleteQuizAnswersByResultId(resultId);
      
      // Delete the result
      await storage.deleteQuizResult(resultId);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting quiz result:", error);
      res.status(500).json({ message: "Failed to delete quiz result" });
    }
  });
  
  // Team management endpoints
  app.post("/api/teams", requireAuth, async (req, res) => {
    try {
      const { name, description } = req.body;
      const userId = req.user!.id;
      
      const team = await storage.createTeam({
        name,
        description,
        createdById: userId,
        organizationId: null
      });
      
      res.status(201).json(team);
    } catch (error) {
      console.error("Error creating team:", error);
      res.status(500).json({ message: "Failed to create team" });
    }
  });
  
  app.get("/api/teams", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const teams = await storage.getUserTeams(userId);
      res.json(teams);
    } catch (error) {
      console.error("Error fetching teams:", error);
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });
  
  app.get("/api/teams/:id", requireAuth, async (req, res) => {
    try {
      const teamId = parseInt(req.params.id, 10);
      if (isNaN(teamId)) {
        return res.status(400).json({ message: "Invalid team ID" });
      }
      
      const userId = req.user!.id;
      const isMember = await storage.isTeamMember(userId, teamId);
      
      if (!isMember) {
        return res.status(403).json({ message: "Not a member of this team" });
      }
      
      const team = await storage.getTeam(teamId);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      const members = await storage.getTeamMembers(teamId);
      
      res.json({
        ...team,
        members: members.map(m => ({
          id: m.id,
          userId: m.userId,
          isLeader: m.isLeader
        }))
      });
    } catch (error) {
      console.error("Error fetching team:", error);
      res.status(500).json({ message: "Failed to fetch team" });
    }
  });
  
  // Generate team invite link
  app.post("/api/teams/:id/invite", requireAuth, async (req, res) => {
    try {
      const teamId = parseInt(req.params.id, 10);
      if (isNaN(teamId)) {
        return res.status(400).json({ message: "Invalid team ID" });
      }
      
      const userId = req.user!.id;
      const isLeader = await storage.isTeamLeader(userId, teamId);
      
      if (!isLeader) {
        return res.status(403).json({ message: "Only team leaders can generate invite links" });
      }
      
      // Generate a random token for the invite
      const inviteToken = Math.random().toString(36).substring(2, 15) + 
                         Math.random().toString(36).substring(2, 15);
      
      // In a real implementation, you would store this token in the database
      // For this implementation, we'll just return it
      // In production, you'd want to add an expiration date and other security measures
      
      res.json({ inviteToken });
    } catch (error) {
      console.error("Error generating team invite:", error);
      res.status(500).json({ message: "Failed to generate team invite" });
    }
  });
  
  // Handle team join via invite
  app.get("/api/teams/join/:token", requireAuth, async (req, res) => {
    try {
      const { token } = req.params;
      const userId = req.user!.id;
      
      // In a real implementation, you would validate the token and get the team ID
      // For this implementation, we'll handle it in the frontend
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error joining team:", error);
      res.status(500).json({ message: "Failed to join team" });
    }
  });

  app.post("/api/teams/:id/members", requireAuth, async (req, res) => {
    try {
      const teamId = parseInt(req.params.id, 10);
      if (isNaN(teamId)) {
        return res.status(400).json({ message: "Invalid team ID" });
      }
      
      const userId = req.user!.id;
      const isLeader = await storage.isTeamLeader(userId, teamId);
      
      if (!isLeader) {
        return res.status(403).json({ message: "Only team leaders can add members" });
      }
      
      const { userEmail } = req.body;
      if (!userEmail) {
        return res.status(400).json({ message: "User email is required" });
      }
      
      const userToAdd = await storage.getUserByEmail(userEmail);
      if (!userToAdd) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user is already a member
      const isAlreadyMember = await storage.isTeamMember(userToAdd.id, teamId);
      if (isAlreadyMember) {
        return res.status(400).json({ message: "User is already a member of this team" });
      }
      
      const member = await storage.addTeamMember({
        teamId,
        userId: userToAdd.id,
        isLeader: false
      });
      
      res.status(201).json(member);
    } catch (error) {
      console.error("Error adding team member:", error);
      res.status(500).json({ message: "Failed to add team member" });
    }
  });
  
  // Report comparison endpoints
  app.post("/api/comparisons", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { reportAId, reportBId, title } = req.body;
      
      if (!reportAId || !reportBId) {
        return res.status(400).json({ message: "Two report IDs are required" });
      }
      
      // Verify both reports belong to the user
      const reportA = await storage.getQuizResult(reportAId);
      const reportB = await storage.getQuizResult(reportBId);
      
      if (!reportA || !reportB || reportA.userId !== userId || reportB.userId !== userId) {
        return res.status(403).json({ message: "Cannot compare reports you don't own" });
      }
      
      const comparison = await storage.createReportComparison({
        userId,
        reportAId,
        reportBId,
        title: title || `Comparison of Reports ${reportAId} and ${reportBId}`
      });
      
      res.status(201).json(comparison);
    } catch (error) {
      console.error("Error creating comparison:", error);
      res.status(500).json({ message: "Failed to create comparison" });
    }
  });
  
  app.get("/api/comparisons", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const comparisons = await storage.getUserReportComparisons(userId);
      res.json(comparisons);
    } catch (error) {
      console.error("Error fetching comparisons:", error);
      res.status(500).json({ message: "Failed to fetch comparisons" });
    }
  });
  
  app.get("/api/comparisons/:id", requireAuth, async (req, res) => {
    try {
      const comparisonId = parseInt(req.params.id, 10);
      if (isNaN(comparisonId)) {
        return res.status(400).json({ message: "Invalid comparison ID" });
      }
      
      const userId = req.user!.id;
      const comparison = await storage.getReportComparison(comparisonId);
      
      if (!comparison || comparison.userId !== userId) {
        return res.status(404).json({ message: "Comparison not found" });
      }
      
      const reportA = await storage.getQuizResult(comparison.reportAId);
      const reportB = await storage.getQuizResult(comparison.reportBId);
      
      if (!reportA || !reportB) {
        return res.status(404).json({ message: "One or both reports not found" });
      }
      
      res.json({
        id: comparison.id,
        title: comparison.title,
        createdAt: comparison.createdAt,
        reportA: {
          id: reportA.id,
          scores: {
            "fiery-red": reportA.fieryRedScore,
            "sunshine-yellow": reportA.sunshineYellowScore,
            "earth-green": reportA.earthGreenScore,
            "cool-blue": reportA.coolBlueScore
          },
          dominantColor: reportA.dominantColor,
          secondaryColor: reportA.secondaryColor,
          personalityType: reportA.personalityType,
          title: reportA.title
        },
        reportB: {
          id: reportB.id,
          scores: {
            "fiery-red": reportB.fieryRedScore,
            "sunshine-yellow": reportB.sunshineYellowScore,
            "earth-green": reportB.earthGreenScore,
            "cool-blue": reportB.coolBlueScore
          },
          dominantColor: reportB.dominantColor,
          secondaryColor: reportB.secondaryColor,
          personalityType: reportB.personalityType,
          title: reportB.title
        }
      });
    } catch (error) {
      console.error("Error fetching comparison:", error);
      res.status(500).json({ message: "Failed to fetch comparison" });
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
        userId: req.isAuthenticated() ? req.user.id : null,
        fieryRedScore: fieryRedPercentage,
        sunshineYellowScore: sunshineYellowPercentage,
        earthGreenScore: earthGreenPercentage,
        coolBlueScore: coolBluePercentage,
        dominantColor,
        secondaryColor,
        personalityType,
        title: "Latest Quiz Result"
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
