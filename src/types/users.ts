export interface CreateUserPayload {
  id: string;
  email: string;
  fullName: string;
  role: string;
  password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  fullName?: string;
  role?: string;
}
