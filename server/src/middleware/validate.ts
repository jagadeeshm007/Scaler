import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';
import { ApiResponse } from '../utils/api-response';
import { HTTP_STATUS, ERROR_CODE } from '../config/constants';

export const validate = (schema: ZodObject<any, any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Update request properties with parsed (and potentially transformed) data
      req.body = parsed.body;
      req.query = parsed.query as any;
      req.params = parsed.params as any;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((e: any) => ({
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
