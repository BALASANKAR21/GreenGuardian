import 'express';

declare module 'express' {
  interface Request {
    body?: any;
    query?: any;
    user?: { uid: string; email?: string };
  }
}
