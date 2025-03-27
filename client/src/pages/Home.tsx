import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ColorProfile } from "@/components/ColorProfile";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <motion.div
      className="min-h-[calc(100vh-4rem)] flex flex-col items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Section */}
      <div className="w-full bg-gradient-to-b from-slate-50 to-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 leading-tight md:leading-snug pb-2"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            Discover Your Color Energy Profile
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-slate-700 mb-10 max-w-2xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            Unlock your potential by understanding your unique personality traits and 
            communication style through the Insights Discovery color framework.
          </motion.p>
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Link href="/quiz">
              <Button size="lg" className="px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                <span>Start Your Assessment</span>
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">The Four Color Energies</h2>
          <p className="text-slate-600 max-w-3xl mx-auto">
            The Insights Discovery model helps you understand your preferred working style, 
            communication preferences, and how you interact with others.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <ColorProfile color="fiery-red" />
          <ColorProfile color="sunshine-yellow" />
          <ColorProfile color="earth-green" />
          <ColorProfile color="cool-blue" />
        </div>
        
        <div className="bg-slate-50 p-8 rounded-2xl text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Begin?</h3>
          <p className="mb-6 max-w-2xl mx-auto">
            This assessment consists of 25 questions and takes approximately 10 minutes to complete. 
            There are no right or wrong answers – just choose the response that best describes you.
          </p>
          
          <Link href="/quiz">
            <Button size="lg" className="px-6 py-3 font-medium">
              Start Assessment Now
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
