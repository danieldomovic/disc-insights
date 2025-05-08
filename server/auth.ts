import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const PostgresSessionStore = connectPg(session);
  
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'insights-discovery-secret',
    resave: false,
    saveUninitialized: false,
    store: new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true,
      tableName: 'sessions'
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid username or password" });
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Registration route
  app.post("/api/register", async (req, res, next) => {
    try {
      const { email, username, password, fullName } = req.body;
      
      // Check if user already exists
      const existingUserByEmail = await storage.getUserByEmail(email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      const existingUserByUsername = await storage.getUserByUsername(username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // Create new user with hashed password
      const user = await storage.createUser({
        email,
        username,
        password: await hashPassword(password),
        fullName
      });

      // Log in the newly registered user
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json({ 
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: user.fullName
        });
      });
    } catch (error) {
      next(error);
    }
  });

  // Login route
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: SelectUser | false, info: { message?: string }) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Invalid credentials" });
      
      req.login(user, (err: any) => {
        if (err) return next(err);
        res.status(200).json({ 
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: user.fullName
        });
      });
    })(req, res, next);
  });

  // Logout route
  app.post("/api/logout", (req, res, next) => {
    req.logout((err: any) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Current user route
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    const user = req.user as SelectUser;
    res.json({ 
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName
    });
  });
}

// Middleware for protected routes
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
}

// Middleware for team leader authorization
export function requireTeamLeader(teamId: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const userId = (req.user as SelectUser).id;
    
    try {
      const isTeamLeader = await storage.isTeamLeader(userId, teamId);
      if (isTeamLeader) {
        return next();
      }
      return res.status(403).json({ message: "Forbidden: Team leader access required" });
    } catch (error) {
      next(error);
    }
  };
}

// Middleware for team member authorization
export function requireTeamMember(teamId: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const userId = (req.user as SelectUser).id;
    
    try {
      const isTeamMember = await storage.isTeamMember(userId, teamId);
      if (isTeamMember) {
        return next();
      }
      return res.status(403).json({ message: "Forbidden: Team member access required" });
    } catch (error) {
      next(error);
    }
  };
}

// Middleware for organization admin authorization
export function requireOrgAdmin(orgId: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const userId = (req.user as SelectUser).id;
    
    try {
      const isOrgAdmin = await storage.isOrganizationAdmin(userId, orgId);
      if (isOrgAdmin) {
        return next();
      }
      return res.status(403).json({ message: "Forbidden: Organization admin access required" });
    } catch (error) {
      next(error);
    }
  };
}