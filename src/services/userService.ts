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
  // Get all users
  async getUsers(): Promise<User[]> {
    console.log('🔄 Fetching users from /api/users');
    const response = await fetch('/api/users');
    console.log('📡 Response status:', response.status);
    
    const data = await response.json();
    console.log('📦 Response data:', data);
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch users');
    }
    
    return data.data;
  },

  // Create new user
  async createUser(userData: CreateUserData): Promise<User> {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create user');
    }
    
    return data.data;
  },

  // Update user
  async updateUser(userData: UpdateUserData): Promise<User> {
    const response = await fetch('/api/users', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update user');
    }
    
    return data.data;
  },

  // Delete user
  async deleteUser(userId: number): Promise<void> {
    const response = await fetch(`/api/users?id=${userId}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete user');
    }
  }
};
