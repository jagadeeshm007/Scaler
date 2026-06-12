import { prisma } from '../lib/prisma';
import { AppError } from '../utils/app-error';
import { ERROR_CODE, HTTP_STATUS } from '../config/constants';
import { UpdateUserInput } from '@scaler/types';

export class UserService {
  static async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.deleted_at) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, ERROR_CODE.NOT_FOUND);
    }

    const { password_hash, ...safeUser } = user;
    return safeUser;
  }

  static async updateUser(userId: string, data: UpdateUserInput) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });

    const { password_hash, ...safeUser } = user;
    return safeUser;
  }
}
