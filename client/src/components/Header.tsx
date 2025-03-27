import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function Header() {
  const [location] = useLocation();
  const showRestartButton = location !== "/";
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center space-x-2 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-[#E23D28]"></div>
            <div className="w-8 h-8 rounded-full bg-[#F2CF1D]"></div>
            <div className="w-8 h-8 rounded-full bg-[#42A640]"></div>
            <div className="w-8 h-8 rounded-full bg-[#1C77C3]"></div>
            <h1 className="text-xl font-semibold ml-2">Insights Discovery</h1>
          </div>
        </Link>
        <nav>
          {showRestartButton && (
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Restart Quiz
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
