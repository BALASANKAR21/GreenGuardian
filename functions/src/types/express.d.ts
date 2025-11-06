import { Router } from 'express';
import { RateLimit } from 'express-rate-limit';

declare module 'express' {
  export interface Router {
    get(
      path: string,
      ...handlers: Array<express.RequestHandler | RateLimit>
    ): this;
    post(
      path: string,
      ...handlers: Array<express.RequestHandler | RateLimit>
    ): this;
    put(
      path: string,
      ...handlers: Array<express.RequestHandler | RateLimit>
    ): this;
    delete(
      path: string,
      ...handlers: Array<express.RequestHandler | RateLimit>
    ): this;
  }
}