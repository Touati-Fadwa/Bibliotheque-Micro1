
import { useState, useEffect } from 'react';
import { Book, Plus, RefreshCw, Search, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { books as mockBooks, studentUsers } from '../lib/mockData';
import { Book as BookType } from '../lib/types';
import { StudentForm } from './StudentForm';
import { BookCard } from './BookCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '../hooks/use-toast';

export function AdminDashboard() {
  const [books, setBooks] = useState<BookType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    // Load books from mock data
    setBooks(mockBooks);
  }, []);
  
  const handleBookReturn = async (bookId: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      // Update book status
      setBooks(prevBooks => 
        prevBooks.map(book => 
          book.id === bookId 
            ? { ...book, available: true, borrowedBy: undefined, returnDate: undefined } 
            : book
        )
      );
      
      return true;
    } catch (error) {
      console.error('Error returning book:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de retourner le livre. Veuillez réessayer.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const filteredBooks = books.filter(
    book => 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const borrowedBooks = filteredBooks.filter(book => !book.available);
  const availableBooks = filteredBooks.filter(book => book.available);
  
  const refreshData = () => {
    setIsLoading(true);
    
    // Simulate refresh delay
    setTimeout(() => {
      setBooks([...mockBooks]);
      setIsLoading(false);
      toast({
        title: "Données actualisées",
        description: "La liste des livres a été mise à jour",
      });
    }, 800);
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto py-6 space-y-6 max-w-7xl"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord admin</h1>
        <Button onClick={refreshData} variant="outline" disabled={isLoading}>
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-1" />
          )}
          Actualiser
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border border-border/50 shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total des livres</CardTitle>
            <CardDescription>Inventaire de la bibliothèque</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Book className="h-8 w-8 text-primary mr-4" />
              <div>
                <div className="text-3xl font-bold">{books.length}</div>
                <p className="text-muted-foreground text-sm">
                  {availableBooks.length} disponibles
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-border/50 shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Livres empruntés</CardTitle>
            <CardDescription>Actuellement en circulation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Book className="h-8 w-8 text-amber-500 mr-4" />
              <div>
                <div className="text-3xl font-bold">{borrowedBooks.length}</div>
                <p className="text-muted-foreground text-sm">
                  {((borrowedBooks.length / books.length) * 100).toFixed(0)}% du total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-border/50 shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Étudiants</CardTitle>
            <CardDescription>Utilisateurs enregistrés</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-500 mr-4" />
              <div>
                <div className="text-3xl font-bold">{studentUsers.length}</div>
                <p className="text-muted-foreground text-sm">
                  Accès actifs
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-soft border border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">Gestion des livres</CardTitle>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter un livre
                </Button>
              </div>
              <CardDescription>
                Consultez et gérez tous les livres de la bibliothèque
              </CardDescription>
              
              <div className="mt-4 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par titre, auteur ou catégorie..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">Tous ({filteredBooks.length})</TabsTrigger>
                  <TabsTrigger value="available">Disponibles ({availableBooks.length})</TabsTrigger>
                  <TabsTrigger value="borrowed">Empruntés ({borrowedBooks.length})</TabsTrigger>
                </TabsList>
                
                <ScrollArea className="h-[460px] pr-4">
                  <TabsContent value="all" className="m-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filteredBooks.length > 0 ? (
                        filteredBooks.map(book => (
                          <BookCard 
                            key={book.id} 
                            book={book} 
                            onReturn={handleBookReturn}
                          />
                        ))
                      ) : (
                        <div className="col-span-full text-center py-8">
                          <p className="text-muted-foreground">Aucun livre trouvé</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="available" className="m-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {availableBooks.length > 0 ? (
                        availableBooks.map(book => (
                          <BookCard key={book.id} book={book} />
                        ))
                      ) : (
                        <div className="col-span-full text-center py-8">
                          <p className="text-muted-foreground">Aucun livre disponible</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="borrowed" className="m-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {borrowedBooks.length > 0 ? (
                        borrowedBooks.map(book => (
                          <BookCard 
                            key={book.id} 
                            book={book} 
                            onReturn={handleBookReturn}
                          />
                        ))
                      ) : (
                        <div className="col-span-full text-center py-8">
                          <p className="text-muted-foreground">Aucun livre emprunté</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <StudentForm />
        </div>
      </div>
    </motion.div>
  );
}
