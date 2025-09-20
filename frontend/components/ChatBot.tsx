import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, Calendar, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';
import type { ChatRequest, ChatResponse } from '~backend/ai/chat';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  suggestions?: string[];
  recommendedDates?: string[];
}

interface ChatBotProps {
  attendanceData?: {
    totalDays: number;
    requiredDays: number;
    safeLeaveDays: number;
    attendanceRule: number;
    optimalLeaveDates?: Array<{
      startDate: string;
      endDate: string;
      duration: number;
      reason: string;
      aiScore: number;
      description: string;
    }>;
  };
  userType?: 'student' | 'employee';
}

const ChatBot: React.FC<ChatBotProps> = ({ attendanceData, userType: propUserType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<'student' | 'employee'>(propUserType || 'student');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-popup every 5 minutes with enhanced AI messaging
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) {
        setIsOpen(true);
        const welcomeMessage = attendanceData ? 
          `🤖 Hi! I see you've calculated your attendance data. You have ${attendanceData.safeLeaveDays} safe leave days available! I can help you optimize your holiday planning with AI-powered recommendations. What would you like to know?` :
          "🤖 Hi! I'm your AI Holiday Planning Assistant with advanced calendar integration! I can help you find optimal leave dates, analyze attendance risks, and create calendar-ready schedules. What would you like to plan today?";
          
        const suggestions = attendanceData ? 
          ["Analyze my calculated data", "Show optimal leave dates", "Plan my next vacation"] :
          ["When can I take my next vacation?", "Show me optimal holiday dates", "How does AI calendar integration work?"];
          
        const dates = attendanceData?.optimalLeaveDates ? 
          attendanceData.optimalLeaveDates.slice(0, 3).map(date => `${date.reason}: ${new Date(date.startDate).toLocaleDateString()}`) :
          ["This Friday: Perfect for long weekend", "Next month: Ideal travel period", "Quarter-end: Strategic break time"];
          
        addBotMessage(welcomeMessage, suggestions, dates);
      }
    }, 3 * 1000); // 3 seconds for faster interaction

    return () => clearTimeout(timer);
  }, [isOpen]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addBotMessage = (text: string, suggestions?: string[], recommendedDates?: string[]) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      isBot: true,
      timestamp: new Date(),
      suggestions,
      recommendedDates
    };
    setMessages(prev => [...prev, message]);
  };

  const addUserMessage = (text: string) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      isBot: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputValue.trim();
    if (!messageToSend) return;

    addUserMessage(messageToSend);
    setInputValue('');
    setIsLoading(true);

    try {
      const request: ChatRequest = {
        message: messageToSend,
        userType,
        attendanceData: attendanceData ? {
          totalDays: attendanceData.totalDays,
          requiredDays: attendanceData.requiredDays,
          safeLeaveDays: attendanceData.safeLeaveDays,
          attendanceRule: attendanceData.attendanceRule,
          optimalLeaveDates: attendanceData.optimalLeaveDates
        } : undefined
      };

      const response = await backend.ai.chat(request);
      addBotMessage(response.response, response.suggestions, response.recommendedDates);
    } catch (error) {
      console.error('Chat error:', error);
      // Provide better fallback responses based on context
      const fallbackMessage = attendanceData ? 
        `🤖 I can still help you! Based on your data, you have ${attendanceData.safeLeaveDays} safe leave days. ${attendanceData.safeLeaveDays > 0 ? 'You\'re in a good position to plan some holidays!' : 'You need to be very careful with attendance.'}` :
        "🔄 I'm working in offline mode but can still help with general holiday planning advice! What would you like to know?";
        
      const fallbackSuggestions = attendanceData && attendanceData.safeLeaveDays > 0 ? 
        ["What are my best vacation dates?", "How risky is my current status?", "Show planning strategies"] :
        ["Go to Calculator first", "How does AI planning work?", "General holiday tips"];
        
      addBotMessage(fallbackMessage, fallbackSuggestions);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleDateClick = (date: string) => {
    handleSendMessage(`Tell me more about ${date}`);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600 shadow-2xl hover:shadow-violet-500/40 transition-all duration-500 hover:scale-125 animate-pulse transform-gpu relative"
        >
          <MessageCircle className="h-7 w-7 text-white" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-ping"></div>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="w-80 h-96 flex flex-col bg-white/90 backdrop-blur-xl border-2 border-violet-300 shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/40 transition-all duration-500 hover:scale-105 transform-gpu">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 animate-pulse" />
            <span className="font-semibold text-base">AI Holiday Assistant</span>
          </div>
          <div className="flex items-center space-x-2">
            {!propUserType && (
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value as 'student' | 'employee')}
                className="text-xs bg-white/20 border border-white/30 rounded px-2 py-1 text-white backdrop-blur-sm hover:bg-white/30 transition-all duration-300"
              >
                <option value="student">Student</option>
                <option value="employee">Employee</option>
              </select>
            )}
            {propUserType && (
              <div className="text-xs bg-white/20 border border-white/30 rounded px-2 py-1 text-white backdrop-blur-sm">
                {propUserType.charAt(0).toUpperCase() + propUserType.slice(1)}
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-5 w-5 p-0 hover:bg-white/20 transition-all duration-300 hover:scale-110"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 text-sm animate-fade-in">
              <Bot className="h-8 w-8 mx-auto mb-2 text-violet-600 animate-pulse" />
              <p className="font-medium text-sm">Hi! I'm your AI Holiday Assistant.</p>
              {attendanceData ? (
                <p className="text-xs">I can see your attendance data. Let's optimize your holidays!</p>
              ) : (
                <p className="text-xs">Calculate your attendance first for personalized recommendations!</p>
              )}
            </div>
          )}
          
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} animate-slide-up`}>
              <div className={`max-w-[80%] p-2 rounded-lg transition-all duration-300 hover:scale-105 text-sm ${
                message.isBot 
                  ? 'bg-gradient-to-r from-gray-100 to-violet-100 text-gray-800 border border-violet-200 backdrop-blur-sm shadow-lg' 
                  : 'bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white shadow-lg'
              }`}>
                <p className="text-xs whitespace-pre-wrap">{message.text}</p>
                
                {/* Recommended Dates Section */}
                {message.recommendedDates && message.recommendedDates.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center space-x-1 mb-1">
                      <Calendar className="h-3 w-3 text-violet-600" />
                      <span className="text-xs font-medium text-violet-700">📅 Smart Dates:</span>
                    </div>
                    {message.recommendedDates.map((date, index) => (
                      <button
                        key={index}
                        onClick={() => handleDateClick(date)}
                        className="block w-full text-left text-xs p-2 bg-gradient-to-r from-emerald-100 to-green-100 hover:from-emerald-200 hover:to-green-200 rounded border border-emerald-300 transition-all duration-300 backdrop-blur-sm hover:scale-105 shadow-sm"
                      >
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-emerald-600" />
                          <span className="text-emerald-800 font-medium">{date}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Suggestions Section */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="text-xs font-medium text-violet-700 mb-1">💡 Quick Actions:</div>
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block w-full text-left text-xs p-1 bg-white/20 hover:bg-white/40 rounded border border-violet-300 transition-all duration-300 backdrop-blur-sm hover:scale-105 shadow-sm"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start animate-slide-up">
              <div className="bg-gradient-to-r from-gray-100 to-violet-100 border border-violet-200 p-2 rounded-lg backdrop-blur-sm shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-violet-600 rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1 h-1 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-violet-600">AI analyzing...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-gray-200">
          <div className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about optimal dates, calendar sync..."
              className="flex-1 bg-white/80 border-2 border-violet-300 text-gray-900 placeholder:text-gray-500 focus:border-violet-400 backdrop-blur-sm hover:border-violet-400 transition-all duration-300 text-xs"
              disabled={isLoading}
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700 shadow-lg hover:scale-110 transition-all duration-300 transform-gpu"
            >
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </Card>

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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
        
        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ChatBot;
