// abstracting Zod validation
import type { RequestHandler } from "express";
import type { ZodType } from "zod";

export const validateBody = (
  schema: ZodType,
): RequestHandler => {
  return (req, _res, next) => {
    req.body = schema.parse(req.body);
    next();
  };
};

export const validateQuery = <T>(
  schema: ZodType<T>,
): RequestHandler => {
  return (req, res, next) => {
    res.locals.query = schema.parse(req.query);

    next();
  };
};