import { ZodError } from 'zod';

import type { Request, Response, NextFunction } from 'express';
import type { ZodObject } from 'zod';
import { HTTP_STATUS, ERROR_CODE } from '../config/constants';
import { ApiResponse } from '../utils/api-response';

export const validate = (schema: ZodObject<import('zod').ZodRawShape>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Update request properties safely for Express 5 getters
      if (parsed.body !== undefined) {
        req.body = parsed.body;
      }

      // Only replace query/params when the schema defines them — otherwise Express
      // route params (e.g. :id) would be wiped and PATCH/PUT handlers receive undefined ids.
      if (parsed.query !== undefined) {
        for (const key of Object.keys(req.query)) {
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- Express 5 query is getter-backed; keys must be cleared before assign
          delete req.query[key as keyof typeof req.query];
        }
        Object.assign(req.query, parsed.query);
      }

      if (parsed.params !== undefined) {
        for (const key of Object.keys(req.params)) {
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- Express 5 params is getter-backed; keys must be cleared before assign
          delete req.params[key];
        }
        Object.assign(req.params, parsed.params);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((e: import('zod').ZodIssue) => ({
          field: e.path.join('.'),
          message: e.message,
        }));

        return ApiResponse.error(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, 'Validation failed', {
          code: ERROR_CODE.VALIDATION_ERROR,
          errors: formattedErrors,
        });
      }
      next(error);
    }
  };
};
