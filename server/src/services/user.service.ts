import type { Prisma } from '@prisma/client';
import type { UpdateUserInput, UpdateUserSettingsInput } from '@scaler/types';
import { ERROR_CODE, HTTP_STATUS } from '../config/constants';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/app-error';

function toUserSettingsUpdateData(data: UpdateUserSettingsInput): Prisma.UserSettingsUpdateInput {
  const updateData: Prisma.UserSettingsUpdateInput = {};

  if (data.theme !== undefined) {
    updateData.theme = data.theme;
  }
  if (data.brand_colors_enabled !== undefined) {
    updateData.brand_colors_enabled = data.brand_colors_enabled;
  }
  if (data.brand_color_light !== undefined) {
    updateData.brand_color_light = data.brand_color_light;
  }
  if (data.brand_color_dark !== undefined) {
    updateData.brand_color_dark = data.brand_color_dark;
  }

  return updateData;
}

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
    const updateData = toUserSettingsUpdateData(data);

    const settings = await prisma.userSettings.upsert({
      where: { user_id: userId },
      update: updateData,
      create: {
        user_id: userId,
        theme: data.theme ?? 'system',
        brand_colors_enabled: data.brand_colors_enabled ?? false,
        brand_color_light: data.brand_color_light ?? '#111111',
        brand_color_dark: data.brand_color_dark ?? '#fafafa',
      },
    });
    return settings;
  }
}
