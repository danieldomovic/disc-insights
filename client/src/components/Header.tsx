import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function Header() {
  const [location] = useLocation();
  const showRestartButton = location !== "/";
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
        <div className="w-full flex justify-center md:justify-start mb-4 md:mb-0">
          <Link href="/">
            <div className="flex flex-col items-center cursor-pointer">
              {/* Creative logo with rectangles */}
              <div className="flex mb-2">
                <div className="w-10 h-10 transform rotate-45 bg-[#E23D28] m-1"></div>
                <div className="w-10 h-10 transform rotate-45 bg-[#F2CF1D] m-1"></div>
                <div className="w-10 h-10 transform rotate-45 bg-[#42A640] m-1"></div>
                <div className="w-10 h-10 transform rotate-45 bg-[#1C77C3] m-1"></div>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-center">Insights Discovery</h1>
            </div>
          </Link>
        </div>
        <nav className="w-full md:w-auto flex justify-center md:justify-end">
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
