export interface UserInput {
  email: string;
  password: string;
  name: string;
  role?: 'user' | 'admin';
}

export interface UserDocument extends UserInput {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserUpdateInput = Partial<Omit<UserInput, 'password'>>;