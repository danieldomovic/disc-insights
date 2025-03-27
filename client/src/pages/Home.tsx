import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { ColorProfile } from "@/components/ColorProfile";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <motion.section 
      className="max-w-4xl mx-auto px-4 sm:px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Discover Your Color Energy Profile</h2>
            <p className="max-w-2xl mx-auto text-gray-600">
              The Insights Discovery model helps you understand your preferred working style, 
              communication preferences, and how you interact with others. By identifying your 
              color energy preferences, you'll gain valuable insights into your strengths and 
              potential areas for development.
            </p>
          </div>
          
          {/* Color profiles in a single line with increased padding */}
          <div className="flex flex-wrap justify-center gap-6 mb-10 p-4">
            <ColorProfile color="fiery-red" />
            <ColorProfile color="sunshine-yellow" />
            <ColorProfile color="earth-green" />
            <ColorProfile color="cool-blue" />
          </div>
          
          <div className="text-center">
            <p className="mb-6 max-w-2xl mx-auto">
              This assessment consists of 25 questions and takes approximately 10 minutes to complete. 
              There are no right or wrong answers – just choose the response that best describes you.
            </p>
            
            <Link href="/quiz">
              <Button className="px-8 py-6 text-lg rounded-lg shadow-lg transform transition-transform hover:scale-105">
                Start Assessment
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.section>
  );
}
