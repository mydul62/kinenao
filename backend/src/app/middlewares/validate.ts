import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = (await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })) as any;
      // Replace properties with parsed/validated versions
      if (parsed.body) {
        req.body = parsed.body;
      }
      if (parsed.query) {
        Object.keys(req.query).forEach((key) => delete req.query[key]);
        Object.assign(req.query, parsed.query);
      }
      if (parsed.params) {
        Object.keys(req.params).forEach((key) => delete req.params[key]);
        Object.assign(req.params, parsed.params);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((err: any) => ({
          field: err.path.slice(1).join("."), // removes 'body', 'query', etc. prefix
          message: err.message,
        }));
        res.status(400).json({
          status: "fail",
          message: "Validation failed",
          errors: formattedErrors,
        });
        return;
      }
      next(error);
    }
  };
};
