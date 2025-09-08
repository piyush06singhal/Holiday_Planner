import React from 'react';
import { Brain, Linkedin, Twitter, Github } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white/80 backdrop-blur-xl border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-lg shadow-lg animate-pulse">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                AI Holiday Planner
              </span>
            </div>
            <p className="text-gray-600 max-w-md">
              Revolutionizing how students and employees balance attendance requirements with personal time through the power of artificial intelligence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/" className="block text-gray-600 hover:text-violet-600 transition-colors duration-300">
                Home
              </Link>
              <Link to="/calculator" className="block text-gray-600 hover:text-violet-600 transition-colors duration-300">
                Calculator
              </Link>
              <Link to="/overview" className="block text-gray-600 hover:text-violet-600 transition-colors duration-300">
                Overview
              </Link>
            </div>
          </div>
        </div>

        {/* Connect Section */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-gray-900 font-semibold mb-4">Connect with Developer</h3>
          <div className="flex flex-wrap gap-6">
            <a
              href="https://www.linkedin.com/in/piyush--singhal/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-gray-600 hover:text-violet-600 transition-colors duration-300 hover:scale-105"
            >
              <Linkedin className="h-4 w-4" />
              <span>LinkedIn</span>
            </a>
            <a
              href="https://x.com/PiyushS07508112"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-gray-600 hover:text-violet-600 transition-colors duration-300 hover:scale-105"
            >
              <Twitter className="h-4 w-4" />
              <span>Twitter</span>
            </a>
            <a
              href="https://github.com/piyush06singhal"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-gray-600 hover:text-violet-600 transition-colors duration-300 hover:scale-105"
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </a>
            <div className="text-gray-600">
              <span className="text-sm">Email: piyush.singhal.1204@gmail.com</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
