import { api } from "encore.dev/api";

export interface CalculateAttendanceRequest {
  email: string;
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
}

export interface SuggestedLeaveDate {
  date: string;
  reason: string;
  type: "single" | "long_weekend" | "festival" | "extended";
  duration: number;
  description: string;
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
    
    // Generate suggested leave dates
    const suggestedLeaveDates = generateSuggestedLeaveDates(
      startDate, 
      endDate, 
      safeLeaveDays, 
      userType,
      examDates,
      projectDeadlines
    );
    
    // Generate personalized recommendations based on user type and preferences
    if (safeLeaveDays > 0) {
      recommendations.push(`You can safely take ${safeLeaveDays} days off while maintaining ${attendanceRule}% attendance.`);
      
      if (userType === "student") {
        if (institutionType === "university") {
          recommendations.push("Consider taking leaves during reading weeks or between semesters for optimal academic performance.");
        } else if (institutionType === "college") {
          recommendations.push("Plan leaves around practical sessions and lab work to minimize academic impact.");
        }
        
        if (examDates) {
          recommendations.push("Avoid taking leaves 2 weeks before major exams mentioned in your schedule.");
          warnings.push("⚠️ Plan carefully around your exam dates to maintain study momentum.");
        }
        
        recommendations.push("Consider taking half-days instead of full days during important lecture series.");
        
        // Generate suggested holiday dates for students
        suggestedHolidayDates.push("Mid-semester break (if available)");
        suggestedHolidayDates.push("Long weekends during festival seasons");
        suggestedHolidayDates.push("Post-exam celebration periods");
        
      } else {
        if (projectDeadlines) {
          recommendations.push("Plan leaves after major project deliverables mentioned in your timeline.");
          warnings.push("⚠️ Avoid taking leaves during critical project phases.");
        }
        
        recommendations.push("Consider taking leaves during company holidays for extended breaks.");
        recommendations.push("Plan mental health days during high-stress periods.");
        
        // Generate suggested holiday dates for employees
        suggestedHolidayDates.push("Extended weekends around public holidays");
        suggestedHolidayDates.push("End of quarter periods (if workload permits)");
        suggestedHolidayDates.push("Summer vacation season (June-August)");
        suggestedHolidayDates.push("Year-end holiday season (December)");
      }
      
    } else {
      warnings.push(`⚠️ You need to attend ALL remaining ${remainingDays} days to meet the ${attendanceRule}% requirement.`);
      warnings.push("Any absence will put you below the minimum attendance threshold.");
      recommendations.push("Focus on perfect attendance for the remaining period.");
      recommendations.push("Consider discussing your situation with your supervisor/academic advisor.");
    }
    
    if (safeLeaveDays <= 5 && safeLeaveDays > 0) {
      warnings.push("⚠️ You have very limited leave days. Plan extremely carefully!");
      recommendations.push("Consider taking half-days or shorter breaks instead of full days.");
    }
    
    // Add buffer recommendations
    if (safeLeaveDays > 10) {
      recommendations.push("You have a good buffer. Consider keeping 20% of your safe days as emergency reserve.");
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
      suggestedLeaveDates
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
  
  // Define major festivals and holidays
  const festivals = [
    { name: "Diwali", month: 10, approxDate: 15, duration: 3 },
    { name: "Christmas", month: 11, approxDate: 25, duration: 2 },
    { name: "New Year", month: 0, approxDate: 1, duration: 2 },
    { name: "Holi", month: 2, approxDate: 15, duration: 2 },
    { name: "Eid", month: 4, approxDate: 15, duration: 2 },
    { name: "Dussehra", month: 9, approxDate: 15, duration: 2 }
  ];
  
  // Generate festival-based suggestions
  festivals.forEach(festival => {
    const festivalDate = new Date(currentDate.getFullYear(), festival.month, festival.approxDate);
    
    if (festivalDate >= currentDate && festivalDate <= end) {
      // Check if it's a weekday that would benefit from leave
      const dayOfWeek = festivalDate.getDay();
      
      if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Weekday
        if (dayOfWeek === 1 || dayOfWeek === 5) { // Monday or Friday
          suggestions.push({
            date: festivalDate.toISOString().split('T')[0],
            reason: `${festival.name} long weekend`,
            type: "long_weekend",
            duration: festival.duration,
            description: `Take ${festival.duration} days around ${festival.name} to create an extended weekend`
          });
        } else {
          suggestions.push({
            date: festivalDate.toISOString().split('T')[0],
            reason: `${festival.name} celebration`,
            type: "festival",
            duration: festival.duration,
            description: `Celebrate ${festival.name} with family and friends`
          });
        }
      }
    }
  });
  
  // Generate monthly break suggestions
  let monthlyDate = new Date(currentDate);
  monthlyDate.setDate(15); // Mid-month
  
  while (monthlyDate <= end && suggestions.length < safeLeaveDays) {
    const dayOfWeek = monthlyDate.getDay();
    
    // Suggest Friday for long weekend
    if (dayOfWeek === 5) {
      suggestions.push({
        date: monthlyDate.toISOString().split('T')[0],
        reason: "Monthly mental health break",
        type: "long_weekend",
        duration: 1,
        description: "Take Friday off for a 3-day weekend to recharge"
      });
    }
    
    monthlyDate.setMonth(monthlyDate.getMonth() + 1);
  }
  
  // Add user-type specific suggestions
  if (userType === "student") {
    // Suggest breaks around exam periods (after exams)
    if (examDates) {
      suggestions.push({
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reason: "Post-exam relaxation",
        type: "extended",
        duration: 3,
        description: "Take a few days off after exams to celebrate and recharge"
      });
    }
    
    // Suggest semester break
    const midSemester = new Date(currentDate.getTime() + (end.getTime() - currentDate.getTime()) / 2);
    suggestions.push({
      date: midSemester.toISOString().split('T')[0],
      reason: "Mid-semester break",
      type: "extended",
      duration: 2,
      description: "Take a mid-semester break to avoid burnout"
    });
    
  } else {
    // Employee-specific suggestions
    if (projectDeadlines) {
      suggestions.push({
        date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reason: "Post-project completion",
        type: "extended",
        duration: 3,
        description: "Take time off after major project completion"
      });
    }
    
    // Suggest quarterly breaks
    const quarterBreak = new Date(currentDate);
    quarterBreak.setMonth(quarterBreak.getMonth() + 3);
    if (quarterBreak <= end) {
      suggestions.push({
        date: quarterBreak.toISOString().split('T')[0],
        reason: "Quarterly break",
        type: "extended",
        duration: 5,
        description: "Take a week off for quarterly rest and planning"
      });
    }
  }
  
  // Sort suggestions by date and limit to safe leave days
  return suggestions
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, Math.min(suggestions.length, Math.floor(safeLeaveDays / 2))); // Don't use all safe days
}
