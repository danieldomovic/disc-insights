import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { RefreshCw, User, LogIn } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Header() {
  const [location] = useLocation();
  const showRestartButton = location !== "/" && location !== "/profile" && location !== "/auth";
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
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-6 py-5 flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center cursor-pointer">
            {/* Creative logo with rectangles - each with one rounded corner */}
            <div className="flex space-x-1 mr-3">
              <div className="w-8 h-8 bg-[#E23D28] rounded-tl-xl"></div>
              <div className="w-8 h-8 bg-[#F2CF1D] rounded-tr-xl"></div>
              <div className="w-8 h-8 bg-[#42A640] rounded-bl-xl"></div>
              <div className="w-8 h-8 bg-[#1C77C3] rounded-br-xl"></div>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#1C77C3] via-[#42A640] to-[#E23D28] text-transparent bg-clip-text">Insights Discovery</h1>
          </div>
        </Link>
        <nav className="flex items-center gap-3">
          {showRestartButton && (
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Restart Quiz
              </Button>
            </Link>
          )}
          
          {!isLoading && (
            isLoggedIn ? (
              <Link href="/profile">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  My Profile
                </Button>
              </Link>
            ) : (
              <Link href="/auth">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
