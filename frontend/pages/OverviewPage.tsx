import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  Calculator, 
  Bot, 
  Calendar, 
  Download, 
  TrendingUp, 
  Shield, 
  Users,
  Zap,
  CheckCircle,
  GraduationCap,
  Briefcase,
  Target,
  Brain,
  Sparkles,
  AlertTriangle,
  CalendarDays,
  BarChart3
} from 'lucide-react';

const OverviewPage = () => {
  const features = [
    {
      icon: Calculator,
      title: "AI Attendance Calculator",
      description: "Intelligent calculation engine that analyzes your attendance requirements and provides personalized recommendations for optimal leave planning.",
      benefits: [
        "Smart attendance percentage calculations",
        "Personalized leave recommendations",
        "Risk assessment and warnings",
        "Multiple scenario planning"
      ],
      gradient: "from-violet-500 via-purple-500 to-fuchsia-500"
    },
    {
      icon: Calendar,
      title: "Holiday Planner",
      description: "Interactive calendar views that help you visualize your attendance, planned leaves, and important dates at a glance.",
      benefits: [
        "Visual attendance tracking",
        "Leave planning interface",
        "Important date highlights",
        "Monthly/yearly overviews"
      ],
      gradient: "from-emerald-500 via-teal-500 to-cyan-500"
    },
    {
      icon: Bot,
      title: "AI Advisor",
      description: "24/7 intelligent chatbot that answers your attendance questions and provides instant guidance on holiday planning.",
      benefits: [
        "Natural language queries",
        "Instant responses",
        "Context-aware assistance",
        "Auto-popup reminders"
      ],
      gradient: "from-green-500 via-emerald-500 to-teal-500"
    }
  ];

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-indigo-50 via-purple-50 via-pink-50 to-rose-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-violet-400/30 to-purple-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-emerald-400/30 to-teal-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-r from-rose-400/30 to-pink-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-6000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-20 animate-fade-in">
          <div className="flex items-center justify-center mb-8">
            <Sparkles className="h-10 w-10 text-violet-600 mr-3 animate-pulse" />
            <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
              AI-Powered Holiday Planning
            </span>
            <Sparkles className="h-10 w-10 text-emerald-600 ml-3 animate-pulse" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 via-fuchsia-600 to-rose-600 bg-clip-text text-transparent mb-8 leading-tight animate-bounce-slow">
            Project Overview
          </h1>
          <p className="text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed animate-slide-up">
            Revolutionizing how students and employees balance attendance requirements with personal time through the power of artificial intelligence.
          </p>
        </div>

        {/* Mission Section */}
        <Card className="p-16 mb-20 bg-white/90 backdrop-blur-xl border-2 border-violet-300 shadow-2xl hover:shadow-violet-500/30 transition-all duration-500 hover:scale-105 transform-gpu animate-float">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl animate-spin-slow">
              <Target className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-emerald-600 bg-clip-text text-transparent mb-8">Our Mission</h2>
            <p className="text-xl text-gray-700 max-w-5xl mx-auto leading-relaxed">
              We believe that everyone deserves to enjoy their holidays and personal time without the stress of attendance worries. 
              Our AI-powered platform helps students maintain their academic requirements and employees meet their professional 
              obligations while maximizing their opportunities for rest, travel, and personal growth.
            </p>
          </div>
        </Card>

        {/* Problem & Solution */}
        <div className="grid md:grid-cols-2 gap-16 mb-20">
          <Card className="p-10 bg-white/90 backdrop-blur-xl border-2 border-red-400 shadow-2xl hover:shadow-red-500/30 transition-all duration-500 hover:scale-105 transform-gpu animate-slide-left">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-red-600">The Problem</h3>
            </div>
            <div className="space-y-6 text-gray-700">
              <p className="text-lg leading-relaxed">
                <strong className="text-red-600">Students</strong> struggle to balance their academic attendance requirements with personal time, 
                often missing out on important family events, travel opportunities, or mental health breaks.
              </p>
              <p className="text-lg leading-relaxed">
                <strong className="text-red-600">Employees</strong> face similar challenges in corporate environments, where attendance policies 
                can make it difficult to plan vacations or take necessary personal days without risking their standing.
              </p>
              <p className="text-lg leading-relaxed">
                Traditional planning methods are manual, error-prone, and don't provide the intelligent insights 
                needed to make optimal decisions about when to take time off.
              </p>
            </div>
          </Card>

          <Card className="p-10 bg-white/90 backdrop-blur-xl border-2 border-green-400 shadow-2xl hover:shadow-green-500/30 transition-all duration-500 hover:scale-105 transform-gpu animate-slide-right">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-green-600">Our Solution</h3>
            </div>
            <div className="space-y-6 text-gray-700">
              <p className="text-lg leading-relaxed">
                <strong className="text-green-600">AI-Powered Analysis:</strong> Our intelligent algorithms analyze your specific situation 
                and provide personalized recommendations for optimal leave planning.
              </p>
              <p className="text-lg leading-relaxed">
                <strong className="text-green-600">Proactive Monitoring:</strong> Never worry about falling below attendance thresholds again. 
                Our system continuously monitors your status and alerts you before any risks.
              </p>
              <p className="text-lg leading-relaxed">
                <strong className="text-green-600">Smart Recommendations:</strong> Get AI-driven suggestions for the best times to take holidays 
                based on your schedule, workload, and personal preferences.
              </p>
            </div>
          </Card>
        </div>

        {/* How It Helps */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-16 animate-bounce-slow">
            How We Help Students & Employees
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Students */}
            <Card className="p-10 bg-gradient-to-br from-violet-100 via-purple-100 to-fuchsia-100 border-2 border-violet-400 backdrop-blur-xl shadow-2xl hover:shadow-violet-500/40 transition-all duration-500 hover:scale-105 transform-gpu animate-float">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-full flex items-center justify-center shadow-xl animate-spin-slow">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-violet-700">For Students</h3>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4 group hover:scale-105 transition-transform duration-300">
                  <Calendar className="h-6 w-6 text-violet-600 mt-1 flex-shrink-0 group-hover:animate-bounce" />
                  <div>
                    <h4 className="font-semibold text-violet-700 text-lg">Semester Planning</h4>
                    <p className="text-violet-600">Plan your entire semester with confidence, knowing exactly when you can safely take breaks.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 group hover:scale-105 transition-transform duration-300">
                  <TrendingUp className="h-6 w-6 text-violet-600 mt-1 flex-shrink-0 group-hover:animate-bounce" />
                  <div>
                    <h4 className="font-semibold text-violet-700 text-lg">Academic Success</h4>
                    <p className="text-violet-600">Maintain your required attendance percentage while still having time for personal activities.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 group hover:scale-105 transition-transform duration-300">
                  <Brain className="h-6 w-6 text-violet-600 mt-1 flex-shrink-0 group-hover:animate-bounce" />
                  <div>
                    <h4 className="font-semibold text-violet-700 text-lg">Smart Timing</h4>
                    <p className="text-violet-600">Get AI recommendations for the best times to take study breaks or family trips.</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Employees */}
            <Card className="p-10 bg-gradient-to-br from-emerald-100 via-teal-100 to-cyan-100 border-2 border-emerald-400 backdrop-blur-xl shadow-2xl hover:shadow-emerald-500/40 transition-all duration-500 hover:scale-105 transform-gpu animate-float animation-delay-2000">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full flex items-center justify-center shadow-xl animate-spin-slow">
                  <Briefcase className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-emerald-700">For Employees</h3>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4 group hover:scale-105 transition-transform duration-300">
                  <Calendar className="h-6 w-6 text-emerald-600 mt-1 flex-shrink-0 group-hover:animate-bounce" />
                  <div>
                    <h4 className="font-semibold text-emerald-700 text-lg">Annual Planning</h4>
                    <p className="text-emerald-600">Plan your entire work year, optimizing vacation time and personal days.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 group hover:scale-105 transition-transform duration-300">
                  <TrendingUp className="h-6 w-6 text-emerald-600 mt-1 flex-shrink-0 group-hover:animate-bounce" />
                  <div>
                    <h4 className="font-semibold text-emerald-700 text-lg">Career Protection</h4>
                    <p className="text-emerald-600">Meet your professional obligations while maximizing your work-life balance.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 group hover:scale-105 transition-transform duration-300">
                  <Brain className="h-6 w-6 text-emerald-600 mt-1 flex-shrink-0 group-hover:animate-bounce" />
                  <div>
                    <h4 className="font-semibold text-emerald-700 text-lg">Strategic Timing</h4>
                    <p className="text-emerald-600">AI-powered insights help you plan around project deadlines and team schedules.</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Main Features */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-16 animate-bounce-slow">
            Key Features
          </h2>
          
          <div className="grid md:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <Card key={index} className="p-10 bg-white/90 backdrop-blur-xl border-2 border-gray-300 hover:border-violet-400 transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-violet-500/30 group transform-gpu animate-float" style={{animationDelay: `${index * 1000}ms`}}>
                <div className="text-center">
                  <div className={`w-20 h-20 bg-gradient-to-r ${feature.gradient} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-125 transition-transform duration-500 shadow-2xl animate-pulse`}>
                    <feature.icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-700 mb-6 text-lg">{feature.description}</p>
                  <ul className="space-y-3">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center space-x-3 text-gray-700 group-hover:scale-105 transition-transform duration-300">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 animate-pulse" />
                        <span className="text-lg">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional Features */}
        <div className="grid md:grid-cols-3 gap-10 mb-20">
          <Card className="p-8 bg-white/90 backdrop-blur-xl border-2 border-gray-300 hover:border-green-400 transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-green-500/30 group text-center transform-gpu animate-slide-up">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-125 transition-transform duration-500 shadow-2xl animate-spin-slow">
              <Download className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Export Reports</h3>
            <p className="text-gray-700">Generate comprehensive PDF and Excel reports with your attendance analysis and AI recommendations.</p>
          </Card>

          <Card className="p-8 bg-white/90 backdrop-blur-xl border-2 border-gray-300 hover:border-blue-400 transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/30 group text-center transform-gpu animate-slide-up animation-delay-2000">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-125 transition-transform duration-500 shadow-2xl animate-spin-slow">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Analytics Dashboard</h3>
            <p className="text-gray-700">Visualize your attendance patterns and get insights into your leave-taking behavior over time.</p>
          </Card>

          <Card className="p-8 bg-white/90 backdrop-blur-xl border-2 border-gray-300 hover:border-violet-400 transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-violet-500/30 group text-center transform-gpu animate-slide-up animation-delay-4000">
            <div className="w-16 h-16 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-125 transition-transform duration-500 shadow-2xl animate-spin-slow">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Multi-User Support</h3>
            <p className="text-gray-700">Separate modes for students and employees with tailored features and recommendations for each.</p>
          </Card>
        </div>

        {/* AI-First Approach Section */}
        <Card className="p-16 bg-gradient-to-r from-violet-100 via-purple-100 via-fuchsia-100 to-rose-100 border-2 border-violet-400 backdrop-blur-xl shadow-2xl hover:shadow-violet-500/40 transition-all duration-500 hover:scale-105 transform-gpu animate-float">
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-gradient-to-r from-violet-500 via-purple-500 via-fuchsia-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl animate-spin-slow">
              <Zap className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-6">AI-First Approach</h2>
            <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
              Our platform is built from the ground up with artificial intelligence at its core, ensuring you get the most intelligent and personalized experience possible.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center group hover:scale-110 transition-transform duration-500">
              <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:animate-bounce">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Predictive Analytics</h3>
              <p className="text-gray-700 text-lg">
                Advanced algorithms predict optimal leave times and attendance patterns.
              </p>
            </div>

            <div className="text-center group hover:scale-110 transition-transform duration-500">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:animate-bounce">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Natural Language</h3>
              <p className="text-gray-700 text-lg">
                Communicate with our AI in plain English for instant, personalized assistance.
              </p>
            </div>

            <div className="text-center group hover:scale-110 transition-transform duration-500">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:animate-bounce">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Proactive Protection</h3>
              <p className="text-gray-700 text-lg">
                AI monitors your status 24/7 and alerts you before any attendance risks.
              </p>
            </div>
          </div>
        </Card>
      </div>

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

export default OverviewPage;
