import type { UpdateUserInput, UpdateUserSettingsInput } from '@scaler/types';
import { ERROR_CODE, HTTP_STATUS } from '../config/constants';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/app-error';

export class UserService {
  static async getCurrentUser(userId: string): Promise<unknown> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { settings: true },
    });

    if (!user || user.deleted_at) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, ERROR_CODE.NOT_FOUND);
    }

    const safeUser = { ...user };
    delete (safeUser as { password_hash?: string }).password_hash;
    return safeUser;
  }

  static async updateUser(userId: string, data: UpdateUserInput): Promise<unknown> {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });

    const safeUser = { ...user };
    delete (safeUser as { password_hash?: string }).password_hash;
    return safeUser;
  }
  static async updateUserSettings(userId: string, data: UpdateUserSettingsInput): Promise<unknown> {
    const settings = await prisma.userSettings.upsert({
      where: { user_id: userId },
      update: data,
      create: {
        user_id: userId,
        ...data,
      },
    });
    return settings;
  }
}
