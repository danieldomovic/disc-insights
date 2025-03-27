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
            <div className="flex items-center gap-1">
              {/* Fiery Red - top-right rounded */}
              <div className="w-8 h-8 bg-[#E23D28] rounded-tr-lg"></div>
              {/* Sunshine Yellow - bottom-right rounded */}
              <div className="w-8 h-8 bg-[#F2CF1D] rounded-br-lg"></div>
              {/* Earth Green - bottom-left rounded */}
              <div className="w-8 h-8 bg-[#42A640] rounded-bl-lg"></div>
              {/* Cool Blue - top-left rounded */}
              <div className="w-8 h-8 bg-[#1C77C3] rounded-tl-lg"></div>
            </div>
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
