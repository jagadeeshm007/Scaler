import type { Response } from 'express';

export interface ApiResponseData<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: unknown;
}

export class ApiResponse {
  static send<T>(res: Response, statusCode: number, message: string, data?: T): Response {
    return res.status(statusCode).json({
      success: statusCode >= 200 && statusCode < 300,
      message,
      data,
    });
  }

  static success<T>(res: Response, message = 'Success', data?: T): Response {
    return this.send(res, 200, message, data);
  }

  static created<T>(res: Response, message = 'Created successfully', data?: T): Response {
    return this.send(res, 201, message, data);
  }

  static error(res: Response, statusCode: number, message: string, error?: unknown): Response {
    return res.status(statusCode).json({
      success: false,
      message,
      error,
    });
  }
}
