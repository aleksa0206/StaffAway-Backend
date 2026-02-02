export type UserDb = {
  id: number;
  email: string;
  name: string | null;
  password_hash: string;
  created_at?: string;
};

export type CreateUserDb = {
  email: string;
  name?: string | null;
  password_hash: string;
};
