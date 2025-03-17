
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { StudentForm } from '../components/StudentForm';
import { studentUsers } from '../lib/mockData';
import { Search, Trash2, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '../hooks/use-toast';
import { User } from '../lib/types';

const Admin = () => {
  const { isAuthenticated, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([...studentUsers]);
  const { toast } = useToast();
  
  // Protect admin route
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    } else if (userRole !== 'admin') {
      navigate('/student');
    }
  }, [isAuthenticated, userRole, navigate]);
  
  if (!isAuthenticated || userRole !== 'admin') {
    return null;
  }
  
  const filteredStudents = students.filter(student => 
    student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleDelete = async (id: string) => {
    try {
      // Check if this is a mock student (starts with "student-")
      const isMockStudent = id.startsWith('student-');
      
      if (!isMockStudent) {
        // Send delete request to the backend API only for real students
        const response = await fetch(`http://localhost:3000/api/students/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete student');
        }
      }

      // Update the UI state regardless of whether it's a mock or real student
      setStudents(prevStudents => prevStudents.filter(s => s.id !== id));
      
      // Also permanently update the mock data for consistency
      const studentIndex = studentUsers.findIndex(s => s.id === id);
      if (studentIndex !== -1) {
        studentUsers.splice(studentIndex, 1);
      }
      
      // Store the updated students list in localStorage to persist deletion
      const currentStudents = studentUsers.filter(s => s.id !== id);
      localStorage.setItem('deleted-students', JSON.stringify(currentStudents.map(s => s.id)));
      
      toast({
        title: "Étudiant supprimé",
        description: "L'étudiant a été supprimé avec succès",
      });
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur s'est produite lors de la suppression de l'étudiant",
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-purple-500">ISET Tozeur</h1>
          <p className="text-sm text-gray-500">Bibliothèque</p>
        </div>
        
        <nav className="flex-1 p-4">
          <div className="bg-purple-50 p-2 rounded flex items-center text-purple-500">
            <UserPlus className="h-5 w-5 mr-2" />
            <span>Étudiants</span>
          </div>
        </nav>
        
        <div className="p-4 border-t">
          <div className="mb-2 text-sm text-gray-500">
            <div>Mode</div>
            <div>Administrateur</div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center text-red-500 text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm5 4a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zm0 4a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            Déconnexion
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-6 bg-gray-50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Gestion des Étudiants</h2>
          <StudentForm onStudentAdded={(newStudent) => setStudents([...students, newStudent])} />
        </div>
        
        <div className="bg-white rounded-md shadow-sm p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input 
              placeholder="Rechercher un étudiant..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          {filteredStudents.map(student => (
            <div key={student.id} className="p-4 bg-white rounded-md shadow-sm">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold">{student.firstName} {student.lastName}</h3>
                  <p className="text-sm text-gray-600">ID: {student.studentId}</p>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <span>Département: {student.department}</span>
                    <span className="mx-2">•</span>
                    <span>Email: {student.email}</span>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-500"
                  onClick={() => handleDelete(student.id)}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ))}
          
          {filteredStudents.length === 0 && (
            <div className="text-center p-4 bg-white rounded-md shadow-sm">
              <p className="text-gray-500">Aucun étudiant trouvé</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
