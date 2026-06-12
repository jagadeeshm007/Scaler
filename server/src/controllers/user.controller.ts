import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { ApiResponse } from '../utils/api-response';
import { UserService } from '../services/user.service';

export class UserController {
  static getMe = asyncHandler(async (req: Request, res: Response) => {
    const user = await UserService.getCurrentUser(req.user!.id);
    return ApiResponse.success(res, 'User retrieved successfully', user);
  });

  static updateMe = asyncHandler(async (req: Request, res: Response) => {
    const user = await UserService.updateUser(req.user!.id, req.body);
    return ApiResponse.success(res, 'User updated successfully', user);
  });
}
