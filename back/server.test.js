const request = require('supertest');
const { app, server, pool } = require('./server'); // Importer l'application Express, le serveur et le pool de connexions

let adminToken; // Pour stocker le token d'administrateur

// Nettoyer la base de données avant les tests
beforeAll(async () => {
  await pool.query('DELETE FROM users WHERE role = $1', ['student']); // Supprimer tous les étudiants
});

// Arrêter le serveur après les tests
afterAll(async () => {
  await pool.end(); // Fermer le pool de connexions
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
    const res = await request(app)
      .post('/api/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        username: 'newstudent',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@iset.tn', // Assurez-vous que cet email est unique
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