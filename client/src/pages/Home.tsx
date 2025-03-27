import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { ColorProfile } from "@/components/ColorProfile";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <motion.section 
      className="max-w-3xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold mb-4">Discover Your Color Energy Profile</h2>
          <p className="mb-6">
            The Insights Discovery model helps you understand your preferred working style, 
            communication preferences, and how you interact with others. By identifying your 
            color energy preferences, you'll gain valuable insights into your strengths and 
            potential areas for development.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <ColorProfile color="fiery-red" />
            <ColorProfile color="sunshine-yellow" />
            <ColorProfile color="earth-green" />
            <ColorProfile color="cool-blue" />
          </div>
          
          <p className="mb-6">
            This assessment consists of 25 questions and takes approximately 10 minutes to complete. 
            There are no right or wrong answers – just choose the response that best describes you.
          </p>
          
          <Link href="/quiz">
            <Button className="w-full md:w-auto px-6 py-3">
              Start Assessment
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.section>
  );
}
