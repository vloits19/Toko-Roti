import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, ShoppingCart, User, LogOut, ChevronDown, Home, Package, MapPin, Info, MessageSquare, type LucideIcon } from 'lucide-react';

interface NavLinkProps {
  path: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const publicLinks: NavLinkProps[] = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/products', label: 'Produk', icon: Package },
    { path: '/location', label: 'Lokasi', icon: MapPin },
    { path: '/about', label: 'Tentang', icon: Info },
  ];

  const authLinks: NavLinkProps[] = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/products', label: 'Produk', icon: Package },
    { path: '/cart', label: 'Keranjang', icon: ShoppingCart, badge: itemCount },
    { path: '/contact', label: 'Contact', icon: MessageSquare },
    { path: '/location', label: 'Lokasi', icon: MapPin },
    { path: '/about', label: 'Tentang', icon: Info },
  ];

  const links = isAuthenticated ? authLinks : publicLinks;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const NavLink = ({ path, label, icon: Icon, badge }: NavLinkProps) => (
    <Link
      to={path}
      onClick={() => setIsOpen(false)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
        isActive(path)
          ? 'bg-amber-100 text-amber-800 font-medium'
          : 'text-stone-600 hover:bg-amber-50 hover:text-amber-700'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="ml-auto bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-amber-100 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center transition-transform hover:rotate-12 duration-300 shadow-sm">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="font-bold text-xl text-stone-800 hidden sm:block">
              Roti <span className="text-amber-600">Lezat</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all active:scale-95 ${
                  isActive(link.path)
                    ? 'bg-amber-100 text-amber-800 font-medium'
                    : 'text-stone-600 hover:bg-amber-50 hover:text-amber-700 hover:scale-105'
                }`}
              >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Cart Button (Desktop) */}
            {isAuthenticated && (
              <Link to="/cart" className="hidden lg:flex">
                <Button variant="ghost" size="icon" className="relative transition-all active:scale-95 hover:scale-105">
                  <ShoppingCart className="w-5 h-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </Link>
            )}

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 transition-all active:scale-95 hover:scale-105">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-amber-700" />
                    </div>
                    <span className="hidden sm:inline max-w-[100px] truncate">
                      {user?.name}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-sm text-stone-500">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        Dashboard Admin
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    Profil Saya
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/orders')}>
                    Pesanan Saya
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                    Daftar
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col gap-4 mt-6">
                  {/* Mobile Auth */}
                  {!isAuthenticated && (
                    <div className="flex flex-col gap-2 pb-4 border-b">
                      <Link to="/login" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full">Login</Button>
                      </Link>
                      <Link to="/register" onClick={() => setIsOpen(false)}>
                        <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                          Daftar
                        </Button>
                      </Link>
                    </div>
                  )}

                  {/* Mobile Links */}
                  <nav className="flex flex-col gap-1">
                    {links.map((link) => (
                      <NavLink key={link.path} {...link} />
                    ))}
                  </nav>

                  {/* Mobile User Menu */}
                  {isAuthenticated && (
                    <div className="pt-4 border-t">
                      <div className="px-3 py-2 mb-2">
                        <p className="font-medium">{user?.name}</p>
                        <p className="text-sm text-stone-500">{user?.email}</p>
                      </div>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-stone-600 hover:bg-amber-50"
                        >
                          Dashboard Admin
                        </Link>
                      )}
                      <Link
                        to="/profile"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-stone-600 hover:bg-amber-50"
                      >
                        Profil Saya
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-stone-600 hover:bg-amber-50"
                      >
                        Pesanan Saya
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 w-full text-left mt-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
