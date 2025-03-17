
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book } from 'lucide-react';
import { LoginForm } from '../components/LoginForm';
import { useAuth } from '../hooks/useAuth';

const Index = () => {
  const { isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();
  
  // Redirect authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      if (userRole === 'admin') {
        navigate('/admin');
      } else if (userRole === 'student') {
        navigate('/student');
      }
    }
  }, [isAuthenticated, userRole, navigate]);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#9b87f5] text-white p-8 rounded-t-lg text-center">
          <div className="flex justify-center mb-4">
            <Book className="h-16 w-16" />
          </div>
          <h1 className="text-2xl font-bold">
            Bibliothèque ISET Tozeur
          </h1>
          <p className="mt-2">
            Plateforme de gestion de la bibliothèque
          </p>
        </div>
        
        <div className="bg-white p-6 shadow-md rounded-b-lg">
          <h2 className="text-xl font-semibold text-center mb-2">Connexion</h2>
          <p className="text-gray-600 text-center mb-6">Accédez à votre espace personnel</p>
          
          <LoginForm />
        </div>
      </div>
      
      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>© 2024 Bibliothèque ISET Tozeur. Tous droits réservés.</p>
      </footer>
    </div>
  );
};

export default Index;
