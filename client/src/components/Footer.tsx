import { Link } from "wouter";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-50 border-t mt-12">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center mb-4">
              <div className="flex space-x-1 mr-2">
                <div className="w-5 h-5 bg-[#E23D28] rounded-tl-lg"></div>
                <div className="w-5 h-5 bg-[#F2CF1D] rounded-tr-lg"></div>
                <div className="w-5 h-5 bg-[#42A640] rounded-bl-lg"></div>
                <div className="w-5 h-5 bg-[#1C77C3] rounded-br-lg"></div>
              </div>
              <span className="text-lg font-semibold">Insights Discovery</span>
            </div>
            <p className="text-gray-600 text-sm max-w-md">
              Discover your color energy profile and gain valuable insights into your 
              preferred working style, communication preferences, and interactions with others.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 sm:gap-12">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/quiz" className="text-gray-600 hover:text-gray-900 text-sm">
                    Take the Quiz
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">About Colors</a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Colors</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-[#E23D28] hover:text-red-700 font-medium text-sm">Fiery Red</a>
                </li>
                <li>
                  <a href="#" className="text-[#F2CF1D] hover:text-yellow-600 font-medium text-sm">Sunshine Yellow</a>
                </li>
                <li>
                  <a href="#" className="text-[#42A640] hover:text-green-700 font-medium text-sm">Earth Green</a>
                </li>
                <li>
                  <a href="#" className="text-[#1C77C3] hover:text-blue-700 font-medium text-sm">Cool Blue</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="pt-8 mt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-xs">
            &copy; {currentYear} Insights Discovery Assessment. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Privacy Policy</span>
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Terms of Service</span>
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}