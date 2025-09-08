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
  };
}

export interface ChatResponse {
  response: string;
  suggestions: string[];
}

// Provides AI-powered chat assistance for attendance and holiday planning.
export const chat = api<ChatRequest, ChatResponse>(
  { expose: true, method: "POST", path: "/ai/chat" },
  async (req) => {
    const { message, userType, attendanceData } = req;
    
    try {
      const apiKey = openAIKey();
      
      if (!apiKey) {
        // Fallback to rule-based responses if no API key
        return getRuleBasedResponse(message, userType, attendanceData);
      }

      // Prepare the system prompt
      const systemPrompt = `You are an AI assistant specialized in helping ${userType}s with attendance management, holiday planning, work-life balance, and study planning. 

Your role is to:
1. Help users understand their attendance requirements and policies
2. Provide personalized recommendations for taking leaves/holidays
3. Calculate safe leave days based on attendance rules
4. Suggest optimal timing for holidays
5. Warn about attendance risks
6. Advise on work-life balance strategies
7. Help with study planning and academic scheduling
8. Provide insights on attendance policies and regulations
9. Suggest productivity and time management tips
10. Help plan around important deadlines and events

${attendanceData ? `Current user data:
- Total days: ${attendanceData.totalDays}
- Required days: ${attendanceData.requiredDays}
- Safe leave days: ${attendanceData.safeLeaveDays}
- Attendance rule: ${attendanceData.attendanceRule}%` : 'No attendance data provided yet.'}

You should provide comprehensive, thoughtful responses that go beyond simple FAQ answers. Consider the user's specific situation, provide context about policies, and offer strategic advice for balancing responsibilities with personal well-being.

Respond in a helpful, friendly tone. Keep responses informative but concise. Always provide 2-3 relevant suggestions for follow-up questions.`;

      // Call OpenAI GPT-4
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
          max_tokens: 600,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || "I'm sorry, I couldn't process your request right now.";

      // Generate contextual suggestions
      const suggestions = generateSuggestions(message, userType, attendanceData);

      return {
        response: aiResponse,
        suggestions
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Fallback to rule-based responses
      return getRuleBasedResponse(message, userType, attendanceData);
    }
  }
);

function getRuleBasedResponse(message: string, userType: "student" | "employee", attendanceData?: any): ChatResponse {
  let response = "";
  const suggestions: string[] = [];
  
  const lowerMessage = message.toLowerCase();
  
  // Work-life balance queries
  if (lowerMessage.includes("work-life balance") || lowerMessage.includes("balance") || lowerMessage.includes("stress")) {
    if (userType === "student") {
      response = "Maintaining a healthy study-life balance is crucial for academic success. Here are some strategies: 1) Use the Pomodoro technique for focused study sessions, 2) Schedule regular breaks and social activities, 3) Plan study-free days during weekends, 4) Take advantage of your safe leave days for mental health breaks. ";
      
      if (attendanceData && attendanceData.safeLeaveDays > 0) {
        response += `With ${attendanceData.safeLeaveDays} safe leave days available, you can plan regular mental health days without affecting your attendance.`;
      }
      
      suggestions.push("How to manage exam stress?");
      suggestions.push("Best study schedule for work-life balance");
      suggestions.push("When to take mental health days?");
    } else {
      response = "Work-life balance is essential for long-term career success and personal well-being. Consider these approaches: 1) Set clear boundaries between work and personal time, 2) Use your vacation days strategically, 3) Practice saying no to non-essential overtime, 4) Schedule regular personal activities. ";
      
      if (attendanceData && attendanceData.safeLeaveDays > 0) {
        response += `You have ${attendanceData.safeLeaveDays} days available for personal time and vacations.`;
      }
      
      suggestions.push("How to disconnect from work?");
      suggestions.push("Best practices for remote work balance");
      suggestions.push("Planning regular vacation breaks");
    }
  }
  
  // Study planning queries
  else if (lowerMessage.includes("study plan") || lowerMessage.includes("academic") || lowerMessage.includes("exam")) {
    if (userType === "student") {
      response = "Effective study planning involves strategic time management and attendance optimization. Here's how to plan: 1) Create a semester calendar with all important dates, 2) Plan intensive study periods around your safe leave days, 3) Use attendance buffer days for exam preparation, 4) Schedule study breaks to prevent burnout. ";
      
      if (attendanceData) {
        response += `With your current attendance status, you can safely take ${attendanceData.safeLeaveDays} days for intensive study sessions or exam preparation.`;
      }
      
      suggestions.push("How to plan study schedule around attendance?");
      suggestions.push("Best time for exam preparation leaves?");
      suggestions.push("Balancing group projects with personal study");
    } else {
      response = "While you're an employee, continuous learning and skill development are important. Consider: 1) Using professional development days, 2) Planning training around work schedules, 3) Balancing certification studies with work responsibilities.";
      
      suggestions.push("Professional development planning");
      suggestions.push("Skill building during work hours");
      suggestions.push("Certification study schedules");
    }
  }
  
  // Attendance policy queries
  else if (lowerMessage.includes("policy") || lowerMessage.includes("rule") || lowerMessage.includes("regulation")) {
    if (userType === "student") {
      response = "Understanding attendance policies is crucial for academic success. Most institutions require 75-85% attendance. Key points: 1) Medical leaves are usually excused with proper documentation, 2) Some institutions offer grace periods for emergencies, 3) Attendance requirements may vary by course type (lab vs lecture), 4) Participation in official college activities may be considered as attendance. ";
      
      if (attendanceData) {
        response += `Your current requirement is ${attendanceData.attendanceRule}% attendance, which means attending ${attendanceData.requiredDays} out of ${attendanceData.totalDays} days.`;
      }
      
      suggestions.push("What counts as excused absence?");
      suggestions.push("How to appeal attendance shortage?");
      suggestions.push("Medical leave documentation requirements");
    } else {
      response = "Workplace attendance policies vary by company but generally include: 1) Annual leave entitlements (usually 15-30 days), 2) Sick leave provisions, 3) Personal/emergency leave options, 4) Flexible work arrangements, 5) Attendance tracking methods. Understanding your company's specific policy helps in strategic planning. ";
      
      if (attendanceData) {
        response += `Based on your ${attendanceData.attendanceRule}% requirement, you need to maintain consistent attendance while utilizing your leave entitlements wisely.`;
      }
      
      suggestions.push("Understanding company leave policies");
      suggestions.push("How to request extended leave?");
      suggestions.push("Flexible work arrangement options");
    }
  }
  
  // Leave and holiday planning
  else if (lowerMessage.includes("leave") || lowerMessage.includes("holiday") || lowerMessage.includes("vacation")) {
    if (attendanceData) {
      response = `Based on your attendance data, you can safely take ${attendanceData.safeLeaveDays} days off while maintaining ${attendanceData.attendanceRule}% attendance. Strategic planning tips: `;
      
      if (userType === "student") {
        response += "1) Plan leaves during reading weeks or between semesters, 2) Avoid leaves during lab sessions or important lectures, 3) Consider half-days instead of full days for flexibility, 4) Coordinate with group project schedules, 5) Plan around exam dates and assignment deadlines.";
        suggestions.push("Best time for semester break trips");
        suggestions.push("Planning around exam schedules");
        suggestions.push("Coordinating with study groups");
      } else {
        response += "1) Plan around company holidays for extended breaks, 2) Coordinate with team schedules and project deadlines, 3) Consider workload patterns and busy seasons, 4) Plan mental health days during high-stress periods, 5) Use long weekends strategically.";
        suggestions.push("Planning around project deadlines");
        suggestions.push("Coordinating team vacation schedules");
        suggestions.push("Maximizing long weekend opportunities");
      }
    } else {
      response = "To give you personalized leave recommendations, please use the attendance calculator first to input your schedule details. This will help me provide specific advice based on your attendance requirements.";
      suggestions.push("Go to Calculator");
      suggestions.push("How do I calculate safe leave days?");
      suggestions.push("Understanding attendance requirements");
    }
  }
  
  // Attendance calculation and status
  else if (lowerMessage.includes("attendance") || lowerMessage.includes("percentage") || lowerMessage.includes("calculate")) {
    if (attendanceData) {
      response = `You need to attend ${attendanceData.requiredDays} out of ${attendanceData.totalDays} days to maintain ${attendanceData.attendanceRule}% attendance. `;
      
      if (attendanceData.safeLeaveDays > 0) {
        response += `This gives you ${attendanceData.safeLeaveDays} safe leave days. Strategic advice: `;
        
        if (attendanceData.safeLeaveDays <= 5) {
          response += "You have limited buffer days, so plan carefully. Consider taking half-days or shorter breaks instead of full days.";
        } else if (attendanceData.safeLeaveDays <= 10) {
          response += "You have moderate flexibility. Plan your leaves strategically and keep 2-3 days as emergency reserve.";
        } else {
          response += "You have good flexibility for planning holidays and personal time. Consider spreading leaves throughout the period.";
        }
      } else {
        response += "You'll need perfect attendance to meet the requirement. Focus on maintaining consistent attendance and avoid any unnecessary absences.";
      }
    } else {
      response = "I can help you calculate your attendance requirements! Please use the attendance calculator to get started, and I'll provide personalized insights based on your specific situation.";
      suggestions.push("Calculate Attendance");
      suggestions.push("What percentage do I need?");
      suggestions.push("Understanding attendance rules");
    }
  }
  
  // Risk assessment
  else if (lowerMessage.includes("safe") || lowerMessage.includes("risk") || lowerMessage.includes("danger")) {
    if (attendanceData && attendanceData.safeLeaveDays > 0) {
      response = `You're in a safe zone with ${attendanceData.safeLeaveDays} available leave days. Risk management tips: `;
      
      if (attendanceData.safeLeaveDays <= 5) {
        response += "1) Track your attendance weekly, 2) Avoid unnecessary absences, 3) Plan leaves well in advance, 4) Keep documentation for any emergency absences, 5) Consider partial days instead of full days off.";
        suggestions.push("Weekly attendance tracking tips");
        suggestions.push("Emergency absence documentation");
        suggestions.push("Half-day vs full-day strategies");
      } else {
        response += "1) You have good flexibility for planning, 2) Consider keeping 20% of your safe days as emergency buffer, 3) Plan longer trips during appropriate periods, 4) Regular mental health breaks are possible.";
        suggestions.push("Planning longer vacation trips");
        suggestions.push("Mental health day scheduling");
        suggestions.push("Emergency buffer management");
      }
    } else if (attendanceData && attendanceData.safeLeaveDays <= 0) {
      response = "⚠️ You're in a high-risk zone. Immediate action needed: 1) Attend all remaining days without exception, 2) Speak with your supervisor/academic advisor about your situation, 3) Document any medical emergencies properly, 4) Consider if there are any attendance recovery options available.";
      suggestions.push("Attendance recovery strategies");
      suggestions.push("Speaking with supervisors/advisors");
      suggestions.push("Medical emergency documentation");
    } else {
      response = "Let me analyze your attendance data first. Please use the calculator to check your current status, and I'll provide a detailed risk assessment.";
      suggestions.push("Check Current Status");
      suggestions.push("Calculate Risk Level");
      suggestions.push("Understanding attendance thresholds");
    }
  }
  
  // Best timing questions
  else if (lowerMessage.includes("best time") || lowerMessage.includes("when") || lowerMessage.includes("timing")) {
    if (userType === "student") {
      response = "Optimal timing for student leaves: 1) Reading weeks (if available) - perfect for longer trips, 2) Between semesters - ideal for family time, 3) Post-exam periods - great for celebration and relaxation, 4) During lighter coursework periods, 5) Long weekends during festivals. Avoid: exam periods, lab sessions, group project deadlines, and important lecture series.";
      suggestions.push("Planning around exam schedules");
      suggestions.push("Semester break opportunities");
      suggestions.push("Festival holiday planning");
    } else {
      response = "Strategic timing for employee leaves: 1) Around company holidays for extended breaks, 2) End of quarters (if workload permits), 3) Summer vacation season (June-August), 4) Year-end holiday season, 5) During team's lighter periods. Coordinate with: project deadlines, team schedules, busy seasons, and annual planning cycles.";
      suggestions.push("Company holiday coordination");
      suggestions.push("Project deadline planning");
      suggestions.push("Team schedule coordination");
    }
  }
  
  // Default response for general queries
  else {
    response = `I'm your comprehensive AI attendance and life balance advisor! I can help you with:
    
    📚 **Academic/Work Planning:**
    • Attendance requirement calculations
    • Strategic leave planning
    • Study schedule optimization
    • Work-life balance strategies
    
    📋 **Policy Guidance:**
    • Understanding attendance policies
    • Leave entitlements and regulations
    • Documentation requirements
    • Appeal processes
    
    🎯 **Strategic Advice:**
    • Optimal timing for holidays
    • Risk assessment and management
    • Emergency planning
    • Long-term scheduling
    
    💡 **Personal Development:**
    • Stress management techniques
    • Productivity optimization
    • Time management strategies
    • Mental health planning
    
    What specific aspect would you like to explore?`;
    
    suggestions.push("How many leaves can I safely take?");
    suggestions.push("What's the best time for a holiday?");
    suggestions.push("How to improve work-life balance?");
  }
  
  return {
    response,
    suggestions
  };
}

function generateSuggestions(message: string, userType: "student" | "employee", attendanceData?: any): string[] {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("balance") || lowerMessage.includes("stress")) {
    return [
      "How to manage daily stress effectively?",
      "Best practices for time management",
      "Planning regular mental health breaks"
    ];
  } else if (lowerMessage.includes("study") || lowerMessage.includes("academic")) {
    return [
      "How to optimize study schedules?",
      "Planning around exam periods",
      "Balancing coursework with personal time"
    ];
  } else if (lowerMessage.includes("policy") || lowerMessage.includes("rule")) {
    return [
      "What are my leave entitlements?",
      "How to document medical absences?",
      "Understanding attendance appeal process"
    ];
  } else if (lowerMessage.includes("leave") || lowerMessage.includes("holiday")) {
    return [
      "What's the best time for a week-long trip?",
      "How to plan around important dates?",
      "Can I take consecutive days off safely?"
    ];
  } else if (lowerMessage.includes("attendance")) {
    return [
      "How many safe days do I have?",
      "What if I miss more days?",
      "How to improve my attendance strategy?"
    ];
  } else if (lowerMessage.includes("risk")) {
    return [
      "How to avoid attendance shortage?",
      "What are the consequences of low attendance?",
      "How to recover from attendance issues?"
    ];
  }
  
  return [
    "Calculate my attendance status",
    "Plan my next holiday",
    "Check my risk level"
  ];
}
