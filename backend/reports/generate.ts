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
    userType: "student" | "employee";
    startDate: Date;
    endDate: Date;
    institutionType?: string;
    projectDeadlines?: string;
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
      const filename = `ai-holiday-planner-${userInfo.userType}-${timestamp}.${format === 'pdf' ? 'pdf' : 'csv'}`;
      
      // Generate enhanced AI summary
      const aiSummary = generateEnhancedAISummary(attendanceData, userInfo);
      
      // Create comprehensive report content
      const reportContent = {
        title: `${userInfo.userType === 'student' ? 'Student' : 'Employee'} AI Holiday Planning Report`,
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
          type: userInfo.userType,
          institutionType: userInfo.institutionType,
          projectDeadlines: userInfo.projectDeadlines
        },
        calendarIntegration: {
          aiFeatures: [
            "🎯 AI-Optimized Leave Date Recommendations",
            "📅 Smart Calendar Sync with Google/Outlook",
            "🤖 Intelligent Risk Assessment & Monitoring",
            "⚡ Real-time Attendance Tracking",
            "🌟 Festival & Holiday Optimization",
            "📱 Mobile-Ready Calendar Integration"
          ],
          benefits: [
            "Never miss optimal vacation windows",
            "Automatic attendance risk alerts",
            "Seamless calendar application integration",
            "Personalized planning based on your schedule",
            "AI-powered long weekend suggestions",
            "Strategic work-life balance optimization"
          ]
        }
      };
      
      console.log(`Generating ${format} report for ${userInfo.userType}`);
      
      // Generate actual file content based on format
      let fileContent: string;
      
      if (format === 'pdf') {
        // Generate PDF content using HTML template
        fileContent = generatePDFContent(reportContent);
      } else {
        // Generate comprehensive CSV content for Excel
        fileContent = generateEnhancedCSVContent(reportContent);
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

function generateEnhancedAISummary(attendanceData: any, userInfo: any): string {
  const { safeLeaveDays, totalDays, attendanceRule } = attendanceData;
  const { userType } = userInfo;
  
  let summary = "🤖 **AI Quick Analysis:** ";
  
  // Simplified risk assessment
  if (safeLeaveDays <= 0) {
    summary += "🚨 **CRITICAL:** Zero flexibility remaining. Perfect attendance required.";
  } else if (safeLeaveDays <= 3) {
    summary += "⚠️ **HIGH RISK:** Only single-day absences recommended.";
  } else if (safeLeaveDays <= 7) {
    summary += "🔶 **MODERATE:** Plan 2-3 day breaks with careful timing.";
  } else if (safeLeaveDays <= 15) {
    summary += "✅ **SAFE:** Good flexibility for strategic planning.";
  } else {
    summary += "🌟 **OPTIMAL:** Excellent flexibility for vacation planning.";
  }
  
  // Concise flexibility score
  const attendanceBuffer = (safeLeaveDays / totalDays) * 100;
  summary += ` 📊 **${attendanceBuffer.toFixed(0)}% flexibility buffer**. `;
  
  // Simple planning recommendation
  if (userType === "student") {
    summary += `🎓 **Student Tip:** Coordinate with academic calendar and avoid exam periods.`;
  } else {
    summary += `💼 **Professional Tip:** Plan around project deadlines and team schedules.`;
  }
  
  // Quick planning strategy
  if (safeLeaveDays > 15) {
    summary += ` 🚀 **Strategy:** Plan 2-3 major vacations with strategic spacing.`;
  } else if (safeLeaveDays > 7) {
    summary += ` 🎯 **Strategy:** One major vacation plus monthly breaks.`;
  } else if (safeLeaveDays > 3) {
    summary += ` ⚖️ **Strategy:** Quarterly long weekends with emergency reserves.`;
  } else if (safeLeaveDays > 0) {
    summary += ` 🎱 **Strategy:** Precise timing for maximum impact.`;
  }
  
  return summary;
}

function generatePDFContent(reportContent: any): string {
  // Generate PDF-optimized HTML content
  const htmlContent = generateEnhancedHTMLContent(reportContent);
  
  // For now, return HTML that will be converted to PDF on the frontend
  // In a real implementation, you would use a library like puppeteer or jsPDF
  return htmlContent;
}

function generateEnhancedHTMLContent(reportContent: any): string {
  return `<!DOCTYPE html>
<html>
<head>
    <title>${reportContent.title}</title>
    <meta charset="UTF-8">
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 40px; 
            line-height: 1.6;
            color: #333;
            font-size: 14px;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }
        .container {
            background: white;
            border-radius: 15px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
        }
        .header { 
            text-align: center; 
            margin-bottom: 40px; 
            border-bottom: 3px solid #667eea;
            padding-bottom: 25px;
        }
        .header h1 {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 15px;
            font-size: 32px;
            font-weight: bold;
        }
        .ai-badge {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 20px;
        }
        .summary { 
            background: linear-gradient(135deg, #f8fafc 0%, #e3f2fd 100%);
            padding: 25px; 
            margin: 25px 0; 
            border-radius: 15px;
            border: 2px solid #e3f2fd;
            box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        }
        .metric { 
            display: inline-block; 
            margin: 15px 20px; 
            padding: 20px;
            background: white;
            border-radius: 12px;
            border: 2px solid #e3f2fd;
            min-width: 160px;
            text-align: center;
            box-shadow: 0 5px 20px rgba(0,0,0,0.05);
            transition: transform 0.3s ease;
        }
        .metric:hover {
            transform: translateY(-5px);
        }
        .metric-value {
            font-size: 24px;
            font-weight: bold;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .metric-label {
            font-size: 11px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 600;
            margin-top: 5px;
        }
        .section { 
            margin: 30px 0; 
        }
        .recommendations, .warnings, .holiday-dates { 
            margin: 25px 0; 
        }
        .recommendation, .warning, .holiday-date { 
            padding: 15px; 
            margin: 10px 0; 
            border-radius: 10px;
            border-left: 5px solid #10b981;
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            font-size: 14px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }
        .warning { 
            border-left-color: #f59e0b; 
            background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
        }
        .holiday-date {
            border-left-color: #3b82f6;
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
        }
        .ai-summary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin: 30px 0;
            box-shadow: 0 15px 35px rgba(102, 126, 234, 0.3);
        }
        .ai-summary h3 {
            margin-top: 0;
            font-size: 20px;
            display: flex;
            align-items: center;
        }
        .ai-summary-content {
            font-size: 15px;
            line-height: 1.8;
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 10px;
            margin-top: 20px;
            backdrop-filter: blur(10px);
        }
        .calendar-integration {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin: 30px 0;
            box-shadow: 0 15px 35px rgba(79, 172, 254, 0.3);
        }
        .calendar-integration h3 {
            margin-top: 0;
            font-size: 20px;
        }
        .integration-features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        .feature-item {
            background: rgba(255,255,255,0.15);
            padding: 15px;
            border-radius: 10px;
            font-size: 14px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
        }
        .benefits-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        .benefit-item {
            background: rgba(255,255,255,0.1);
            padding: 12px;
            border-radius: 8px;
            font-size: 13px;
            text-align: center;
            backdrop-filter: blur(5px);
        }
        .user-info {
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            padding: 20px;
            border-radius: 10px;
            margin-top: 25px;
            border: 2px solid #e2e8f0;
        }
        .user-info-item {
            margin: 8px 0;
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
            font-size: 22px;
            color: #1e293b;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 10px;
        }
        h3 {
            font-size: 18px;
            color: #334155;
        }
        h4 {
            font-size: 16px;
            color: #475569;
        }
        .ai-icon {
            display: inline-block;
            margin-right: 10px;
            font-size: 20px;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            color: #64748b;
            font-size: 12px;
            padding-top: 25px;
            border-top: 2px solid #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="ai-badge">🤖 AI-POWERED ANALYSIS</div>
            <h1>${reportContent.title}</h1>
            <p><strong>Generated on:</strong> ${new Date(reportContent.generatedAt).toLocaleDateString()}</p>
            <p><strong>Planning Period:</strong> ${reportContent.period}</p>
        </div>
        
        <div class="summary">
            <h2>📊 Executive Summary</h2>
            <div class="metric">
                <div class="metric-value">${reportContent.summary.totalDays}</div>
                <div class="metric-label">Total Working Days</div>
            </div>
            <div class="metric">
                <div class="metric-value">${reportContent.summary.requiredDays}</div>
                <div class="metric-label">Required Attendance</div>
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
                <div class="metric-label">Current Status</div>
            </div>
        </div>
        
        <div class="ai-summary">
            <h3><span class="ai-icon">🤖</span>Advanced AI Analysis & Strategic Insights</h3>
            <div class="ai-summary-content">
                ${reportContent.aiSummary}
            </div>
        </div>
        
        <div class="calendar-integration">
            <h3><span class="ai-icon">📅</span>AI Calendar Integration Features</h3>
            <div class="integration-features">
                ${reportContent.calendarIntegration.aiFeatures.map((feature: string) => `<div class="feature-item">${feature}</div>`).join('')}
            </div>
            <h4 style="margin-top: 25px; color: white;">🌟 Key Benefits:</h4>
            <div class="benefits-grid">
                ${reportContent.calendarIntegration.benefits.map((benefit: string) => `<div class="benefit-item">• ${benefit}</div>`).join('')}
            </div>
        </div>
        
        ${reportContent.recommendations.length > 0 ? `
        <div class="recommendations">
            <h2>🎯 AI Recommendations</h2>
            ${reportContent.recommendations.map((rec: string) => `<div class="recommendation">✓ ${rec}</div>`).join('')}
        </div>
        ` : ''}
        
        ${reportContent.warnings.length > 0 ? `
        <div class="warnings">
            <h2>⚠️ Important Warnings</h2>
            ${reportContent.warnings.map((warning: string) => `<div class="warning">⚠ ${warning}</div>`).join('')}
        </div>
        ` : ''}
        
        ${reportContent.suggestedHolidayDates.length > 0 ? `
        <div class="holiday-dates">
            <h2>🎉 AI-Suggested Holiday Periods</h2>
            ${reportContent.suggestedHolidayDates.map((date: string) => `<div class="holiday-date">📅 ${date}</div>`).join('')}
        </div>
        ` : ''}
        
        <div class="section">
            <h2>👤 User Information</h2>
            <div class="user-info">
                <div class="user-info-item"><strong>User Type:</strong> ${reportContent.userInfo.type}</div>
                ${reportContent.userInfo.institutionType ? `<div class="user-info-item"><strong>Institution Type:</strong> ${reportContent.userInfo.institutionType}</div>` : ''}
                ${reportContent.userInfo.projectDeadlines ? `<div class="user-info-item"><strong>Project Deadlines:</strong> ${reportContent.userInfo.projectDeadlines}</div>` : ''}
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Generated by AI Holiday Planner</strong> - Next-Generation Attendance Management</p>
            <p>🤖 Powered by Advanced AI • 📅 Calendar-Ready Integration • 🎯 Personalized Optimization</p>
            <p>Visit our platform for real-time updates and continued AI assistance</p>
        </div>
    </div>
</body>
</html>`;
}

function generateEnhancedCSVContent(reportContent: any): string {
  const csvContent = [
    ['🤖 AI Holiday Planner - Advanced Attendance Report'],
    [''],
    ['Generated On', new Date(reportContent.generatedAt).toLocaleDateString()],
    ['Planning Period', reportContent.period],
    ['AI Analysis Type', 'Advanced Calendar Integration'],
    [''],
    ['📊 EXECUTIVE SUMMARY'],
    ['Total Working Days', reportContent.summary.totalDays],
    ['Required Attendance Days', reportContent.summary.requiredDays],
    ['Safe Leave Days Available', reportContent.summary.safeLeaveDays],
    ['Attendance Rule', `${reportContent.summary.attendanceRule}%`],
    ['Current Status', reportContent.summary.status],
    [''],
    ['🤖 ADVANCED AI ANALYSIS & STRATEGIC INSIGHTS'],
    [reportContent.aiSummary],
    [''],
    ['🎯 AI RECOMMENDATIONS'],
    ...reportContent.recommendations.map((rec: string) => [`✓ ${rec}`]),
    [''],
    ['⚠️ IMPORTANT WARNINGS'],
    ...reportContent.warnings.map((warning: string) => [`⚠ ${warning}`]),
    [''],
    ['🎉 AI-SUGGESTED HOLIDAY PERIODS'],
    ...reportContent.suggestedHolidayDates.map((date: string) => [`📅 ${date}`]),
    [''],
    ['📅 AI CALENDAR INTEGRATION FEATURES'],
    ...reportContent.calendarIntegration.aiFeatures.map((feature: string) => [feature]),
    [''],
    ['🌟 KEY BENEFITS'],
    ...reportContent.calendarIntegration.benefits.map((benefit: string) => [`• ${benefit}`]),
    [''],
    ['👤 USER INFORMATION'],
    ['User Type', reportContent.userInfo.type],
    ...(reportContent.userInfo.institutionType ? [['Institution Type', reportContent.userInfo.institutionType]] : []),
    ...(reportContent.userInfo.projectDeadlines ? [['Project Deadlines', reportContent.userInfo.projectDeadlines]] : []),
    [''],
    ['📋 REPORT METADATA'],
    ['Generated By', 'AI Holiday Planner'],
    ['Analysis Engine', 'Advanced AI with Calendar Integration'],
    ['Report Version', '2.0 - Enhanced AI Features'],
    ['Support Contact', 'Available through platform chat assistant']
  ];
  
  return csvContent.map(row => row.map((cell: string | number) => `"${cell}"`).join(',')).join('\n');
}
