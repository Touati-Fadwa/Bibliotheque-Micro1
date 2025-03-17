
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Book, LogOut, Menu, Search, User, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close menu when changing routes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 px-6 ${
        isScrolled ? 'bg-glass shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo & Title */}
        <div className="flex items-center space-x-2">
          <Book className="h-6 w-6 text-primary" />
          <span className="text-xl font-medium">BiblioGatekeeper</span>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {user && (
            <>
              <div className="relative w-64">
                <Input
                  type="text"
                  placeholder="Rechercher un livre..."
                  className="pl-10 pr-4 py-2 w-full bg-background/80 backdrop-blur-sm"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
              
              {userRole === 'admin' && (
                <Button
                  variant="ghost"
                  className="text-sm font-medium"
                  onClick={() => navigate('/admin')}
                >
                  Tableau de bord
                </Button>
              )}
              
              {userRole === 'student' && (
                <Button
                  variant="ghost"
                  className="text-sm font-medium"
                  onClick={() => navigate('/student')}
                >
                  Mes livres
                </Button>
              )}
              
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {user.firstName || user.username}
                </span>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                aria-label="Se déconnecter"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
        </nav>
        
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-glass backdrop-blur-md shadow-md p-4 border-t border-border animate-fade-in">
          <div className="flex flex-col space-y-4">
            {user ? (
              <>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Rechercher un livre..."
                    className="pl-10 pr-4 py-2 w-full"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
                
                <div className="flex items-center space-x-2 px-2 py-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {user.firstName || user.username}
                  </span>
                </div>
                
                {userRole === 'admin' && (
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => navigate('/admin')}
                  >
                    Tableau de bord
                  </Button>
                )}
                
                {userRole === 'student' && (
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => navigate('/student')}
                  >
                    Mes livres
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Se déconnecter
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate('/')}>Se connecter</Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
