
import { Book, User } from "./types";

// Admin credentials (fixed for now)
export const adminUser: User = {
  id: "admin-1",
  username: "admin",
  password: "admin123",
  role: "admin",
  firstName: "Admin",
  lastName: "User",
  email: "admin@iset.tn",
  department: "Administration",
  createdAt: new Date()
};

// Sample student users
export const studentUsers: User[] = [
  {
    id: "student-1",
    username: "fadwatouati58",
    password: "student123",
    role: "student",
    firstName: "Touati",
    lastName: "Fadwa",
    email: "fadwatouati58@gmail.com",
    studentId: "ET2025001",
    department: "Informatique",
    createdAt: new Date()
  },
  {
    id: "student-2",
    username: "marie",
    password: "student123",
    role: "student",
    firstName: "Marie",
    lastName: "Laurent",
    email: "marie@iset.tn",
    studentId: "ET2025002",
    department: "Informatique",
    createdAt: new Date()
  }
];

// Sample books
export const books: Book[] = [
  {
    id: "book-1",
    title: "L'Étranger",
    author: "Albert Camus",
    isbn: "978-2070360024",
    category: "Fiction",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800",
    description: "Un roman philosophique écrit par Albert Camus publié en 1942.",
    available: true
  },
  {
    id: "book-2",
    title: "Le Petit Prince",
    author: "Antoine de Saint-Exupéry",
    isbn: "978-2070408504",
    category: "Fiction",
    coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=800",
    description: "Un conte poétique et philosophique sous l'apparence d'un conte pour enfants.",
    available: true
  },
  {
    id: "book-3",
    title: "Madame Bovary",
    author: "Gustave Flaubert",
    isbn: "978-2253004868",
    category: "Fiction",
    coverImage: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=800",
    description: "Un roman réaliste de Gustave Flaubert paru en 1857.",
    available: false,
    returnDate: new Date(new Date().setDate(new Date().getDate() + 7)),
    borrowedBy: "student-1"
  }
];
