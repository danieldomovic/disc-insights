import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Brain, User, LogIn } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Header() {
  const [location] = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Check if user is logged in
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/profile"],
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
    enabled: location !== "/auth", // Don't check on auth page
  });
  
  useEffect(() => {
    setIsLoggedIn(!!user);
  }, [user]);
  
  return (
    <header className="bg-white py-4 border-b border-gray-100">
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center cursor-pointer">
            <div className="mr-2">
              {/* Logo with 4 color quadrants */}
              <div className="w-8 h-8 relative">
                <svg viewBox="0 0 40 40" width="40" height="40" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 20 A20 20 0 0 1 20 0 L20 20 Z" fill="#1C77C3" />
                  <path d="M20 0 A20 20 0 0 1 40 20 L20 20 Z" fill="#F2CF1D" />
                  <path d="M40 20 A20 20 0 0 1 20 40 L20 20 Z" fill="#E23D28" />
                  <path d="M20 40 A20 20 0 0 1 0 20 L20 20 Z" fill="#42A640" />
                  <circle cx="20" cy="20" r="5" fill="white" />
                </svg>
              </div>
            </div>
            <h1 className="text-xl font-bold text-gray-800">InsightfulTraits</h1>
          </div>
        </Link>
        
        {/* Navigation items */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/quiz">
            <span className="text-gray-700 font-medium hover:text-purple-600 cursor-pointer">
              PERSONALITY TEST
            </span>
          </Link>
          <span className="text-gray-700 font-medium hover:text-purple-600 cursor-pointer">
            PERSONALITY TYPES
          </span>
          <span className="text-gray-700 font-medium hover:text-purple-600 cursor-pointer">
            RESOURCES
          </span>
          <span className="text-gray-700 font-medium hover:text-purple-600 cursor-pointer">
            ABOUT
          </span>
        </nav>
        
        {/* Auth buttons */}
        <div className="flex items-center gap-3">
          {!isLoading && (
            isLoggedIn ? (
              <Link href="/profile">
                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-purple-600">
                  <User className="h-4 w-4" />
                  My Profile
                </Button>
              </Link>
            ) : (
              <Link href="/auth">
                <Button variant="outline" size="sm" className="border-red-400 text-red-500 hover:bg-red-50">
                  Login
                </Button>
              </Link>
            )
          )}
          
          <Link href="/quiz">
            <Button className="bg-red-500 hover:bg-red-600 text-white">
              Take Your Test
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
