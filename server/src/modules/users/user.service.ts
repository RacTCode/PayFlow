import { prisma } from "../../config/database.js";
import { AppError } from "../../utils/app-error.js";

import type { UpdateUserInput } from "./user.schema.js";

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
};

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: publicUserSelect,
  });

  if (!user) {
    throw new AppError(
      "User not found",
      404,
      "USER_NOT_FOUND",
    );
  }

  return user;
}

export async function updateUser(
  userId: string,
  input: UpdateUserInput,
) {
  if (input.email) {
    const existingUser =
      await prisma.user.findFirst({
        where: {
          email: input.email,
          NOT: {
            id: userId,
          },
        },
        select: {
          id: true,
        },
      });

    if (existingUser) {
      throw new AppError(
        "An account with this email already exists",
        409,
        "EMAIL_ALREADY_EXISTS",
      );
    }
  }

  return prisma.user.update({
    where: {
      id: userId,
    },

    data: {
      ...(input.name !== undefined
        ? { name: input.name }
        : {}),

      ...(input.email !== undefined
        ? { email: input.email }
        : {}),
    },

    select: publicUserSelect,
  });
}