
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Home,
  Menu,
  LogIn,
  LogOut,
  PanelRight,
  User,
  X,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const navItems = [
    {
      name: "Home",
      path: "/",
      icon: <Home className="w-4 h-4 mr-2" />,
    },
    {
      name: "View Feedback",
      path: "/feedback",
      icon: <MessageSquare className="w-4 h-4 mr-2" />,
    },
    {
      name: "Submit Feedback",
      path: "/submit-feedback",
      icon: <Plus className="w-4 h-4 mr-2" />,
      highlight: true,
    },
  ];

  if (isAdmin) {
    navItems.push({
      name: "Admin Dashboard",
      path: "/admin",
      icon: <PanelRight className="w-4 h-4 mr-2" />,
    });
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <nav className="flex flex-col gap-4 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center px-2 py-2 text-sm rounded-md hover:bg-accent ${
                      isActive(item.path)
                        ? "bg-accent font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          <Link to="/" className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">LocalPulse</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="mx-8 hidden lg:flex items-center gap-4 lg:gap-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`text-sm transition-colors hover:text-primary ${
                isActive(item.path)
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              } ${
                item.highlight
                  ? "bg-primary text-white px-3 py-1.5 rounded-md hover:bg-primary/90 hover:text-white"
                  : ""
              }`}
            >
              <span className="flex items-center">
                {item.highlight ? item.icon : null}
                {item.name}
              </span>
            </Link>
          ))}
        </nav>

        <div>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.name ? getInitials(user.name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {user.name || user.email}
                  <p className="text-xs text-muted-foreground mt-1">
                    {isAdmin ? "Administrator" : "Resident"}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer w-full">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
              <LogIn className="mr-2 h-4 w-4" />
              <span>Login</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
