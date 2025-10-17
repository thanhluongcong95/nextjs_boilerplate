import { mockUsers, simulateDelay } from '@/app/(public)/login/api/mock-data';

import type {
  TCreateUserPayload,
  TUpdateUserPayload,
  TUser,
  TUserListResponse,
} from '../model/users.schemas';
import { createUserPayloadSchema, updateUserPayloadSchema } from '../model/users.schemas';

// Mock database (in-memory)
const usersDatabase = [...mockUsers];

export const userService = {
  async getAll(params: { page?: number; pageSize?: number; keyword?: string } = {}) {
    // Mock implementation
    await simulateDelay(300);

    const { page = 1, pageSize = 10, keyword = '' } = params;

    // Filter by keyword
    let filteredUsers = usersDatabase;
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      filteredUsers = usersDatabase.filter(
        user =>
          user.name.toLowerCase().includes(lowerKeyword) ||
          user.email.toLowerCase().includes(lowerKeyword)
      );
    }

    // Pagination
    const total = filteredUsers.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const items = filteredUsers.slice(startIndex, endIndex);

    return {
      items,
      total,
      page,
      pageSize,
    } as TUserListResponse;
  },

  async getById(id: string) {
    // Mock implementation
    await simulateDelay(200);

    const user = usersDatabase.find(u => u.id === id);
    if (!user) {
      throw new Error('Không tìm thấy user');
    }

    return user as TUser;
  },

  async create(payload: TCreateUserPayload) {
    // Mock implementation
    await simulateDelay(400);

    const validPayload = createUserPayloadSchema.parse(payload);

    // Check duplicate email
    if (usersDatabase.some(u => u.email === validPayload.email)) {
      throw new Error('Email đã tồn tại');
    }

    // Create new user
    const newUser = {
      id: String(usersDatabase.length + 1),
      ...validPayload,
      createdAt: new Date().toISOString(),
    };

    usersDatabase.push(newUser);

    return newUser as TUser;
  },

  async update(id: string, payload: TUpdateUserPayload) {
    // Mock implementation
    await simulateDelay(300);

    const validPayload = updateUserPayloadSchema.parse(payload);
    const userIndex = usersDatabase.findIndex(u => u.id === id);

    if (userIndex === -1) {
      throw new Error('Không tìm thấy user');
    }

    // Check duplicate email if email is being changed
    if (validPayload.email && validPayload.email !== usersDatabase[userIndex].email) {
      if (usersDatabase.some(u => u.email === validPayload.email)) {
        throw new Error('Email đã tồn tại');
      }
    }

    // Update user
    usersDatabase[userIndex] = {
      ...usersDatabase[userIndex],
      ...validPayload,
    };

    return usersDatabase[userIndex] as TUser;
  },

  async delete(id: string) {
    // Mock implementation
    await simulateDelay(200);

    const userIndex = usersDatabase.findIndex(u => u.id === id);

    if (userIndex === -1) {
      throw new Error('Không tìm thấy user');
    }

    // Remove user
    usersDatabase.splice(userIndex, 1);
  },
};
