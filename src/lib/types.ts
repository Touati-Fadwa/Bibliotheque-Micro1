
export type UserRole = "admin" | "student";

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  email: string;
  studentId?: string;
  department?: string;
  createdAt: Date;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  available: boolean;
  coverImage?: string;
  description?: string;
  returnDate?: Date;
  borrowedBy?: string;
}
