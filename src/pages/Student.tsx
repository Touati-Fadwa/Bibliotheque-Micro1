
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Book, BookOpen, Clock, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { books as mockBooks } from '../lib/mockData';
import { Book as BookType } from '../lib/types';
import { BookCard } from '../components/BookCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

const Student = () => {
  const { isAuthenticated, userRole, user, logout } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState<BookType[]>([]);
  const [borrowedBooks, setBorrowedBooks] = useState<BookType[]>([]);
  
  // Protect student route
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    } else if (userRole !== 'student') {
      navigate('/admin');
    }
  }, [isAuthenticated, userRole, navigate]);
  
  // Load books
  useEffect(() => {
    // Get all books
    setBooks(mockBooks);
    
    // Filter borrowed books by this student
    if (user) {
      const userBorrowedBooks = mockBooks.filter(book => 
        !book.available && book.borrowedBy === user.id
      );
      setBorrowedBooks(userBorrowedBooks);
    }
  }, [user]);
  
  if (!isAuthenticated || userRole !== 'student') {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const availableBooks = books.filter(book => book.available);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b py-4 px-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-medium text-purple-500">Bibliothèque ISET Tozeur</h1>
            <p className="text-sm text-gray-500">Portail de {user?.firstName} {user?.lastName}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="text-red-500 flex items-center"
          >
            <span className="mr-2">Déconnexion</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm5 4a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zm0 4a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </header>
      
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Student Info Card */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold">Profil Étudiant</CardTitle>
              <CardDescription>Vos informations personnelles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-purple-500" />
                    <span className="font-medium">Nom complet:</span>
                    <span>{user?.firstName} {user?.lastName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium ml-7">ID étudiant:</span>
                    <span>{user?.studentId}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Email:</span>
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Département:</span>
                    <span>{user?.department}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Books Dashboard */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Bibliothèque</CardTitle>
              <CardDescription>Parcourez et empruntez des livres</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="available">
                <TabsList className="mb-4">
                  <TabsTrigger value="available" className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" /> 
                    Disponibles ({availableBooks.length})
                  </TabsTrigger>
                  <TabsTrigger value="borrowed" className="flex items-center gap-1">
                    <Clock className="h-4 w-4" /> 
                    Mes emprunts ({borrowedBooks.length})
                  </TabsTrigger>
                </TabsList>
                
                <ScrollArea className="h-[500px] pr-4">
                  <TabsContent value="available" className="m-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availableBooks.length > 0 ? (
                        availableBooks.map(book => (
                          <BookCard key={book.id} book={book} />
                        ))
                      ) : (
                        <div className="col-span-2 text-center py-8">
                          <Book className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                          <p className="text-gray-500">Aucun livre disponible</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="borrowed" className="m-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {borrowedBooks.length > 0 ? (
                        borrowedBooks.map(book => (
                          <BookCard key={book.id} book={book} />
                        ))
                      ) : (
                        <div className="col-span-2 text-center py-8">
                          <Book className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                          <p className="text-gray-500">Vous n'avez pas de livres empruntés</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Student;
