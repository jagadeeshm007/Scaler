import { Response } from 'express';

export interface ApiResponseData<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}

export class ApiResponse {
  static send<T>(res: Response, statusCode: number, message: string, data?: T) {
    return res.status(statusCode).json({
      success: statusCode >= 200 && statusCode < 300,
      message,
      data,
    });
  }

  static success<T>(res: Response, message: string = 'Success', data?: T) {
    return this.send(res, 200, message, data);
  }

  static created<T>(res: Response, message: string = 'Created successfully', data?: T) {
    return this.send(res, 201, message, data);
  }

  static error(res: Response, statusCode: number, message: string, error?: any) {
    return res.status(statusCode).json({
      success: false,
      message,
      error,
    });
  }
}
