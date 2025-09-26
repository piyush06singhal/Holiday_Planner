import { api } from "encore.dev/api";
import { secret } from "encore.dev/config";

// Using built-in AI responses for better reliability without API dependencies

export interface ChatRequest {
  message: string;
  userType: "student" | "employee";
  attendanceData?: {
    totalDays: number;
    requiredDays: number;
    safeLeaveDays: number;
    attendanceRule: number;
    startDate?: Date;
    endDate?: Date;
    optimalLeaveDates?: Array<{
      startDate: string;
      endDate: string;
      duration: number;
      reason: string;
      aiScore: number;
      description: string;
    }>;
  };
}

export interface ChatResponse {
  response: string;
  suggestions: string[];
  recommendedDates?: string[];
}

// Provides AI-powered chat assistance for attendance and holiday planning.
export const chat = api<ChatRequest, ChatResponse>(
  { expose: true, method: "POST", path: "/ai/chat" },
  async (req) => {
    const { message, userType, attendanceData } = req;
    
    try {
      // Always use enhanced rule-based responses for reliability
      return getEnhancedRuleBasedResponse(message, userType, attendanceData);

      // Using enhanced AI responses for immediate reliability
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Fallback to enhanced rule-based responses
      return getEnhancedRuleBasedResponse(message, userType, attendanceData);
    }
  }
);

function getEnhancedRuleBasedResponse(message: string, userType: "student" | "employee", attendanceData?: any): ChatResponse {
  let response = "";
  const suggestions: string[] = [];
  const recommendedDates: string[] = [];
  
  const lowerMessage = message.toLowerCase();
  
  // Concise AI responses with calendar integration
  if (lowerMessage.includes("when") || lowerMessage.includes("best time") || lowerMessage.includes("dates")) {
    if (attendanceData && attendanceData.safeLeaveDays > 0) {
      response = `🎯 **Best Dates for You:**\n\n`;
      
      if (attendanceData.optimalLeaveDates && attendanceData.optimalLeaveDates.length > 0) {
        attendanceData.optimalLeaveDates.slice(0, 2).forEach((date: any, index: number) => {
          response += `${index + 1}. **${date.reason}**: ${new Date(date.startDate).toLocaleDateString()} - ${new Date(date.endDate).toLocaleDateString()} (Score: ${date.aiScore}/100)\n`;
          recommendedDates.push(`${date.startDate} to ${date.endDate}: ${date.reason}`);
        });
      }
      
      // Quick seasonal tip
      const currentMonth = new Date().getMonth();
      if (currentMonth >= 9 || currentMonth <= 1) {
        response += `\n❄️ **Winter Tip:** Great for year-end holidays!`;
      } else if (currentMonth >= 2 && currentMonth <= 5) {
        response += `\n🌸 **Spring Tip:** Perfect for outdoor travel!`;
      }
      
      suggestions.push("Show calendar integration");
      suggestions.push("Export to Google Calendar");
      suggestions.push("Check risk levels");
      
    } else {
      response = `📊 **Need Your Data First!** Use the calculator to get personalized dates and AI recommendations.`;
      
      suggestions.push("Go to Calculator");
      suggestions.push("How does AI work?");
      suggestions.push("What makes dates optimal?");
    }
  }
  
  // Calendar integration queries
  else if (lowerMessage.includes("calendar") || lowerMessage.includes("integration") || lowerMessage.includes("google") || lowerMessage.includes("outlook")) {
    response = `📅 **Calendar Integration:** Sync your optimal dates with Google Calendar or Outlook for automatic reminders and planning.\n\n`;
    
    if (attendanceData && attendanceData.safeLeaveDays > 0) {
      response += `🎉 **Ready!** ${attendanceData.safeLeaveDays} safe days available for:\n• Long weekends • Festivals • Vacations • Mental health breaks`;
      
      recommendedDates.push("Next Friday: Long weekend");
      recommendedDates.push("Month-end: Strategic break");
    }
    
    suggestions.push("Export to calendar");
    suggestions.push("Set up reminders");
    suggestions.push("Mobile sync guide");
  }
  
  // Specific date requests
  else if (lowerMessage.includes("holiday") || lowerMessage.includes("vacation") || lowerMessage.includes("trip")) {
    if (attendanceData && attendanceData.safeLeaveDays > 0) {
      response = `🏖️ **AI Holiday Planning Analysis:**\n\n`;
      
      if (attendanceData.safeLeaveDays >= 7) {
        response += `✈️ **Week-long Trip Options:**\n`;
        response += `You can safely plan 1-2 week-long vacations! AI recommends:\n`;
        recommendedDates.push("Last week of December: Year-end vacation");
        recommendedDates.push("Mid-April: Spring vacation");
        recommendedDates.push("Early October: Autumn getaway");
      } else if (attendanceData.safeLeaveDays >= 3) {
        response += `🌟 **Long Weekend Escapes:**\n`;
        response += `Perfect for 3-4 day getaways! AI suggests:\n`;
        recommendedDates.push("Next long weekend: 3-day trip");
        recommendedDates.push("Festival weekend: Cultural travel");
      }
      
      // Add personalized timing based on user type
      if (userType === "student") {
        response += `\n🎓 **Student-Optimized Timing:**\n• Plan around exam schedules\n• Utilize semester breaks\n• Coordinate with study groups\n`;
      } else {
        response += `\n💼 **Professional-Optimized Timing:**\n• Coordinate with team schedules\n• Plan around project deadlines\n• Utilize company holidays\n`;
      }
      
      suggestions.push("Plan my dream vacation");
      suggestions.push("Best destinations for my dates");
      suggestions.push("How to maximize my time off?");
      
    } else {
      response = `🎯 **Get Your Personalized Holiday Calendar!** Use our AI calculator to unlock:\n\n📅 Specific vacation dates tailored to your schedule\n🗓️ AI-optimized travel periods\n✈️ Ready-to-book holiday recommendations\n🎉 Festival and celebration planning`;
      
      suggestions.push("Calculate my vacation dates");
      suggestions.push("What vacations can I afford (attendance-wise)?");
      suggestions.push("How to plan around work/study?");
    }
  }
  
  // Work-life balance with calendar focus
  else if (lowerMessage.includes("balance") || lowerMessage.includes("stress") || lowerMessage.includes("burnout")) {
    response = `🧘 **AI-Powered Work-Life Balance Calendar:**\n\n`;
    
    if (attendanceData && attendanceData.safeLeaveDays > 0) {
      response += `📊 **Your Balance Score:** ${attendanceData.safeLeaveDays >= 10 ? 'Excellent' : attendanceData.safeLeaveDays >= 5 ? 'Good' : 'Needs Attention'}\n\n`;
      
      response += `🗓️ **Recommended Wellness Schedule:**\n`;
      recommendedDates.push("Every 3rd Friday: Mental health day");
      recommendedDates.push("Month-end weekends: Social activities");
      recommendedDates.push("Quarterly: Extended wellness break");
      
      if (userType === "student") {
        response += `📚 **Student Wellness Calendar:**\n• Weekly study breaks: Fridays off\n• Mid-semester retreat: Mental health focus\n• Post-exam recovery: Celebration time\n`;
      } else {
        response += `💼 **Professional Wellness Calendar:**\n• Bi-weekly mental health days\n• Quarterly team-building time off\n• Monthly social connection breaks\n`;
      }
    }
    
    suggestions.push("Create my wellness calendar");
    suggestions.push("How often should I take breaks?");
    suggestions.push("Best stress-relief timing?");
  }
  
  // Risk and safety queries
  else if (lowerMessage.includes("safe") || lowerMessage.includes("risk") || lowerMessage.includes("danger")) {
    if (attendanceData) {
      if (attendanceData.safeLeaveDays > 5) {
        response = `✅ **Safe Zone Confirmed!** Your AI calendar shows excellent flexibility:\n\n🎯 **Available Options:** ${attendanceData.safeLeaveDays} safe leave days\n📅 **Risk Level:** Low - You can plan confidently\n🗓️ **Recommendation:** Use 80% for planned activities, keep 20% for emergencies\n\n`;
        
        recommendedDates.push("Immediate: Any date works");
        recommendedDates.push("Next month: Perfect planning window");
        recommendedDates.push("Quarterly: Extended break options");
        
      } else if (attendanceData.safeLeaveDays > 0) {
        response = `⚠️ **Moderate Risk Zone:** Your calendar requires strategic planning:\n\n🎯 **Available:** ${attendanceData.safeLeaveDays} carefully managed days\n📅 **Strategy:** Plan well in advance\n🗓️ **Best Approach:** Single days or long weekends only\n\n`;
        
        recommendedDates.push("Public holidays: Extended weekends");
        recommendedDates.push("Emergency only: Medical situations");
        
      } else {
        response = `🚨 **High Risk Alert!** Your calendar shows zero flexibility:\n\n⛔ **Status:** No safe leave days remaining\n📅 **Action Required:** Perfect attendance needed\n🆘 **Emergency Protocol:** Consult supervisor/advisor immediately\n`;
      }
    }
    
    suggestions.push("Show risk calendar view");
    suggestions.push("How to improve my safety buffer?");
    suggestions.push("Emergency leave protocols");
  }
  
  // Default enhanced response
  else {
    response = `🤖 **AI Holiday Assistant!** I help you plan optimal leave dates with smart calendar integration.\n\n🎯 **What I Do:**\n• Find best vacation dates • Calendar sync • Risk monitoring • Smart recommendations\n\n💡 **Quick Start:** Use the calculator to get personalized dates!`;
    
    suggestions.push("When can I vacation?");
    suggestions.push("Show optimal dates");
    suggestions.push("Calendar integration help");
  }
  
  return {
    response,
    suggestions,
    recommendedDates
  };
}

function generateEnhancedSuggestions(message: string, userType: "student" | "employee", attendanceData?: any): { suggestions: string[], recommendedDates: string[] } {
  const lowerMessage = message.toLowerCase();
  const suggestions: string[] = [];
  const recommendedDates: string[] = [];
  
  if (lowerMessage.includes("calendar") || lowerMessage.includes("integration")) {
    suggestions.push("Export to Google Calendar");
    suggestions.push("Set up automatic reminders");
    suggestions.push("Sync with Outlook");
    
    if (attendanceData?.safeLeaveDays > 0) {
      recommendedDates.push("This Friday: Long weekend start");
      recommendedDates.push("Next month: Extended break");
    }
  } else if (lowerMessage.includes("vacation") || lowerMessage.includes("holiday")) {
    suggestions.push("Plan my perfect vacation dates");
    suggestions.push("Show long weekend opportunities");
    suggestions.push("Best travel seasons for me");
    
    recommendedDates.push("December 20-30: Winter holidays");
    recommendedDates.push("March 15-20: Spring break");
    recommendedDates.push("July 15-25: Summer vacation");
  } else if (lowerMessage.includes("when") || lowerMessage.includes("timing")) {
    suggestions.push("Show me specific calendar dates");
    suggestions.push("What's the optimal timing strategy?");
    suggestions.push("How to maximize my time off?");
    
    if (attendanceData?.optimalLeaveDates) {
      attendanceData.optimalLeaveDates.slice(0, 3).forEach((date: any) => {
        recommendedDates.push(`${date.startDate}: ${date.reason}`);
      });
    }
  } else {
    suggestions.push("Show me my optimal leave dates");
    suggestions.push("How to integrate with calendar apps?");
    suggestions.push("What's my attendance risk level?");
  }
  
  return { suggestions, recommendedDates };
}
