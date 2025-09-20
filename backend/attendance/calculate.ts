import { api } from "encore.dev/api";

export interface CalculateAttendanceRequest {
  startDate: Date;
  endDate: Date;
  attendanceRule: number;
  userType: "student" | "employee";
  currentAttendancePercentage?: number;
  leavesAvailedAlready?: number;
  institutionType?: string;
  examDates?: string;
  projectDeadlines?: string;
}

export interface AttendanceCalculation {
  totalDays: number;
  requiredDays: number;
  safeLeaveDays: number;
  currentAttendancePercentage: number;
  projectedAttendancePercentage: number;
  isAtRisk: boolean;
  recommendations: string[];
  warnings: string[];
  suggestedHolidayDates?: string[];
  suggestedLeaveDates?: SuggestedLeaveDate[];
  optimalLeaveDates?: OptimalLeaveDate[];
}

export interface SuggestedLeaveDate {
  date: string;
  reason: string;
  type: "single" | "long_weekend" | "festival" | "extended";
  duration: number;
  description: string;
}

export interface OptimalLeaveDate {
  startDate: string;
  endDate: string;
  duration: number;
  reason: string;
  impact: "low" | "medium" | "high";
  aiScore: number;
  description: string;
  benefits: string[];
}

// Calculates attendance requirements and provides AI-powered recommendations.
export const calculate = api<CalculateAttendanceRequest, AttendanceCalculation>(
  { expose: true, method: "POST", path: "/attendance/calculate" },
  async (req) => {
    const { 
      startDate,
      endDate,
      attendanceRule, 
      userType, 
      currentAttendancePercentage,
      leavesAvailedAlready,
      institutionType,
      examDates,
      projectDeadlines
    } = req;
    
    // Calculate total working days automatically (excluding weekends)
    const totalWorkingDays = calculateWorkingDays(startDate, endDate);
    
    const requiredDays = Math.ceil((totalWorkingDays * attendanceRule) / 100);
    const actualLeavesAvailed = leavesAvailedAlready || 0;
    
    // Calculate current attendance days from percentage
    let currentAttendanceDays = 0;
    if (currentAttendancePercentage !== undefined) {
      currentAttendanceDays = Math.floor((totalWorkingDays * currentAttendancePercentage) / 100);
    }
    
    // Calculate remaining days and safe leave days
    const remainingDays = totalWorkingDays - currentAttendanceDays - actualLeavesAvailed;
    const remainingRequiredDays = Math.max(0, requiredDays - currentAttendanceDays);
    const safeLeaveDays = Math.max(0, remainingDays - remainingRequiredDays);
    
    const actualCurrentAttendancePercentage = currentAttendancePercentage || 0;
    const projectedAttendancePercentage = attendanceRule;
    
    const isAtRisk = safeLeaveDays <= 0;
    
    const recommendations: string[] = [];
    const warnings: string[] = [];
    const suggestedHolidayDates: string[] = [];
    
    // Generate AI-powered optimal leave dates
    const optimalLeaveDates = generateOptimalLeaveDates(
      startDate, 
      endDate, 
      safeLeaveDays, 
      userType,
      examDates,
      projectDeadlines,
      attendanceRule
    );
    
    // Generate suggested leave dates
    const suggestedLeaveDates = generateSuggestedLeaveDates(
      startDate, 
      endDate, 
      safeLeaveDays, 
      userType,
      examDates,
      projectDeadlines
    );
    
    // Generate personalized AI recommendations
    if (safeLeaveDays > 0) {
      recommendations.push(`🎯 AI Analysis: You can safely take ${safeLeaveDays} days off while maintaining ${attendanceRule}% attendance.`);
      
      if (userType === "student") {
        if (institutionType === "university") {
          recommendations.push("🎓 Smart Strategy: Plan leaves during reading weeks or between semesters for optimal academic performance.");
        } else if (institutionType === "college") {
          recommendations.push("🔬 Academic Tip: Avoid leaves during practical sessions and lab work to minimize academic impact.");
        }
        
        if (examDates) {
          recommendations.push("📚 Exam Strategy: Avoid taking leaves 2 weeks before major exams for better preparation.");
          warnings.push("⚠️ Exam Alert: Plan carefully around your exam dates to maintain study momentum.");
        }
        
        recommendations.push("💡 Pro Tip: Consider taking half-days instead of full days during important lecture series.");
        
        // Generate AI-suggested holiday dates for students
        suggestedHolidayDates.push("🌟 Mid-semester break (optimal for mental health)");
        suggestedHolidayDates.push("🎉 Long weekends during festival seasons");
        suggestedHolidayDates.push("🎊 Post-exam celebration periods");
        
      } else {
        if (projectDeadlines) {
          recommendations.push("💼 Work Strategy: Plan leaves after major project deliverables for stress-free holidays.");
          warnings.push("⚠️ Project Alert: Avoid taking leaves during critical project phases.");
        }
        
        recommendations.push("🏢 Corporate Tip: Take leaves during company holidays for extended breaks.");
        recommendations.push("🧘 Wellness Advice: Plan mental health days during high-stress periods.");
        
        // Generate AI-suggested holiday dates for employees
        suggestedHolidayDates.push("🌴 Extended weekends around public holidays");
        suggestedHolidayDates.push("📊 End of quarter periods (if workload permits)");
        suggestedHolidayDates.push("☀️ Summer vacation season (June-August)");
        suggestedHolidayDates.push("🎄 Year-end holiday season (December)");
      }
      
      // AI-powered strategic recommendations based on safe days
      if (safeLeaveDays >= 15) {
        recommendations.push("🚀 Excellent Buffer: You have great flexibility for planning extended trips or multiple short breaks.");
        recommendations.push("🎯 Strategic Advice: Consider spreading your leaves across the period for optimal work-life balance.");
      } else if (safeLeaveDays >= 10) {
        recommendations.push("✅ Good Flexibility: You can plan 1-2 week-long trips or several long weekends.");
        recommendations.push("🔄 Balance Strategy: Mix short breaks with one longer vacation for best results.");
      } else if (safeLeaveDays >= 5) {
        recommendations.push("⚖️ Moderate Buffer: Focus on strategic long weekends and essential personal time.");
        recommendations.push("🎲 Smart Planning: Combine public holidays with your leave days for maximum impact.");
      }
      
    } else {
      warnings.push(`🚨 Critical Alert: You need to attend ALL remaining ${remainingDays} days to meet the ${attendanceRule}% requirement.`);
      warnings.push("⛔ Zero Tolerance: Any absence will put you below the minimum attendance threshold.");
      recommendations.push("🎯 Emergency Plan: Focus on perfect attendance for the remaining period.");
      recommendations.push("🤝 Seek Support: Consider discussing your situation with your supervisor/academic advisor.");
    }
    
    // AI-powered risk assessment
    if (safeLeaveDays <= 5 && safeLeaveDays > 0) {
      warnings.push("⚠️ High Risk Zone: You have very limited leave days. Every absence counts!");
      recommendations.push("🔍 Micro-Management: Consider taking half-days or shorter breaks instead of full days.");
      recommendations.push("📱 Stay Alert: Use our AI monitoring to track your status daily.");
    }
    
    // AI buffer recommendations
    if (safeLeaveDays > 10) {
      recommendations.push("🛡️ Safety Buffer: Keep 20% of your safe days as emergency reserve for unexpected situations.");
      recommendations.push("🎨 Creative Planning: You have freedom to plan creative holiday combinations.");
    }
    
    return {
      totalDays: totalWorkingDays,
      requiredDays,
      safeLeaveDays: Math.max(0, safeLeaveDays),
      currentAttendancePercentage: actualCurrentAttendancePercentage,
      projectedAttendancePercentage,
      isAtRisk,
      recommendations,
      warnings,
      suggestedHolidayDates,
      suggestedLeaveDates,
      optimalLeaveDates
    };
  }
);

function calculateWorkingDays(startDate: Date, endDate: Date): number {
  let count = 0;
  const currentDate = new Date(startDate);
  const end = new Date(endDate);
  
  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay();
    // Count Monday to Friday (1-5), exclude Saturday (6) and Sunday (0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return count;
}

function generateOptimalLeaveDates(
  startDate: Date, 
  endDate: Date, 
  safeLeaveDays: number,
  userType: "student" | "employee",
  examDates?: string,
  projectDeadlines?: string,
  attendanceRule?: number
): OptimalLeaveDate[] {
  const optimalDates: OptimalLeaveDate[] = [];
  
  if (safeLeaveDays <= 0) {
    return optimalDates;
  }
  
  const currentDate = new Date(startDate);
  const end = new Date(endDate);
  
  // AI-powered analysis of optimal periods
  const periods = analyzeOptimalPeriods(currentDate, end, userType, examDates, projectDeadlines);
  
  periods.forEach(period => {
    if (period.safeDays <= safeLeaveDays) {
      optimalDates.push({
        startDate: period.startDate,
        endDate: period.endDate,
        duration: period.safeDays,
        reason: period.reason,
        impact: period.impact,
        aiScore: period.aiScore,
        description: period.description,
        benefits: period.benefits
      });
    }
  });
  
  // Sort by AI score (highest first)
  return optimalDates.sort((a, b) => b.aiScore - a.aiScore).slice(0, 10);
}

function analyzeOptimalPeriods(
  startDate: Date, 
  endDate: Date, 
  userType: "student" | "employee",
  examDates?: string,
  projectDeadlines?: string
) {
  const periods = [];
  const currentDate = new Date(startDate);
  
  // Define festival and holiday periods with AI scoring
  const festivals = [
    { 
      name: "Diwali", 
      month: 10, 
      duration: 5, 
      aiScore: 95,
      impact: "low" as const,
      benefits: ["Festival celebration", "Family time", "Cultural significance", "Extended weekend potential"]
    },
    { 
      name: "Christmas & New Year", 
      month: 11, 
      duration: 7, 
      aiScore: 98,
      impact: "low" as const,
      benefits: ["Year-end break", "Holiday season", "Global celebration", "Natural work slowdown"]
    },
    { 
      name: "Summer Break", 
      month: 4, 
      duration: 10, 
      aiScore: 90,
      impact: "medium" as const,
      benefits: ["Perfect weather", "Travel season", "School holidays", "Vitamin D boost"]
    },
    { 
      name: "Holi Celebration", 
      month: 2, 
      duration: 3, 
      aiScore: 85,
      impact: "low" as const,
      benefits: ["Spring festival", "Cultural celebration", "Weekend extension", "Social bonding"]
    }
  ];
  
  // Generate AI-scored periods
  festivals.forEach(festival => {
    const festivalDate = new Date(currentDate.getFullYear(), festival.month, 15);
    
    if (festivalDate >= startDate && festivalDate <= endDate) {
      const startLeave = new Date(festivalDate);
      startLeave.setDate(startLeave.getDate() - Math.floor(festival.duration / 2));
      
      const endLeave = new Date(festivalDate);
      endLeave.setDate(endLeave.getDate() + Math.floor(festival.duration / 2));
      
      periods.push({
        startDate: startLeave.toISOString().split('T')[0],
        endDate: endLeave.toISOString().split('T')[0],
        safeDays: festival.duration,
        reason: `${festival.name} Optimal Period`,
        impact: festival.impact,
        aiScore: festival.aiScore,
        description: `AI recommends this period for ${festival.name} celebration with maximum benefits`,
        benefits: festival.benefits
      });
    }
  });
  
  // Add quarterly breaks for employees
  if (userType === "employee") {
    for (let quarter = 0; quarter < 4; quarter++) {
      const quarterEnd = new Date(currentDate.getFullYear(), quarter * 3 + 2, 25); // End of each quarter
      
      if (quarterEnd >= startDate && quarterEnd <= endDate) {
        periods.push({
          startDate: quarterEnd.toISOString().split('T')[0],
          endDate: new Date(quarterEnd.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          safeDays: 5,
          reason: `Q${quarter + 1} Break`,
          impact: "medium" as const,
          aiScore: 80,
          description: `Strategic quarter-end break for optimal work-life balance`,
          benefits: ["Quarter completion", "Performance review period", "Strategic planning time", "Reduced workload"]
        });
      }
    }
  }
  
  // Add mid-semester breaks for students
  if (userType === "student") {
    const midSemester = new Date(startDate.getTime() + (endDate.getTime() - startDate.getTime()) / 2);
    periods.push({
      startDate: new Date(midSemester.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date(midSemester.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      safeDays: 6,
      reason: "Mid-Semester Wellness Break",
      impact: "medium" as const,
      aiScore: 88,
      description: "AI-optimized break to prevent academic burnout and boost performance",
      benefits: ["Mental health", "Study break", "Avoid burnout", "Social time"]
    });
  }
  
  return periods;
}

function generateSuggestedLeaveDates(
  startDate: Date, 
  endDate: Date, 
  safeLeaveDays: number,
  userType: "student" | "employee",
  examDates?: string,
  projectDeadlines?: string
): SuggestedLeaveDate[] {
  const suggestions: SuggestedLeaveDate[] = [];
  
  if (safeLeaveDays <= 0) {
    return suggestions;
  }
  
  const currentDate = new Date(startDate);
  const end = new Date(endDate);
  
  // Define major festivals and holidays with better AI integration
  const festivals = [
    { name: "Diwali", month: 10, approxDate: 15, duration: 3, priority: "high" },
    { name: "Christmas", month: 11, approxDate: 25, duration: 2, priority: "high" },
    { name: "New Year", month: 0, approxDate: 1, duration: 2, priority: "high" },
    { name: "Holi", month: 2, approxDate: 15, duration: 2, priority: "medium" },
    { name: "Eid", month: 4, approxDate: 15, duration: 2, priority: "medium" },
    { name: "Dussehra", month: 9, approxDate: 15, duration: 2, priority: "medium" }
  ];
  
  // Generate festival-based suggestions with AI insights
  festivals.forEach(festival => {
    const festivalDate = new Date(currentDate.getFullYear(), festival.month, festival.approxDate);
    
    if (festivalDate >= currentDate && festivalDate <= end) {
      const dayOfWeek = festivalDate.getDay();
      
      if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Weekday
        if (dayOfWeek === 1 || dayOfWeek === 5) { // Monday or Friday
          suggestions.push({
            date: festivalDate.toISOString().split('T')[0],
            reason: `${festival.name} Long Weekend Strategy`,
            type: "long_weekend",
            duration: festival.duration,
            description: `AI recommends taking ${festival.duration} days around ${festival.name} for a 4-day weekend celebration`
          });
        } else {
          suggestions.push({
            date: festivalDate.toISOString().split('T')[0],
            reason: `${festival.name} Cultural Celebration`,
            type: "festival",
            duration: festival.duration,
            description: `Optimal time for ${festival.name} celebration with family and cultural activities`
          });
        }
      }
    }
  });
  
  // Generate AI-powered monthly wellness breaks
  let monthlyDate = new Date(currentDate);
  monthlyDate.setDate(15); // Mid-month
  
  while (monthlyDate <= end && suggestions.length < safeLeaveDays) {
    const dayOfWeek = monthlyDate.getDay();
    
    // AI suggests Friday for optimal long weekend
    if (dayOfWeek === 5) {
      suggestions.push({
        date: monthlyDate.toISOString().split('T')[0],
        reason: "AI-Optimized Wellness Break",
        type: "long_weekend",
        duration: 1,
        description: "AI recommends taking Friday off for a 3-day weekend to maximize rest and recovery"
      });
    }
    
    monthlyDate.setMonth(monthlyDate.getMonth() + 1);
  }
  
  // Add user-type specific AI suggestions
  if (userType === "student") {
    // AI suggests post-exam recovery periods
    if (examDates) {
      suggestions.push({
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reason: "Post-Exam Recovery & Celebration",
        type: "extended",
        duration: 3,
        description: "AI recommends taking time off after exams for mental recovery and celebration"
      });
    }
    
    // AI suggests mid-semester mental health break
    const midSemester = new Date(currentDate.getTime() + (end.getTime() - currentDate.getTime()) / 2);
    suggestions.push({
      date: midSemester.toISOString().split('T')[0],
      reason: "Mid-Semester Mental Health Break",
      type: "extended",
      duration: 2,
      description: "AI-scheduled break to prevent academic burnout and maintain peak performance"
    });
    
  } else {
    // Employee-specific AI suggestions
    if (projectDeadlines) {
      suggestions.push({
        date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reason: "Post-Project Decompression",
        type: "extended",
        duration: 3,
        description: "AI recommends taking time off after major project completion for stress recovery"
      });
    }
    
    // AI suggests quarterly strategic breaks
    const quarterBreak = new Date(currentDate);
    quarterBreak.setMonth(quarterBreak.getMonth() + 3);
    if (quarterBreak <= end) {
      suggestions.push({
        date: quarterBreak.toISOString().split('T')[0],
        reason: "Quarterly Strategic Break",
        type: "extended",
        duration: 5,
        description: "AI-optimized week off for quarterly rest, reflection, and strategic planning"
      });
    }
  }
  
  // Sort suggestions by date and apply AI prioritization
  return suggestions
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, Math.min(suggestions.length, Math.floor(safeLeaveDays * 0.8))); // Use 80% of safe days for suggestions
}
