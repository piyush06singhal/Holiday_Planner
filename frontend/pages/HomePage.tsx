import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calculator, Calendar, TrendingUp, Shield, Zap, Sparkles, Brain, Bot } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-violet-400/30 via-purple-400/30 to-fuchsia-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-emerald-400/30 via-teal-400/30 to-cyan-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-r from-amber-400/20 via-orange-400/20 to-rose-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-gradient-to-r from-indigo-400/20 to-violet-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-6000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="h-10 w-10 text-violet-600 mr-3 animate-pulse" />
              <span className="text-violet-600 font-medium text-xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                AI-Powered Holiday Planning
              </span>
              <Sparkles className="h-10 w-10 text-emerald-600 ml-3 animate-pulse" />
            </div>
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 via-fuchsia-600 to-rose-600 bg-clip-text text-transparent mb-8 leading-tight animate-bounce-slow">
              Plan Smarter Holidays with AI
            </h1>
            <p className="text-2xl md:text-3xl text-gray-700 max-w-4xl mx-auto leading-relaxed animate-slide-up">
              Optimize attendance, manage leaves, and get AI-powered recommendations for students and employees.
            </p>
          </div>
          
          <div className="flex justify-center items-center mb-20 animate-float">
            <Link to="/calculator">
              <Button className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600 text-white px-12 py-6 text-2xl font-semibold rounded-2xl shadow-2xl hover:shadow-violet-500/40 transition-all duration-500 hover:scale-110 group transform-gpu">
                <Calculator className="mr-3 h-7 w-7 group-hover:rotate-12 transition-transform duration-300" />
                Start Planning
              </Button>
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            <Card className="p-10 bg-white/90 backdrop-blur-xl border-2 border-gray-300 hover:border-violet-400 transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-violet-500/30 group transform-gpu animate-slide-up">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-125 transition-transform duration-500 shadow-2xl animate-spin-slow">
                  <Calendar className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Calendar</h3>
                <p className="text-gray-700 text-lg">
                  Visualize your semester or work year with intelligent calendar views tailored for students and employees.
                </p>
              </div>
            </Card>

            <Card className="p-10 bg-white/90 backdrop-blur-xl border-2 border-gray-300 hover:border-emerald-400 transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-emerald-500/30 group transform-gpu animate-slide-up animation-delay-2000">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-125 transition-transform duration-500 shadow-2xl animate-spin-slow">
                  <TrendingUp className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Predictions</h3>
                <p className="text-gray-700 text-lg">
                  Get intelligent forecasts about your attendance and personalized recommendations for optimal leave planning.
                </p>
              </div>
            </Card>

            <Card className="p-10 bg-white/90 backdrop-blur-xl border-2 border-gray-300 hover:border-green-400 transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-green-500/30 group transform-gpu animate-slide-up animation-delay-4000">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-125 transition-transform duration-500 shadow-2xl animate-spin-slow">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Risk Protection</h3>
                <p className="text-gray-700 text-lg">
                  Never fall below attendance thresholds with AI-powered warnings and proactive notifications.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-20 px-4 bg-white/80 backdrop-blur-xl relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-8 animate-bounce-slow">
              Powered by Advanced AI
            </h2>
            <p className="text-2xl text-gray-700 max-w-4xl mx-auto">
              Our intelligent system learns from your patterns and provides personalized insights to help you make the best decisions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-10 animate-slide-left">
              <div className="flex items-start space-x-6 group hover:scale-105 transition-transform duration-500">
                <div className="w-16 h-16 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-125 transition-transform duration-500 shadow-2xl animate-pulse">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Smart Planning</h3>
                  <p className="text-gray-700 text-lg">
                    Get intelligent recommendations for the best times to take holidays based on your schedule and requirements.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-6 group hover:scale-105 transition-transform duration-500">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-125 transition-transform duration-500 shadow-2xl animate-pulse">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Smart Recommendations</h3>
                  <p className="text-gray-700 text-lg">
                    Receive personalized suggestions for the best times to take leave based on your schedule and attendance requirements.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-6 group hover:scale-105 transition-transform duration-500">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-125 transition-transform duration-500 shadow-2xl animate-pulse">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Proactive Alerts</h3>
                  <p className="text-gray-700 text-lg">
                    Stay ahead with intelligent notifications that warn you before you risk falling below attendance thresholds.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative animate-slide-right">
              <Card className="p-10 bg-white/90 backdrop-blur-xl border-2 border-gray-300 shadow-2xl hover:shadow-violet-500/30 transition-all duration-500 hover:scale-105 transform-gpu animate-float">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-violet-500 rounded-full flex items-center justify-center animate-pulse">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 bg-gradient-to-r from-gray-100 to-violet-100 rounded-lg p-4 shadow-sm backdrop-blur-sm border border-gray-300">
                      <p className="text-gray-800 font-medium">How many leaves can I take this semester?</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 bg-gradient-to-r from-gray-100 to-emerald-100 rounded-lg p-4 shadow-sm backdrop-blur-sm border border-gray-300">
                      <p className="text-gray-800 font-medium">Based on your 75% requirement, you can safely take 15 days off while maintaining good attendance. I recommend planning them around exam periods!</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-violet-500 rounded-full flex items-center justify-center animate-pulse">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 bg-gradient-to-r from-gray-100 to-violet-100 rounded-lg p-4 shadow-sm backdrop-blur-sm border border-gray-300">
                      <p className="text-gray-800 font-medium">What's the safest time for a week-long holiday?</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-8 animate-bounce-slow">
            Ready to Plan Smarter?
          </h2>
          <p className="text-2xl text-gray-700 mb-12">
            Join thousands of students and employees who are already using AI to optimize their attendance and holiday planning.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/calculator">
              <Button className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600 text-white px-16 py-8 text-2xl font-semibold rounded-2xl shadow-2xl hover:shadow-violet-500/40 transition-all duration-500 hover:scale-110 transform-gpu animate-float">
                Start Planning Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-left {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slide-right {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .animate-slide-up {
          animation: slide-up 1s ease-out;
        }
        
        .animate-slide-left {
          animation: slide-left 1s ease-out;
        }
        
        .animate-slide-right {
          animation: slide-right 1s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 1.5s ease-out;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animation-delay-6000 {
          animation-delay: 6s;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
