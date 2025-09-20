import { api } from "encore.dev/api";
import { secret } from "encore.dev/config";

const openAIKey = secret("OpenAIKey");

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
      const apiKey = openAIKey();
      
      if (!apiKey) {
        // Fallback to enhanced rule-based responses if no API key
        return getEnhancedRuleBasedResponse(message, userType, attendanceData);
      }

      // Enhanced system prompt with calendar integration focus
      const systemPrompt = `You are an advanced AI Holiday Planning Assistant specialized in helping ${userType}s with intelligent attendance management, optimal holiday timing, and comprehensive work-life balance strategies.

Your core capabilities include:
1. **Smart Calendar Analysis**: Analyze attendance patterns and recommend optimal leave dates
2. **AI-Powered Scheduling**: Provide specific dates and time periods for holidays based on data
3. **Risk Assessment**: Calculate and communicate attendance risks with actionable solutions
4. **Personalized Planning**: Tailor recommendations based on user type and individual circumstances
5. **Strategic Insights**: Offer long-term planning strategies for maximum benefit
6. **Holiday Optimization**: Recommend the best combinations of leaves with public holidays
7. **Wellness Integration**: Balance productivity with mental health and personal time
8. **Calendar Integration**: Provide ready-to-use calendar suggestions and scheduling advice

${attendanceData ? `📊 **Current User Data Analysis:**
- Total Working Days: ${attendanceData.totalDays}
- Required Attendance Days: ${attendanceData.requiredDays}
- Safe Leave Days Available: ${attendanceData.safeLeaveDays}
- Attendance Requirement: ${attendanceData.attendanceRule}%
- Risk Status: ${attendanceData.safeLeaveDays <= 0 ? '🚨 HIGH RISK' : attendanceData.safeLeaveDays <= 5 ? '⚠️ MODERATE RISK' : '✅ SAFE ZONE'}

${attendanceData.optimalLeaveDates && attendanceData.optimalLeaveDates.length > 0 ? `🎯 **AI-Optimized Leave Periods:**
${attendanceData.optimalLeaveDates.slice(0, 3).map(date => 
  `• ${date.reason}: ${date.startDate} to ${date.endDate} (${date.duration} days, AI Score: ${date.aiScore}/100)`
).join('\n')}` : ''}

${attendanceData.startDate && attendanceData.endDate ? `📅 **Planning Period:** ${attendanceData.startDate.toDateString()} to ${attendanceData.endDate.toDateString()}` : ''}` : '🔄 **No attendance data available yet.** Recommend using the calculator first for personalized insights.'}

**Response Guidelines:**
- Always provide specific, actionable advice with dates when possible
- Include AI scores and reasoning for recommendations
- Offer calendar-ready suggestions that users can implement immediately
- Balance data-driven insights with practical considerations
- Provide follow-up suggestions for deeper engagement
- Use emojis strategically for better readability and engagement
- Focus heavily on calendar integration and specific date recommendations

Your responses should be comprehensive yet digestible, combining analytical insights with practical holiday planning advice.`;

      // Call OpenAI GPT-4 with enhanced prompting
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          max_tokens: 800,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || "I'm sorry, I couldn't process your request right now.";

      // Generate enhanced contextual suggestions and recommended dates
      const { suggestions, recommendedDates } = generateEnhancedSuggestions(message, userType, attendanceData);

      return {
        response: aiResponse,
        suggestions,
        recommendedDates
      };
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
  
  // Enhanced AI responses with calendar integration
  if (lowerMessage.includes("when") || lowerMessage.includes("best time") || lowerMessage.includes("dates")) {
    if (attendanceData && attendanceData.safeLeaveDays > 0) {
      response = `🎯 **AI Calendar Analysis Complete!** Based on your attendance data, here are the optimal leave periods:\n\n`;
      
      if (attendanceData.optimalLeaveDates && attendanceData.optimalLeaveDates.length > 0) {
        response += `📅 **Top AI-Recommended Dates:**\n`;
        attendanceData.optimalLeaveDates.slice(0, 3).forEach((date: any, index: number) => {
          response += `${index + 1}. **${date.reason}**: ${new Date(date.startDate).toLocaleDateString()} - ${new Date(date.endDate).toLocaleDateString()} (${date.duration} days)\n   🎯 AI Score: ${date.aiScore}/100 - ${date.description}\n\n`;
          recommendedDates.push(`${date.startDate} to ${date.endDate}: ${date.reason}`);
        });
      }
      
      // Add seasonal recommendations
      const currentMonth = new Date().getMonth();
      if (currentMonth >= 9 || currentMonth <= 1) { // Oct-Jan
        response += `❄️ **Winter Season Strategy:** Perfect time for year-end holidays and festival celebrations.\n`;
        recommendedDates.push("December 20-30: Year-end holidays");
        recommendedDates.push("October 15-20: Diwali celebrations");
      } else if (currentMonth >= 2 && currentMonth <= 5) { // Feb-May
        response += `🌸 **Spring/Summer Strategy:** Ideal for travel and outdoor activities.\n`;
        recommendedDates.push("March 10-15: Holi celebrations");
        recommendedDates.push("April 15-25: Spring break travel");
      }
      
      suggestions.push("Show me specific calendar dates");
      suggestions.push("How to integrate with Google Calendar?");
      suggestions.push("What are the risks of each date?");
      
    } else {
      response = `📊 **Calendar Integration Ready!** To provide you with specific dates and AI-optimized recommendations, please use our attendance calculator first. This will enable me to:\n\n✨ Generate personalized calendar dates\n📅 Integrate with your schedule\n🎯 Provide AI-scored recommendations\n⚡ Create ready-to-use calendar events`;
      
      suggestions.push("Go to Calculator");
      suggestions.push("How does the AI calendar work?");
      suggestions.push("What makes dates optimal?");
    }
  }
  
  // Calendar integration queries
  else if (lowerMessage.includes("calendar") || lowerMessage.includes("integration") || lowerMessage.includes("google") || lowerMessage.includes("outlook")) {
    response = `📅 **AI Calendar Integration Features:**\n\n🔄 **Smart Sync**: Automatically sync your optimal leave dates with Google Calendar or Outlook\n🎯 **AI Recommendations**: Get intelligent suggestions for the best times to take breaks\n⚠️ **Risk Alerts**: Receive notifications before you risk attendance issues\n📱 **Mobile Ready**: Access your planning from any device\n\n`;
    
    if (attendanceData && attendanceData.safeLeaveDays > 0) {
      response += `🎉 **Ready for Integration!** With ${attendanceData.safeLeaveDays} safe leave days, I can help you create calendar events for:\n`;
      response += `• Strategic long weekends\n• Festival celebrations\n• Mental health breaks\n• Extended vacation periods\n`;
      
      recommendedDates.push("Next Friday: Long weekend opportunity");
      recommendedDates.push("Month-end: Strategic break period");
    }
    
    suggestions.push("Export my schedule to calendar");
    suggestions.push("Set up automatic reminders");
    suggestions.push("How to sync with mobile calendar?");
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
    response = `🤖 **AI Holiday Planning Assistant Ready!** I'm your comprehensive calendar and attendance advisor with advanced features:\n\n🎯 **Core Capabilities:**\n📅 Smart calendar integration with Google/Outlook\n🗓️ AI-optimized leave date recommendations\n📊 Real-time attendance risk monitoring\n✨ Personalized holiday planning strategies\n🎉 Festival and public holiday optimization\n⚡ Instant calendar event creation\n\n🔥 **Popular Questions:**\n"When can I take my next vacation?"\n"Show me the best dates for a long weekend"\n"How to integrate with my Google Calendar?"\n"What's my attendance risk level?"\n\n💡 **Pro Tip:** Use our calculator first to unlock personalized calendar dates and AI recommendations!`;
    
    suggestions.push("When can I take my next vacation?");
    suggestions.push("Show me optimal holiday dates");
    suggestions.push("How does AI calendar integration work?");
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
