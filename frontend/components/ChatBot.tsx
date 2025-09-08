import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
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
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<'student' | 'employee'>('student');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-popup every 5 minutes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) {
        setIsOpen(true);
        addBotMessage(
          "👋 Hi! I'm your comprehensive AI attendance advisor. I can help with attendance policies, work-life balance, study planning, and much more. What would you like to know?",
          ["How to balance work and personal life?", "What are my attendance policy options?", "Help me plan my study schedule"]
        );
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearTimeout(timer);
  }, [isOpen]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addBotMessage = (text: string, suggestions?: string[]) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      isBot: true,
      timestamp: new Date(),
      suggestions
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
        // In a real app, you'd get this from the calculator state
        attendanceData: undefined
      };

      const response = await backend.ai.chat(request);
      addBotMessage(response.response, response.suggestions);
    } catch (error) {
      console.error('Chat error:', error);
      addBotMessage("Sorry, I'm having trouble connecting right now. Please try again in a moment. I'm here to help with attendance policies, work-life balance, study planning, and strategic advice!");
      toast({
        title: "Chat Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
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

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600 shadow-2xl hover:shadow-violet-500/40 transition-all duration-500 hover:scale-125 animate-pulse transform-gpu"
        >
          <MessageCircle className="h-7 w-7 text-white" />
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
            <span className="font-semibold text-base">AI Advisor</span>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value as 'student' | 'employee')}
              className="text-xs bg-white/20 border border-white/30 rounded px-2 py-1 text-white backdrop-blur-sm hover:bg-white/30 transition-all duration-300"
            >
              <option value="student">Student</option>
              <option value="employee">Employee</option>
            </select>
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
              <p className="font-medium text-sm">Hi! I'm your comprehensive AI advisor.</p>
              <p className="text-xs">Ask me about attendance, work-life balance, study planning, and more!</p>
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
                {message.suggestions && (
                  <div className="mt-2 space-y-1">
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
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-violet-600 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-1 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
              placeholder="Ask about policies, balance, planning..."
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

      <style jsx>{`
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
