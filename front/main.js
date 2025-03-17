
// DOM Elements
const root = document.getElementById('root');

// User state
let currentUser = null;
let isAuthenticated = false;

// Initial page load
document.addEventListener('DOMContentLoaded', () => {
  // Check if user is stored in local storage
  const storedUser = localStorage.getItem('bibliogatekeeper-user');
  
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
    isAuthenticated = true;
    
    // Redirect to appropriate dashboard
    if (currentUser.role === 'admin') {
      renderAdminDashboard();
    } else if (currentUser.role === 'student') {
      renderStudentDashboard();
    }
  } else {
    // Render login page if not authenticated
    renderLoginPage();
  }
});

// Render login page
function renderLoginPage() {
  root.innerHTML = `
    <div class="container">
      <div class="login-card">
        <div class="login-header">
          <div class="login-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
            </svg>
          </div>
          <h1 class="login-title">Bibliothèque ISET Tozeur</h1>
          <p class="login-subtitle">Plateforme de gestion de la bibliothèque</p>
        </div>
        
        <div class="login-body">
          <h2 class="login-form-title">Connexion</h2>
          <p class="login-form-subtitle">Accédez à votre espace personnel</p>
          
          <form id="login-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" placeholder="votreemail@iset.tn" required>
            </div>
            
            <div class="form-group">
              <label for="password">Mot de passe</label>
              <input type="password" id="password" placeholder="••••••••" required>
            </div>
            
            <div class="form-group">
              <label>Sélectionnez votre rôle</label>
              <div class="radio-group">
                <div class="radio-item">
                  <input type="radio" id="student-role" name="role" value="student" checked>
                  <label for="student-role">Étudiant</label>
                </div>
                <div class="radio-item">
                  <input type="radio" id="admin-role" name="role" value="admin">
                  <label for="admin-role">Administrateur</label>
                </div>
              </div>
            </div>
            
            <button type="submit">Se connecter</button>
          </form>
        </div>
      </div>
      
      <footer>
        <p>© 2024 Bibliothèque ISET Tozeur. Tous droits réservés.</p>
      </footer>
    </div>
  `;
  
  // Add event listener to login form
  const loginForm = document.getElementById('login-form');
  loginForm.addEventListener('submit', handleLogin);
}

// Handle login form submission
function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const role = document.querySelector('input[name="role"]:checked').value;
  
  // Send login request to backend
  fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password, role })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Store user in local storage
      localStorage.setItem('bibliogatekeeper-user', JSON.stringify(data.user));
      currentUser = data.user;
      isAuthenticated = true;
      
      // Redirect to appropriate dashboard
      if (currentUser.role === 'admin') {
        renderAdminDashboard();
      } else if (currentUser.role === 'student') {
        renderStudentDashboard();
      }
      
      showToast('Connecté avec succès');
    } else {
      showToast('Échec de connexion: ' + (data.message || 'Email ou mot de passe incorrect'), 'error');
    }
  })
  .catch(error => {
    console.error('Login error:', error);
    showToast('Erreur de connexion. Veuillez réessayer.', 'error');
  });
}

// Render admin dashboard
function renderAdminDashboard() {
  root.innerHTML = `
    <div class="admin-container">
      <header class="admin-header">
        <div>
          <h1 class="admin-title">Bibliothèque ISET Tozeur - Administration</h1>
          <p>Bonjour, ${currentUser.firstName || 'Admin'}</p>
        </div>
        <button class="logout-btn" id="logout-btn">Déconnexion</button>
      </header>
      
      <button class="add-student-btn" id="add-student-btn">
        <span class="add-icon">+</span>
        Ajouter un étudiant
      </button>
      
      <div id="students-list">
        <!-- Students will be listed here -->
        <p>Liste des étudiants sera affichée ici</p>
      </div>
    </div>
  `;
  
  // Add event listeners
  document.getElementById('logout-btn').addEventListener('click', handleLogout);
  document.getElementById('add-student-btn').addEventListener('click', showAddStudentModal);
  
  // Fetch and display students
  fetchStudents();
}

// Render student dashboard
function renderStudentDashboard() {
  root.innerHTML = `
    <div>
      <header class="student-header">
        <div class="admin-container">
          <div class="admin-header">
            <div>
              <h1 class="admin-title">Bibliothèque ISET Tozeur - Espace Étudiant</h1>
              <p>Bonjour, ${currentUser.firstName || 'Étudiant'} ${currentUser.lastName || ''}</p>
            </div>
            <button class="logout-btn" id="logout-btn">Déconnexion</button>
          </div>
        </div>
      </header>
      
      <main class="admin-container">
        <div class="student-welcome">
          <h2>Bienvenue dans votre espace étudiant</h2>
          <p>L'accès aux livres est temporairement désactivé. Merci de votre compréhension.</p>
        </div>
      </main>
    </div>
  `;
  
  // Add event listener
  document.getElementById('logout-btn').addEventListener('click', handleLogout);
}

// Show add student modal
function showAddStudentModal() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <button class="modal-close" id="close-modal">&times;</button>
      <h2 class="modal-title">Ajouter un nouvel étudiant</h2>
      
      <form id="student-form">
        <div class="form-group">
          <label for="fullName">Nom complet</label>
          <input type="text" id="fullName" placeholder="Nom et prénom" required>
        </div>
        
        <div class="form-group">
          <label for="studentId">ID Étudiant</label>
          <input type="text" id="studentId" placeholder="ET2024XXX" required>
        </div>
        
        <div class="form-group">
          <label for="department">Département</label>
          <input type="text" id="department" placeholder="Informatique" value="Informatique" required>
        </div>
        
        <div class="form-group">
          <label for="studentEmail">Email</label>
          <input type="email" id="studentEmail" placeholder="etudiant@iset.tn" required>
        </div>
        
        <div class="form-group">
          <label for="studentPassword">Mot de passe</label>
          <input type="password" id="studentPassword" placeholder="Mot de passe pour l'étudiant" required>
        </div>
        
        <button type="submit">Ajouter</button>
      </form>
    </div>
  `;
  
  root.appendChild(modal);
  
  // Add event listeners
  document.getElementById('close-modal').addEventListener('click', () => {
    root.removeChild(modal);
  });
  
  document.getElementById('student-form').addEventListener('submit', function(e) {
    e.preventDefault();
    handleAddStudent();
  });
}

// Handle add student form submission
function handleAddStudent() {
  const fullName = document.getElementById('fullName').value;
  const names = fullName.split(' ');
  const firstName = names[0];
  const lastName = names.slice(1).join(' ');
  const studentId = document.getElementById('studentId').value;
  const department = document.getElementById('department').value;
  const email = document.getElementById('studentEmail').value;
  const password = document.getElementById('studentPassword').value;
  
  // Create username from email (before the @)
  const username = email.split('@')[0];
  
  // Send request to backend
  fetch('http://localhost:3000/api/students', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${currentUser.token}`
    },
    body: JSON.stringify({
      username,
      password,
      firstName,
      lastName,
      email,
      studentId,
      department
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      showToast('Étudiant ajouté avec succès');
      // Close modal and refresh students list
      const modal = document.querySelector('.modal');
      root.removeChild(modal);
      fetchStudents();
    } else {
      showToast(data.message || 'Erreur lors de l\'ajout de l\'étudiant', 'error');
    }
  })
  .catch(error => {
    console.error('Add student error:', error);
    showToast('Erreur lors de l\'ajout de l\'étudiant', 'error');
  });
}

// Fetch students from backend
function fetchStudents() {
  // This would be replaced with actual API call
  console.log('Fetching students...');
}

// Handle logout
function handleLogout() {
  localStorage.removeItem('bibliogatekeeper-user');
  currentUser = null;
  isAuthenticated = false;
  renderLoginPage();
  showToast('Déconnecté avec succès');
}

// Show toast notification
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.right = '20px';
  toast.style.padding = '10px 20px';
  toast.style.borderRadius = '4px';
  toast.style.color = 'white';
  toast.style.backgroundColor = type === 'success' ? '#4caf50' : '#f44336';
  toast.style.zIndex = '1000';
  toast.style.opacity = '0';
  toast.style.transition = 'opacity 0.3s';
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // Animate
  setTimeout(() => {
    toast.style.opacity = '1';
  }, 10);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}
