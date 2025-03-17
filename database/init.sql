
-- Create database
CREATE DATABASE bibliotheque_iset;

-- Connect to the database
\c bibliotheque_iset;

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(10) NOT NULL CHECK (role IN ('admin', 'student')),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(100) NOT NULL UNIQUE,
  student_id VARCHAR(20) UNIQUE,
  department VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create books table for future use
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  isbn VARCHAR(20) NOT NULL UNIQUE,
  category VARCHAR(100),
  available BOOLEAN NOT NULL DEFAULT TRUE,
  cover_image VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create borrowings table for future use
CREATE TABLE borrowings (
  id SERIAL PRIMARY KEY,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  borrow_date TIMESTAMP NOT NULL DEFAULT NOW(),
  return_date TIMESTAMP,
  returned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_books_available ON books(available);
CREATE INDEX idx_borrowings_returned ON borrowings(returned);

-- Insert default admin user (not needed as we're using fixed credentials)
-- Note: In production, you'd use a secure method to create the admin
/*
INSERT INTO users (username, password, role, first_name, last_name, email, department)
VALUES (
  'admin',
  '$2b$10$8KvdRLa.INhCLVGe1jLYWOkvYAHiG9jJwOH5MB0/OFdOA9HchpZDq', -- hashed 'admin123'
  'admin',
  'Admin',
  'User',
  'admin@iset.tn',
  'Administration'
);
*/

-- Sample student for testing
-- In production, students would be added through the admin interface
INSERT INTO users (
  username, 
  password, 
  role, 
  first_name, 
  last_name, 
  email, 
  student_id, 
  department
) VALUES (
  'fadwatouati58',
  '$2b$10$fKL7XdG3W0UBe5A2vLZvRO6MwCSZS7GA1y0eeoM.RKS0tGsj5glBu', -- hashed 'student123'
  'student',
  'Touati',
  'Fadwa',
  'fadwatouati58@gmail.com',
  'ET2025001',
  'Informatique'
);
