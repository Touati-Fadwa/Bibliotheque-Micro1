
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../lib/types';
import { adminUser, studentUsers } from '../lib/mockData';
import { useToast } from '../hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  registerStudent: (studentData: Omit<User, 'id' | 'role' | 'createdAt'>) => Promise<User | null>;
  isAuthenticated: boolean;
  userRole: UserRole | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Simulate local storage persistence
const getStoredUser = (): User | null => {
  const storedUser = localStorage.getItem('bibliogatekeeper-user');
  return storedUser ? JSON.parse(storedUser) : null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Handle deleted students
  useEffect(() => {
    // Check for deleted students in localStorage
    const deletedStudentsJson = localStorage.getItem('deleted-students');
    if (deletedStudentsJson) {
      const deletedStudentIds = JSON.parse(deletedStudentsJson);
      
      // Remove deleted students from the studentUsers array
      for (let i = studentUsers.length - 1; i >= 0; i--) {
        if (deletedStudentIds.includes(studentUsers[i].id)) {
          studentUsers.splice(i, 1);
        }
      }
    }
    
    setLoading(false);
  }, []);

  // Authenticate user with role selection
  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check if admin and role matches
    if (role === 'admin' && email === adminUser.email && password === adminUser.password) {
      setUser(adminUser);
      localStorage.setItem('bibliogatekeeper-user', JSON.stringify(adminUser));
      toast({
        title: "Connecté avec succès",
        description: "Bienvenue dans le système de gestion de bibliothèque",
      });
      setLoading(false);
      return true;
    }
    
    // Check if student and role matches
    if (role === 'student') {
      const student = studentUsers.find(
        (s) => s.email === email && s.password === password
      );
      
      if (student) {
        setUser(student);
        localStorage.setItem('bibliogatekeeper-user', JSON.stringify(student));
        toast({
          title: "Connecté avec succès",
          description: "Bienvenue dans votre espace étudiant",
        });
        setLoading(false);
        return true;
      }
    }
    
    // Failed login
    toast({
      variant: "destructive",
      title: "Échec de connexion",
      description: "Email ou mot de passe incorrect, ou rôle non valide",
    });
    setLoading(false);
    return false;
  };

  // Logout user
  const logout = () => {
    setUser(null);
    localStorage.removeItem('bibliogatekeeper-user');
    toast({
      title: "Déconnecté",
      description: "Vous avez été déconnecté avec succès",
    });
  };

  // Register a new student (admin only)
  const registerStudent = async (studentData: Omit<User, 'id' | 'role' | 'createdAt'>): Promise<User | null> => {
    setLoading(true);
    
    try {
      // For mock data, create a unique ID with prefix to identify it later
      const mockId = `student-${Date.now()}`;
      
      // Create a new student object with all required fields
      const newStudent: User = {
        id: mockId,
        username: studentData.username,
        password: studentData.password,
        role: 'student',
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        email: studentData.email,
        studentId: studentData.studentId,
        department: studentData.department,
        createdAt: new Date(),
      };
      
      // Add to mock data
      studentUsers.push(newStudent);
      
      // In a real app, this would be where we make an API call
      // Try to make the API call if available
      try {
        // Make API call to register student
        const response = await fetch('http://localhost:3000/api/students', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: studentData.username,
            password: studentData.password,
            firstName: studentData.firstName,
            lastName: studentData.lastName,
            email: studentData.email,
            studentId: studentData.studentId,
            department: studentData.department
          }),
        });
        
        // If successful, update our mock student with the real ID
        if (response.ok) {
          const apiStudent = await response.json();
          
          // Find and update the student in our mock data with real ID
          const studentIndex = studentUsers.findIndex(s => s.id === mockId);
          if (studentIndex !== -1) {
            studentUsers[studentIndex] = {
              ...newStudent,
              id: apiStudent.id, // Replace mock ID with real one
            };
          }
          
          return {
            ...newStudent,
            id: apiStudent.id, // Return with real ID
          };
        }
      } catch (error) {
        console.log('Backend API not available, using mock data only');
        // If API fails, we still return our mock student
      }
      
      toast({
        title: "Étudiant enregistré",
        description: "L'étudiant a été ajouté avec succès",
      });
      
      return newStudent;
    } catch (error) {
      console.error('Error registering student:', error);
      toast({
        variant: "destructive",
        title: "Erreur d'enregistrement",
        description: "Une erreur s'est produite lors de l'enregistrement de l'étudiant",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        registerStudent,
        isAuthenticated: !!user,
        userRole: user?.role || null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
