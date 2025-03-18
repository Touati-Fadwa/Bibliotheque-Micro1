const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Check database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully!');
  }
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Authentication token required' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Routes
app.get('/', (req, res) => {
  res.send('Bibliothèque ISET Tozeur API is running');
});

// Login route
app.post('/api/login', async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Email, password and role are required' });
  }

  try {
    // Query the database for the user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND role = $2',
      [email, role]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials or role' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send response with user info (excluding password)
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get all students (admin only)
app.get('/api/students', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const result = await pool.query(
      'SELECT id, username, role, first_name, last_name, email, student_id, department, created_at FROM users WHERE role = $1',
      ['student']
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error while fetching students' });
  }
});

// Register a new student (admin only)
app.post('/api/students', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const { username, password, firstName, lastName, email, studentId, department } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ message: 'Username, password and email are required' });
  }

  try {
    // Check if email already exists
    const emailCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (emailCheck.rows.length > 0) {
      return res.status(409).json({ message: 'This email is already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new student
    const result = await pool.query(
      `INSERT INTO users (username, password, role, first_name, last_name, email, student_id, department)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, username, role, first_name, last_name, email, student_id, department, created_at`,
      [username, hashedPassword, 'student', firstName, lastName, email, studentId, department]
    );

    const newStudent = result.rows[0];

    // Transform snake_case to camelCase for frontend
    const camelCaseStudent = {
      id: newStudent.id.toString(),
      username: newStudent.username,
      role: newStudent.role,
      firstName: newStudent.first_name,
      lastName: newStudent.last_name,
      email: newStudent.email,
      studentId: newStudent.student_id,
      department: newStudent.department,
      createdAt: newStudent.created_at,
    };

    res.status(201).json(camelCaseStudent);
  } catch (error) {
    console.error('Error registering student:', error);
    res.status(500).json({ message: 'Server error during student registration' });
  }
});

// Delete a student (admin only)
app.delete('/api/students/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const { id } = req.params;

  try {
    // Check if student exists
    const studentCheck = await pool.query('SELECT * FROM users WHERE id = $1 AND role = $2', [id, 'student']);

    if (studentCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Delete the student
    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Server error during student deletion' });
  }
});

// Start the server
const server = app.listen(port, () => {
  console.log(`Bibliothèque ISET Tozeur API running on port ${port}`);
});

// Export the app and server for testing
module.exports = { app, server };
