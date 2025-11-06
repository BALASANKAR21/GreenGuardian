import type { NextFunction, Request, Response } from "express";

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const status =
    typeof err?.status === "number" && err.status >= 400 ? err.status : 500;
  const message =
    typeof err?.message === "string" && err.message.length > 0
      ? err.message
      : "Internal Server Error";
  // Minimal logging
  console.error("[error]", { status, message, stack: err?.stack });
  res.status(status).json({ error: message });
}
