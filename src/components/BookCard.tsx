
import { useState } from 'react';
import { Calendar, Check, Clock, Loader2, User } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Book as BookType } from '../lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '../hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../hooks/useAuth';

interface BookCardProps {
  book: BookType;
  onBorrow?: (bookId: string) => Promise<boolean>;
  onReturn?: (bookId: string) => Promise<boolean>;
}

export function BookCard({ book, onBorrow, onReturn }: BookCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const isOwnedByCurrentUser = book.borrowedBy === user?.id;
  
  const handleBorrow = async () => {
    if (!onBorrow || !user) return;
    
    setIsLoading(true);
    try {
      const success = await onBorrow(book.id);
      if (success) {
        toast({
          title: "Livre emprunté",
          description: `Vous avez emprunté "${book.title}"`,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReturn = async () => {
    if (!onReturn || !user) return;
    
    setIsLoading(true);
    try {
      const success = await onReturn(book.id);
      if (success) {
        toast({
          title: "Livre retourné",
          description: `Vous avez retourné "${book.title}"`,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full overflow-hidden group border border-border/50 shadow-soft hover:shadow-md transition-all duration-300 card-shine">
        <div className="aspect-[3/4] overflow-hidden bg-muted">
          <img 
            src={book.coverImage} 
            alt={book.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <CardHeader className="p-4">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold line-clamp-1">{book.title}</CardTitle>
            {book.available ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Disponible
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                Emprunté
              </Badge>
            )}
          </div>
          <CardDescription className="line-clamp-1">{book.author}</CardDescription>
        </CardHeader>
        <CardContent className="px-4 pt-0 pb-2 text-sm">
          <p className="text-muted-foreground line-clamp-2 mb-2">{book.description}</p>
          <div className="flex items-center text-xs text-muted-foreground">
            <span className="font-medium mr-2">Catégorie:</span>
            <Badge variant="secondary" className="font-normal">
              {book.category}
            </Badge>
          </div>
          {!book.available && book.returnDate && (
            <div className="flex items-center mt-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              <span className="font-medium mr-1">Retour prévu:</span>
              {format(new Date(book.returnDate), 'dd MMMM yyyy', { locale: fr })}
            </div>
          )}
        </CardContent>
        <CardFooter className="px-4 pb-4 pt-0">
          {book.available ? (
            <Button 
              className="w-full"
              disabled={isLoading || !onBorrow}
              onClick={handleBorrow}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  Emprunter
                </>
              )}
            </Button>
          ) : isOwnedByCurrentUser && onReturn ? (
            <Button 
              variant="outline" 
              className="w-full"
              disabled={isLoading}
              onClick={handleReturn}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Retourner
                </>
              )}
            </Button>
          ) : (
            <Button 
              variant="outline" 
              className="w-full"
              disabled
            >
              <User className="mr-2 h-4 w-4" />
              Déjà emprunté
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
