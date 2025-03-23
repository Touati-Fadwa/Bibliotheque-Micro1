const request = require('supertest');
const { app, server, pool } = require('./server');

// Mock de la base de données
jest.mock('./server', () => ({
  pool: {
    query: jest.fn(),
  },
  app: require('express')(),
  server: {
    close: jest.fn((callback) => callback()),
  },
}));

let adminToken; // Pour stocker le token d'administrateur

// Nettoyer les mocks avant chaque test
beforeEach(() => {
  jest.clearAllMocks();
});

// Arrêter le serveur après les tests
afterAll(async () => {
  await new Promise((resolve) => server.close(resolve)); // Arrêter le serveur
});

// Tester la route GET /
describe('GET /', () => {
  it('devrait retourner un message de bienvenue', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Bibliothèque ISET Tozeur API is running');
  });
});

// Tester la route POST /api/login (Admin)
describe('POST /api/login', () => {
  it('devrait connecter un admin avec des identifiants valides', async () => {
    // Simuler une réponse de la base de données
    pool.query.mockResolvedValue({
      rows: [{
        id: 1,
        username: 'admin',
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // Mot de passe haché pour "admin123"
        role: 'admin',
        email: 'admin@iset.tn',
      }],
    });

    const res = await request(app)
      .post('/api/login')
      .send({
        email: 'admin@iset.tn',
        password: 'admin123',
        role: 'admin',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('Login successful');
    expect(res.body.token).toBeDefined();

    // Stocker le token pour les tests suivants
    adminToken = res.body.token;
  });

  it('devrait refuser un admin avec des identifiants invalides', async () => {
    // Simuler une réponse vide de la base de données
    pool.query.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .post('/api/login')
      .send({
        email: 'admin@iset.tn',
        password: 'wrongpassword',
        role: 'admin',
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toBe('Invalid credentials');
  });
});

// Tester la route POST /api/students (Créer un étudiant)
describe('POST /api/students', () => {
  it('devrait créer un nouvel étudiant avec des données valides', async () => {
    // Simuler une réponse de la base de données
    pool.query.mockResolvedValue({
      rows: [{
        id: 2,
        username: 'newstudent',
        password: 'password123',
        role: 'student',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@iset.tn',
        student_id: '12345',
        department: 'Informatique',
        created_at: new Date().toISOString(),
      }],
    });

    const res = await request(app)
      .post('/api/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        username: 'newstudent',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@iset.tn',
        studentId: '12345',
        department: 'Informatique',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.username).toBe('newstudent');
  });

  it('devrait refuser la création d\'un étudiant sans token', async () => {
    const res = await request(app)
      .post('/api/students')
      .send({
        username: 'newstudent',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@iset.tn',
        studentId: '12345',
        department: 'Informatique',
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toBe('Authentication token required');
  });
});

// Tester la route GET /api/students (Récupérer la liste des étudiants)
describe('GET /api/students', () => {
  it('devrait retourner la liste des étudiants avec un token valide', async () => {
    // Simuler une réponse de la base de données
    pool.query.mockResolvedValue({
      rows: [{
        id: 2,
        username: 'newstudent',
        role: 'student',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@iset.tn',
        student_id: '12345',
        department: 'Informatique',
        created_at: new Date().toISOString(),
      }],
    });

    const res = await request(app)
      .get('/api/students')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('devrait refuser l\'accès sans token', async () => {
    const res = await request(app).get('/api/students');

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toBe('Authentication token required');
  });
});