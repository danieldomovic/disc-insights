import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { motion } from "framer-motion";

export default function WelcomePage() {
  const { user } = useAuth();
  
  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Redirect to="/dashboard" />;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex">
        {/* Left side - Welcome message and options */}
        <motion.div 
          className="w-full md:w-1/2 flex flex-col justify-center px-8 py-12 md:px-16"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover Your DISC Profile
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Uncover insights about your personality and work style with our Insights Discovery-based assessment.
          </p>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                <div className="w-5 h-5 bg-primary rounded-full"></div>
              </div>
              <div>
                <h3 className="font-medium">Professional-Grade Assessment</h3>
                <p className="text-gray-600">Based on the proven Insights Discovery methodology used by Fortune 500 companies.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                <div className="w-5 h-5 bg-primary rounded-full"></div>
              </div>
              <div>
                <h3 className="font-medium">Personalized Results</h3>
                <p className="text-gray-600">Get detailed insights into your unique personality traits and preferences.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                <div className="w-5 h-5 bg-primary rounded-full"></div>
              </div>
              <div>
                <h3 className="font-medium">Team Collaboration</h3>
                <p className="text-gray-600">Create an account to compare profiles and improve team dynamics.</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/auth">
              <Button size="lg" className="w-full sm:w-auto">
                Sign In / Create Account
              </Button>
            </Link>
            <Link href="/quiz">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Continue as Guest
              </Button>
            </Link>
          </div>
        </motion.div>
        
        {/* Right side - Color profile visualization */}
        <motion.div 
          className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary-foreground to-primary items-center justify-center relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <div className="absolute inset-0 bg-grid-white/[0.2] bg-[length:20px_20px]"></div>
          <div className="relative p-8 max-w-md text-center">
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto">
                <div className="grid grid-cols-2 gap-2">
                  <div className="w-10 h-10 bg-[#E23D28] rounded-tr-2xl"></div>
                  <div className="w-10 h-10 bg-[#F2CF1D] rounded-br-2xl"></div>
                  <div className="w-10 h-10 bg-[#42A640] rounded-bl-2xl"></div>
                  <div className="w-10 h-10 bg-[#1C77C3] rounded-tl-2xl"></div>
                </div>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold mb-4 text-white">Color Personality Types</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <div className="w-12 h-12 rounded-full bg-red-500 mb-2 mx-auto"></div>
                <h3 className="text-white font-semibold mb-1">Fiery Red</h3>
                <p className="text-white/80 text-sm">Bold, assertive, results-focused</p>
              </div>
              
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <div className="w-12 h-12 rounded-full bg-yellow-400 mb-2 mx-auto"></div>
                <h3 className="text-white font-semibold mb-1">Sunshine Yellow</h3>
                <p className="text-white/80 text-sm">Sociable, dynamic, persuasive</p>
              </div>
              
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <div className="w-12 h-12 rounded-full bg-green-500 mb-2 mx-auto"></div>
                <h3 className="text-white font-semibold mb-1">Earth Green</h3>
                <p className="text-white/80 text-sm">Caring, patient, relaxed</p>
              </div>
              
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <div className="w-12 h-12 rounded-full bg-blue-500 mb-2 mx-auto"></div>
                <h3 className="text-white font-semibold mb-1">Cool Blue</h3>
                <p className="text-white/80 text-sm">Analytical, precise, deliberate</p>
              </div>
            </div>
            
            <p className="text-white/90">
              Take the assessment to discover which color energies resonate with you!
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}