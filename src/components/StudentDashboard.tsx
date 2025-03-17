
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Book, RefreshCw, Search } from 'lucide-react';
import { books as mockBooks } from '../lib/mockData';
import { BookCard } from './BookCard';
import { Book as BookType } from '../lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

export function StudentDashboard() {
  const [books, setBooks] = useState<BookType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    // Load books from mock data
    setBooks(mockBooks);
  }, []);
  
  const handleBookBorrow = async (bookId: string): Promise<boolean> => {
    if (!user) return false;
    
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      // Update book status
      setBooks(prevBooks => 
        prevBooks.map(book => 
          book.id === bookId 
            ? { 
                ...book, 
                available: false, 
                borrowedBy: user.id, 
                returnDate: new Date(new Date().setDate(new Date().getDate() + 14)) // 14 days from now
              } 
            : book
        )
      );
      
      return true;
    } catch (error) {
      console.error('Error borrowing book:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'emprunter le livre. Veuillez réessayer.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBookReturn = async (bookId: string): Promise<boolean> => {
    if (!user) return false;
    
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
  
  const myBooks = filteredBooks.filter(book => book.borrowedBy === user?.id);
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
        <h1 className="text-3xl font-bold tracking-tight">Bibliothèque</h1>
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
            <CardTitle className="text-lg font-medium">Mes emprunts</CardTitle>
            <CardDescription>Livres actuellement empruntés</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Book className="h-8 w-8 text-primary mr-4" />
              <div>
                <div className="text-3xl font-bold">{myBooks.length}</div>
                <p className="text-muted-foreground text-sm">
                  sur {books.length} livres disponibles
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-border/50 shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Livres disponibles</CardTitle>
            <CardDescription>Prêts à être empruntés</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Book className="h-8 w-8 text-green-500 mr-4" />
              <div>
                <div className="text-3xl font-bold">{availableBooks.length}</div>
                <p className="text-muted-foreground text-sm">
                  {((availableBooks.length / books.length) * 100).toFixed(0)}% du catalogue
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-soft border border-border/50">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Catalogue de la bibliothèque</CardTitle>
          <CardDescription>
            Parcourez les livres disponibles et gérez vos emprunts
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
              <TabsTrigger value="mybooks">Mes livres ({myBooks.length})</TabsTrigger>
            </TabsList>
            
            <ScrollArea className="h-[600px] pr-4">
              <TabsContent value="all" className="m-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredBooks.length > 0 ? (
                    filteredBooks.map(book => (
                      <BookCard 
                        key={book.id} 
                        book={book} 
                        onBorrow={handleBookBorrow}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {availableBooks.length > 0 ? (
                    availableBooks.map(book => (
                      <BookCard 
                        key={book.id} 
                        book={book} 
                        onBorrow={handleBookBorrow}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <p className="text-muted-foreground">Aucun livre disponible</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="mybooks" className="m-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {myBooks.length > 0 ? (
                    myBooks.map(book => (
                      <BookCard 
                        key={book.id} 
                        book={book} 
                        onReturn={handleBookReturn}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <p className="text-muted-foreground">Vous n'avez aucun livre emprunté</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
