import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <motion.section 
        className="max-w-6xl mx-auto px-4 py-16 sm:px-6 sm:py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Get Ready To Discover <span className="text-purple-600">Your True Potential</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-700 mb-10 max-w-3xl mx-auto">
            It takes less than 10 minutes to get a detailed understanding of your personality and the reasons you 
            do the things you do. Take a peek into your mind!
          </p>
          
          <Link href="/quiz">
            <Button className="rounded-full px-8 py-6 text-xl uppercase font-medium bg-red-500 hover:bg-red-600 text-white shadow-md group">
              Take Your Test <ChevronRight className="h-6 w-6 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
        
        {/* Circular personality type illustrations */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-8">
          {/* Cool Blue personality */}
          <div className="flex justify-center">
            <div className="w-64 h-64 rounded-full bg-blue-200 flex items-center justify-center overflow-hidden relative shadow-lg">
              <div className="absolute inset-0 opacity-20">
                <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="40" cy="40" r="10" fill="#1C77C3" />
                  <path d="M30 80 L50 70 L60 90 Z" fill="#1C77C3" />
                  <rect x="120" y="30" width="30" height="30" fill="#1C77C3" opacity="0.5" />
                  <path d="M140 120 Q160 140 140 160" stroke="#1C77C3" strokeWidth="3" fill="none" />
                  <circle cx="80" cy="150" r="15" fill="#1C77C3" opacity="0.3" />
                  <path d="M10 140 L30 160 L50 140" stroke="#1C77C3" strokeWidth="2" fill="none" />
                </svg>
              </div>
              <div className="z-10 flex flex-col items-center justify-center">
                <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="mb-3">
                  <g transform="translate(20, 0)">
                    <path d="M30 20 C35 15, 45 15, 50 20 C52 22, 52 25, 50 30 C48 34, 32 34, 30 30 C28 25, 28 22, 30 20Z" fill="#1C77C3" />
                    <circle cx="35" cy="24" r="2" fill="white" />
                    <circle cx="45" cy="24" r="2" fill="white" />
                    <path d="M38 28 L42 28" stroke="white" strokeWidth="1" />
                    <path d="M30 35 L50 35 L50 70 L30 70 Z" fill="#1C77C3" />
                    <path d="M20 40 L30 50 L30 70 L20 60 Z" fill="#1C77C3" />
                    <path d="M60 40 L50 50 L50 70 L60 60 Z" fill="#1C77C3" />
                    <path d="M30 70 L35 95 L45 95 L50 70" fill="#374151" />
                    <rect x="35" y="40" width="10" height="15" fill="white" />
                    <path d="M30 50 L35 45 L45 45 L50 50" fill="none" stroke="#1E3A8A" strokeWidth="1" />
                  </g>
                </svg>
                <h3 className="font-bold text-lg text-blue-800">Analytical Thinker</h3>
                <p className="text-xs text-blue-700 mt-1">Cool Blue</p>
              </div>
            </div>
          </div>
          
          {/* Earth Green personality */}
          <div className="flex justify-center">
            <div className="w-64 h-64 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden relative shadow-lg">
              <div className="absolute inset-0 opacity-20">
                <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <path d="M40 40 L60 60 L40 80 L20 60 Z" fill="#42A640" />
                  <circle cx="140" cy="40" r="20" fill="#42A640" opacity="0.5" />
                  <path d="M140 100 Q160 120 140 140" stroke="#42A640" strokeWidth="3" fill="none" />
                  <rect x="30" y="120" width="40" height="20" rx="10" fill="#42A640" opacity="0.3" />
                  <path d="M90 160 L100 140 L110 160" stroke="#42A640" strokeWidth="2" fill="none" />
                </svg>
              </div>
              <div className="z-10 flex flex-col items-center justify-center">
                <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="mb-3">
                  <g transform="translate(20, 0)">
                    <path d="M30 20 C35 15, 45 15, 50 20 C52 22, 52 25, 50 30 C48 34, 32 34, 30 30 C28 25, 28 22, 30 20Z" fill="#166534" />
                    <circle cx="35" cy="24" r="2" fill="white" />
                    <circle cx="45" cy="24" r="2" fill="white" />
                    <path d="M38 28 C35 30, 45 30, 42 28" stroke="white" strokeWidth="1" fill="none" />
                    <path d="M30 35 L50 35 L50 70 L30 70 Z" fill="#166534" />
                    <path d="M20 40 L30 50 L30 70 L20 60 Z" fill="#42A640" />
                    <path d="M60 40 L50 50 L50 70 L60 60 Z" fill="#42A640" />
                    <path d="M30 70 L35 95 L45 95 L50 70" fill="#374151" />
                    <rect x="35" y="40" width="10" height="15" fill="white" />
                    <path d="M30 50 L50 50" fill="none" stroke="#166534" strokeWidth="1" />
                  </g>
                </svg>
                <h3 className="font-bold text-lg text-green-800">Thoughtful Helper</h3>
                <p className="text-xs text-green-700 mt-1">Earth Green</p>
              </div>
            </div>
          </div>
          
          {/* Fiery Red personality */}
          <div className="flex justify-center">
            <div className="w-64 h-64 rounded-full bg-red-200 flex items-center justify-center overflow-hidden relative shadow-lg">
              <div className="absolute inset-0 opacity-20">
                <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <path d="M60 40 Q90 20 120 40" stroke="#E23D28" strokeWidth="4" fill="none" />
                  <circle cx="40" cy="80" r="15" fill="#E23D28" opacity="0.5" />
                  <path d="M140 60 L160 80 L140 100 L120 80 Z" fill="#E23D28" opacity="0.6" />
                  <circle cx="60" cy="140" r="20" fill="#E23D28" opacity="0.3" />
                  <path d="M100 120 L120 140 L140 120" stroke="#E23D28" strokeWidth="3" fill="none" />
                </svg>
              </div>
              <div className="z-10 flex flex-col items-center justify-center">
                <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="mb-3">
                  <g transform="translate(20, 0)">
                    <path d="M30 20 C35 15, 45 15, 50 20 C52 22, 52 25, 50 30 C48 34, 32 34, 30 30 C28 25, 28 22, 30 20Z" fill="#991B1B" />
                    <circle cx="35" cy="24" r="2" fill="white" />
                    <circle cx="45" cy="24" r="2" fill="white" />
                    <path d="M35 29 L45 29" stroke="white" strokeWidth="1" />
                    <path d="M30 35 L50 35 L50 70 L30 70 Z" fill="#991B1B" />
                    <path d="M20 40 L30 50 L30 70 L20 60 Z" fill="#E23D28" />
                    <path d="M60 40 L50 50 L50 70 L60 60 Z" fill="#E23D28" />
                    <path d="M30 70 L35 95 L45 95 L50 70" fill="#374151" />
                    <rect x="35" y="40" width="10" height="15" fill="white" />
                    <path d="M35 45 L45 45" fill="none" stroke="#991B1B" strokeWidth="2" />
                    <path d="M35 50 L45 50" fill="none" stroke="#991B1B" strokeWidth="2" />
                  </g>
                </svg>
                <h3 className="font-bold text-lg text-red-800">Ambitious Achiever</h3>
                <p className="text-xs text-red-700 mt-1">Fiery Red</p>
              </div>
            </div>
          </div>
          
          {/* Sunshine Yellow personality */}
          <div className="flex justify-center">
            <div className="w-64 h-64 rounded-full bg-yellow-200 flex items-center justify-center overflow-hidden relative shadow-lg">
              <div className="absolute inset-0 opacity-20">
                <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="40" cy="40" r="20" fill="#F2CF1D" />
                  <circle cx="160" cy="40" r="15" fill="#F2CF1D" opacity="0.5" />
                  <path d="M100 60 Q120 90 100 120" stroke="#F2CF1D" strokeWidth="3" fill="none" />
                  <path d="M40 120 L60 140 L40 160" stroke="#F2CF1D" strokeWidth="2" fill="none" />
                  <circle cx="140" cy="140" r="10" fill="#F2CF1D" opacity="0.6" />
                </svg>
              </div>
              <div className="z-10 flex flex-col items-center justify-center">
                <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="mb-3">
                  <g transform="translate(20, 0)">
                    <path d="M30 20 C35 15, 45 15, 50 20 C52 22, 52 25, 50 30 C48 34, 32 34, 30 30 C28 25, 28 22, 30 20Z" fill="#854D0E" />
                    <circle cx="35" cy="24" r="2" fill="white" />
                    <circle cx="45" cy="24" r="2" fill="white" />
                    <path d="M35 29 C38 32, 42 32, 45 29" stroke="white" strokeWidth="1" fill="none" />
                    <path d="M30 35 L50 35 L50 70 L30 70 Z" fill="#854D0E" />
                    <path d="M20 40 L30 50 L30 70 L20 60 Z" fill="#F2CF1D" />
                    <path d="M60 40 L50 50 L50 70 L60 60 Z" fill="#F2CF1D" />
                    <path d="M30 70 L35 95 L45 95 L50 70" fill="#374151" />
                    <rect x="35" y="40" width="10" height="15" fill="white" />
                    <circle cx="40" cy="45" r="2" fill="#854D0E" />
                    <path d="M35 50 L45 50" fill="none" stroke="#854D0E" strokeWidth="1" />
                  </g>
                </svg>
                <h3 className="font-bold text-lg text-amber-800">Enthusiastic Motivator</h3>
                <p className="text-xs text-amber-700 mt-1">Sunshine Yellow</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
