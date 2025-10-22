export interface User {
  id: number;
  username: string;
  name: string;
  role: string;
  created_at: string;
}

export interface CreateUserData {
  username: string;
  name: string;
  password: string;
  role: string;
}

export interface UpdateUserData {
  id: number;
  username?: string;
  name?: string;
  password?: string;
  role?: string;
}

export const userService = {
  // Get all users - simplified version
  async getUsers(): Promise<User[]> {
    // Simulate API call for now
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            username: 'admin',
            name: 'Administrator',
            role: 'admin',
            created_at: new Date().toISOString()
          }
        ]);
      }, 500);
    });
  },

  // Create new user - simplified version
  async createUser(userData: CreateUserData): Promise<User> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: Date.now(),
          username: userData.username,
          name: userData.name,
          role: userData.role,
          created_at: new Date().toISOString()
        });
      }, 1000);
    });
  },

  // Update user - simplified version
  async updateUser(userData: UpdateUserData): Promise<User> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: userData.id,
          username: userData.username || 'updated',
          name: userData.name || 'Updated User',
          role: userData.role || 'petugas',
          created_at: new Date().toISOString()
        });
      }, 1000);
    });
  },

  // Delete user - simplified version
  async deleteUser(userId: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });
  }
};
