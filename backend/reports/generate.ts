import { api } from "encore.dev/api";

export interface ExportRequest {
  attendanceData: {
    totalDays: number;
    requiredDays: number;
    safeLeaveDays: number;
    attendanceRule: number;
    recommendations: string[];
    warnings: string[];
    suggestedHolidayDates?: string[];
  };
  userInfo: {
    email: string;
    userType: "student" | "employee";
    startDate: Date;
    endDate: Date;
    institutionType?: string;
    workType?: string;
    preferredHolidayType?: string;
  };
  format: "pdf" | "excel";
}

export interface ExportResponse {
  downloadUrl: string;
  filename: string;
  fileContent: string;
}

// Generates PDF or Excel reports with attendance analysis and AI recommendations.
export const generate = api<ExportRequest, ExportResponse>(
  { expose: true, method: "POST", path: "/export/generate" },
  async (req) => {
    const { attendanceData, userInfo, format } = req;
    
    try {
      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `attendance-report-${userInfo.userType}-${timestamp}.${format === 'pdf' ? 'html' : 'csv'}`;
      
      // Generate AI summary
      const aiSummary = generateAISummary(attendanceData, userInfo);
      
      // Create report content
      const reportContent = {
        title: `${userInfo.userType === 'student' ? 'Student' : 'Employee'} Attendance Report`,
        generatedAt: new Date().toISOString(),
        period: `${userInfo.startDate.toDateString()} - ${userInfo.endDate.toDateString()}`,
        summary: {
          totalDays: attendanceData.totalDays,
          requiredDays: attendanceData.requiredDays,
          safeLeaveDays: attendanceData.safeLeaveDays,
          attendanceRule: attendanceData.attendanceRule,
          status: attendanceData.safeLeaveDays > 0 ? 'Safe' : 'At Risk'
        },
        recommendations: attendanceData.recommendations,
        warnings: attendanceData.warnings,
        suggestedHolidayDates: attendanceData.suggestedHolidayDates || [],
        aiSummary,
        userInfo: {
          email: userInfo.email,
          type: userInfo.userType,
          institutionType: userInfo.institutionType,
          workType: userInfo.workType,
          preferredHolidayType: userInfo.preferredHolidayType
        },
        calendarIntegration: {
          googleCalendar: "Ready for integration - Connect your Google Calendar to automatically sync attendance tracking and holiday planning",
          outlook: "Ready for integration - Connect your Outlook Calendar to streamline your schedule management",
          features: [
            "Automatic attendance tracking",
            "Holiday reminder notifications",
            "Smart scheduling suggestions",
            "Conflict detection and resolution"
          ]
        }
      };
      
      console.log(`Generating ${format} report for ${userInfo.email}`);
      
      // Generate actual file content based on format
      let fileContent: string;
      
      if (format === 'pdf') {
        // Generate HTML content that can be saved as PDF
        fileContent = generateHTMLContent(reportContent);
      } else {
        // Generate CSV content for Excel
        fileContent = generateCSVContent(reportContent);
      }
      
      return {
        downloadUrl: '', // Not used in new implementation
        filename,
        fileContent
      };
    } catch (error) {
      console.error('Report generation error:', error);
      throw new Error('Failed to generate report');
    }
  }
);

function generateAISummary(attendanceData: any, userInfo: any): string {
  const { safeLeaveDays, totalDays, requiredDays, attendanceRule } = attendanceData;
  const { userType, preferredHolidayType } = userInfo;
  
  let summary = "AI Summary: ";
  
  // Risk assessment
  if (safeLeaveDays <= 0) {
    summary += "⚠️ Critical: You must attend ALL remaining days to meet requirements. ";
  } else if (safeLeaveDays <= 3) {
    summary += "⚠️ High Risk: Avoid more than 1 consecutive absence to stay safe. ";
  } else if (safeLeaveDays <= 7) {
    summary += "⚠️ Moderate Risk: Limit consecutive absences to 2 days maximum. ";
  } else {
    summary += "✅ Safe Zone: You have good flexibility for planning leaves. ";
  }
  
  // Attendance trend analysis
  const attendanceBuffer = (safeLeaveDays / totalDays) * 100;
  if (attendanceBuffer < 5) {
    summary += "Your attendance trend suggests maintaining perfect attendance for the remaining period. ";
  } else if (attendanceBuffer < 10) {
    summary += "Your attendance trend suggests careful planning with minimal consecutive absences. ";
  } else {
    summary += "Your attendance trend allows for strategic leave planning with good safety margins. ";
  }
  
  // Personalized recommendations based on user type
  if (userType === "student") {
    if (preferredHolidayType === "week-long" && safeLeaveDays >= 7) {
      summary += "Optimal timing for your preferred week-long trips would be during semester breaks or reading weeks. ";
    } else if (preferredHolidayType === "long-weekend") {
      summary += "Your preference for long weekends aligns well with your attendance flexibility. ";
    }
    summary += "Focus on planning around exam schedules and major assignment deadlines. ";
  } else {
    if (preferredHolidayType === "week-long" && safeLeaveDays >= 7) {
      summary += "Consider planning your week-long vacation during company holiday periods for maximum time off. ";
    }
    summary += "Coordinate with team schedules and project milestones for optimal leave timing. ";
  }
  
  // Final strategic advice
  if (safeLeaveDays > 10) {
    summary += "Consider keeping 20% of your safe days as emergency buffer for unexpected situations.";
  } else if (safeLeaveDays > 5) {
    summary += "Maintain a 2-3 day emergency buffer for unexpected situations.";
  } else if (safeLeaveDays > 0) {
    summary += "Use your limited safe days strategically for the most important personal commitments.";
  }
  
  return summary;
}

function generateHTMLContent(reportContent: any): string {
  return `<!DOCTYPE html>
<html>
<head>
    <title>${reportContent.title}</title>
    <meta charset="UTF-8">
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            line-height: 1.6;
            color: #333;
            font-size: 14px;
        }
        .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #7c3aed;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #7c3aed;
            margin-bottom: 10px;
            font-size: 28px;
        }
        .summary { 
            background: #f8fafc; 
            padding: 20px; 
            margin: 20px 0; 
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        .section { 
            margin: 20px 0; 
        }
        .metric { 
            display: inline-block; 
            margin: 10px 20px; 
            padding: 10px;
            background: white;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
            min-width: 150px;
            text-align: center;
        }
        .metric-value {
            font-size: 20px;
            font-weight: bold;
            color: #7c3aed;
        }
        .metric-label {
            font-size: 11px;
            color: #64748b;
            text-transform: uppercase;
        }
        .recommendations, .warnings, .holiday-dates { 
            margin: 20px 0; 
        }
        .recommendation, .warning, .holiday-date { 
            padding: 12px; 
            margin: 8px 0; 
            border-radius: 6px;
            border-left: 4px solid #10b981;
            background: #f0fdf4;
            font-size: 14px;
        }
        .warning { 
            border-left-color: #f59e0b; 
            background: #fffbeb;
        }
        .holiday-date {
            border-left-color: #3b82f6;
            background: #eff6ff;
        }
        .ai-summary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            margin: 25px 0;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .ai-summary h3 {
            margin-top: 0;
            font-size: 18px;
            display: flex;
            align-items: center;
        }
        .ai-summary-content {
            font-size: 15px;
            line-height: 1.7;
            background: rgba(255,255,255,0.1);
            padding: 15px;
            border-radius: 8px;
            margin-top: 15px;
        }
        .calendar-integration {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            margin: 25px 0;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .calendar-integration h3 {
            margin-top: 0;
            font-size: 18px;
        }
        .integration-item {
            background: rgba(255,255,255,0.1);
            padding: 12px;
            border-radius: 6px;
            margin: 10px 0;
            font-size: 14px;
        }
        .integration-features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
            margin-top: 15px;
        }
        .feature-item {
            background: rgba(255,255,255,0.1);
            padding: 10px;
            border-radius: 6px;
            font-size: 13px;
            text-align: center;
        }
        .user-info {
            background: #f1f5f9;
            padding: 15px;
            border-radius: 6px;
            margin-top: 20px;
        }
        .user-info-item {
            margin: 5px 0;
            font-size: 14px;
        }
        .status-safe {
            color: #10b981;
            font-weight: bold;
        }
        .status-risk {
            color: #ef4444;
            font-weight: bold;
        }
        h2 {
            font-size: 20px;
        }
        h3 {
            font-size: 18px;
        }
        h4 {
            font-size: 16px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${reportContent.title}</h1>
        <p><strong>Generated on:</strong> ${new Date(reportContent.generatedAt).toLocaleDateString()}</p>
        <p><strong>Period:</strong> ${reportContent.period}</p>
    </div>
    
    <div class="summary">
        <h2>Summary</h2>
        <div class="metric">
            <div class="metric-value">${reportContent.summary.totalDays}</div>
            <div class="metric-label">Total Days</div>
        </div>
        <div class="metric">
            <div class="metric-value">${reportContent.summary.requiredDays}</div>
            <div class="metric-label">Required Days</div>
        </div>
        <div class="metric">
            <div class="metric-value">${reportContent.summary.safeLeaveDays}</div>
            <div class="metric-label">Safe Leave Days</div>
        </div>
        <div class="metric">
            <div class="metric-value">${reportContent.summary.attendanceRule}%</div>
            <div class="metric-label">Attendance Rule</div>
        </div>
        <div class="metric">
            <div class="metric-value">
                <span class="${reportContent.summary.status === 'Safe' ? 'status-safe' : 'status-risk'}">
                    ${reportContent.summary.status}
                </span>
            </div>
            <div class="metric-label">Status</div>
        </div>
    </div>
    
    <div class="ai-summary">
        <h3>🤖 AI Analysis & Strategic Insights</h3>
        <div class="ai-summary-content">
            ${reportContent.aiSummary}
        </div>
    </div>
    
    ${reportContent.recommendations.length > 0 ? `
    <div class="recommendations">
        <h2>AI Recommendations</h2>
        ${reportContent.recommendations.map((rec: string) => `<div class="recommendation">✓ ${rec}</div>`).join('')}
    </div>
    ` : ''}
    
    ${reportContent.warnings.length > 0 ? `
    <div class="warnings">
        <h2>Important Warnings</h2>
        ${reportContent.warnings.map((warning: string) => `<div class="warning">⚠ ${warning}</div>`).join('')}
    </div>
    ` : ''}
    
    ${reportContent.suggestedHolidayDates.length > 0 ? `
    <div class="holiday-dates">
        <h2>Suggested Holiday Dates</h2>
        ${reportContent.suggestedHolidayDates.map((date: string) => `<div class="holiday-date">📅 ${date}</div>`).join('')}
    </div>
    ` : ''}
    
    <div class="calendar-integration">
        <h3>📅 Future-Ready Calendar Integration</h3>
        <div class="integration-item">
            <strong>Google Calendar:</strong> ${reportContent.calendarIntegration.googleCalendar}
        </div>
        <div class="integration-item">
            <strong>Microsoft Outlook:</strong> ${reportContent.calendarIntegration.outlook}
        </div>
        <div class="integration-features">
            ${reportContent.calendarIntegration.features.map((feature: string) => `<div class="feature-item">• ${feature}</div>`).join('')}
        </div>
    </div>
    
    <div class="section">
        <h2>User Information</h2>
        <div class="user-info">
            <div class="user-info-item"><strong>Email:</strong> ${reportContent.userInfo.email}</div>
            <div class="user-info-item"><strong>Type:</strong> ${reportContent.userInfo.type}</div>
            ${reportContent.userInfo.institutionType ? `<div class="user-info-item"><strong>Institution Type:</strong> ${reportContent.userInfo.institutionType}</div>` : ''}
            ${reportContent.userInfo.workType ? `<div class="user-info-item"><strong>Work Type:</strong> ${reportContent.userInfo.workType}</div>` : ''}
            ${reportContent.userInfo.preferredHolidayType ? `<div class="user-info-item"><strong>Preferred Holiday Type:</strong> ${reportContent.userInfo.preferredHolidayType}</div>` : ''}
        </div>
    </div>
    
    <div style="margin-top: 40px; text-align: center; color: #64748b; font-size: 11px;">
        <p>Generated by AI Holiday Planner - Intelligent Attendance Management</p>
        <p>Future-ready with Google Calendar & Outlook integration capabilities</p>
    </div>
</body>
</html>`;
}

function generateCSVContent(reportContent: any): string {
  const csvContent = [
    ['AI Holiday Planner - Attendance Report'],
    [''],
    ['Generated On', new Date(reportContent.generatedAt).toLocaleDateString()],
    ['Period', reportContent.period],
    [''],
    ['SUMMARY'],
    ['Total Days', reportContent.summary.totalDays],
    ['Required Days', reportContent.summary.requiredDays],
    ['Safe Leave Days', reportContent.summary.safeLeaveDays],
    ['Attendance Rule', `${reportContent.summary.attendanceRule}%`],
    ['Status', reportContent.summary.status],
    [''],
    ['AI ANALYSIS & STRATEGIC INSIGHTS'],
    [reportContent.aiSummary],
    [''],
    ['AI RECOMMENDATIONS'],
    ...reportContent.recommendations.map((rec: string) => [`✓ ${rec}`]),
    [''],
    ['WARNINGS'],
    ...reportContent.warnings.map((warning: string) => [`⚠ ${warning}`]),
    [''],
    ['SUGGESTED HOLIDAY DATES'],
    ...reportContent.suggestedHolidayDates.map((date: string) => [`📅 ${date}`]),
    [''],
    ['FUTURE-READY CALENDAR INTEGRATION'],
    ['Google Calendar', reportContent.calendarIntegration.googleCalendar],
    ['Microsoft Outlook', reportContent.calendarIntegration.outlook],
    [''],
    ['INTEGRATION FEATURES'],
    ...reportContent.calendarIntegration.features.map((feature: string) => [`• ${feature}`]),
    [''],
    ['USER INFORMATION'],
    ['Email', reportContent.userInfo.email],
    ['Type', reportContent.userInfo.type],
    ...(reportContent.userInfo.institutionType ? [['Institution Type', reportContent.userInfo.institutionType]] : []),
    ...(reportContent.userInfo.workType ? [['Work Type', reportContent.userInfo.workType]] : []),
    ...(reportContent.userInfo.preferredHolidayType ? [['Preferred Holiday Type', reportContent.userInfo.preferredHolidayType]] : [])
  ];
  
  return csvContent.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}
