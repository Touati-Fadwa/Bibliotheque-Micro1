const request = require('supertest');
const app = require('./server'); // Importer l'application Express

let server;
let adminToken; // Pour stocker le token d'administrateur
let studentToken; // Pour stocker le token d'étudiant

// Démarrer le serveur avant les tests
beforeAll(() => {
  const PORT = process.env.PORT || 3000;
  server = app.listen(PORT);
});

// Arrêter le serveur après les tests
afterAll((done) => {
  server.close(done);
});

// Tester la route GET /
describe('GET /', () => {
  it('devrait retourner un message de bienvenue', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Backend de la bibliothèque ISET Tozeur');
  });
});

// Tester la route POST /api/auth/login (Admin)
describe('POST /api/auth/login', () => {
  it('devrait connecter un admin avec des identifiants valides', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@iset.tn',
        password: 'admin123',
        role: 'admin',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toHaveProperty('token');
    expect(res.body.user.role).toBe('admin');

    // Stocker le token pour les tests suivants
    adminToken = res.body.user.token;
  });

  it('devrait refuser un admin avec des identifiants invalides', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@iset.tn',
        password: 'wrongpassword',
        role: 'admin',
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Échec de connexion. Vérifiez vos identifiants et le rôle sélectionné.');
  });
});

// Tester la route POST /api/auth/login (Étudiant)
describe('POST /api/auth/login', () => {
  it('devrait connecter un étudiant avec des identifiants valides', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'etudiant@iset.tn',
        password: 'etudiant123',
        role: 'student',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toHaveProperty('token');
    expect(res.body.user.role).toBe('student');

    // Stocker le token pour les tests suivants
    studentToken = res.body.user.token;
  });

  it('devrait refuser un étudiant avec des identifiants invalides', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'etudiant@iset.tn',
        password: 'wrongpassword',
        role: 'student',
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Échec de connexion. Vérifiez vos identifiants et le rôle sélectionné.');
  });
});

// Tester la route POST /api/students (Créer un étudiant)
describe('POST /api/students', () => {
  it('devrait créer un nouvel étudiant avec des données valides', async () => {
    const res = await request(app)
      .post('/api/students')
      .set('Authorization', `Bearer ${adminToken}`) // Utiliser le token d'administrateur
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
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Étudiant ajouté avec succès');
    expect(res.body.student).toHaveProperty('id');
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
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Authentication required');
  });
});

// Tester la route GET /api/students (Récupérer la liste des étudiants)
describe('GET /api/students', () => {
  it('devrait retourner la liste des étudiants avec un token valide', async () => {
    const res = await request(app)
      .get('/api/students')
      .set('Authorization', `Bearer ${adminToken}`); // Utiliser le token d'administrateur

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.students).toBeInstanceOf(Array);
  });

  it('devrait refuser l\'accès sans token', async () => {
    const res = await request(app)
      .get('/api/students');

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Authentication required');
  });
});