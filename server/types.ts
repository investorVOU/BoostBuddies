// Session management types
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    isAdmin?: boolean;
  }
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: import('@shared/schema').User;
    }
  }
}

export {};