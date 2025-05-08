import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  RefreshCw, 
  User, 
  LogOut, 
  BarChart2, 
  Users, 
  FileText,
  Loader2
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Header() {
  const [location] = useLocation();
  const showRestartButton = location === "/quiz" || location.startsWith("/results");
  const { user, logoutMutation } = useAuth();
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href={user ? "/dashboard" : "/"}>
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="flex items-center gap-1">
              {/* Fiery Red - top-right rounded */}
              <div className="w-8 h-8 bg-[#E23D28] rounded-tr-2xl"></div>
              {/* Sunshine Yellow - bottom-right rounded */}
              <div className="w-8 h-8 bg-[#F2CF1D] rounded-br-2xl"></div>
              {/* Earth Green - bottom-left rounded */}
              <div className="w-8 h-8 bg-[#42A640] rounded-bl-2xl"></div>
              {/* Cool Blue - top-left rounded */}
              <div className="w-8 h-8 bg-[#1C77C3] rounded-tl-2xl"></div>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Insights Discovery
            </h1>
          </div>
        </Link>
        
        <div className="flex items-center gap-4">
          {showRestartButton && (
            <div className="flex gap-2">
              <Link href={user ? "/dashboard" : "/"}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 rounded-full border-indigo-200 hover:bg-indigo-50"
                >
                  <RefreshCw className="h-4 w-4 text-indigo-600" />
                  <span className="text-indigo-700">Home</span>
                </Button>
              </Link>
              {user && (
                <Link href="/dashboard">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-2 rounded-full border-indigo-200 hover:bg-indigo-50"
                  >
                    <User className="h-4 w-4 text-indigo-600" />
                    <span className="text-indigo-700">My Dashboard</span>
                  </Button>
                </Link>
              )}
            </div>
          )}
          
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user ? getInitials(user.fullName) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuLabel className="font-normal text-xs text-muted-foreground truncate">
                  {user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <Link href="/profile">
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/reports">
                    <DropdownMenuItem>
                      <FileText className="mr-2 h-4 w-4" />
                      <span>My Reports</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/teams">
                    <DropdownMenuItem>
                      <Users className="mr-2 h-4 w-4" />
                      <span>My Teams</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/comparisons">
                    <DropdownMenuItem>
                      <BarChart2 className="mr-2 h-4 w-4" />
                      <span>Comparisons</span>
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Logging out...</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {!user && location !== "/auth" && (
            <Link href="/auth">
              <Button size="sm" variant="default">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
