import type { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { ApiResponse } from '../utils/api-response';
import { asyncHandler } from '../utils/async-handler';

export class UserController {
  static getMe = asyncHandler(async (req: Request, res: Response) => {
    const user = await UserService.getCurrentUser((req.user as { id: string; email: string }).id);
    return ApiResponse.success(res, 'User retrieved successfully', user);
  });

  static updateMe = asyncHandler(async (req: Request, res: Response) => {
    const user = await UserService.updateUser(
      (req.user as { id: string; email: string }).id,
      req.body,
    );
    return ApiResponse.success(res, 'User updated successfully', user);
  });
}
