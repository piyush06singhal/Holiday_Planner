import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Calendar, Download, AlertTriangle, CheckCircle, TrendingUp, GraduationCap, Briefcase, CalendarDays, Sparkles, MapPin, Clock } from 'lucide-react';
import backend from '~backend/client';
import type { CalculateAttendanceRequest, AttendanceCalculation } from '~backend/attendance/calculate';
import type { PublicHolidaysRequest, PublicHolidaysResponse } from '~backend/calendar/integration';

const CalculatorPage = () => {
  const [activeTab, setActiveTab] = useState<'student' | 'employee'>('student');
  const [formData, setFormData] = useState({
    email: '',
    startDate: '',
    endDate: '',
    attendanceRule: activeTab === 'student' ? '75' : '80',
    currentAttendancePercentage: '',
    leavesAvailedAlready: '',
    institutionType: '',
    examDates: '',
    projectDeadlines: ''
  });
  const [result, setResult] = useState<AttendanceCalculation | null>(null);
  const [publicHolidays, setPublicHolidays] = useState<PublicHolidaysResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingHolidays, setIsLoadingHolidays] = useState(false);
  const { toast } = useToast();

  const handleTabChange = (tab: 'student' | 'employee') => {
    setActiveTab(tab);
    setFormData(prev => ({
      ...prev,
      attendanceRule: tab === 'student' ? '75' : '80',
      institutionType: '',
      examDates: '',
      projectDeadlines: ''
    }));
    setResult(null);
    setPublicHolidays(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const fetchPublicHolidays = async () => {
    if (!formData.startDate || !formData.endDate) {
      toast({
        title: "Missing Dates",
        description: "Please select start and end dates first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingHolidays(true);
    try {
      const request: PublicHolidaysRequest = {
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        country: "IN"
      };

      const holidays = await backend.calendar.getPublicHolidays(request);
      setPublicHolidays(holidays);
      
      toast({
        title: "Holidays Loaded",
        description: `Found ${holidays.holidays.length} public holidays and ${holidays.suggestedLongWeekends.length} long weekend opportunities!`,
      });
    } catch (error) {
      console.error('Error fetching holidays:', error);
      toast({
        title: "Holiday Fetch Error",
        description: "Failed to fetch public holidays. Using fallback data.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingHolidays(false);
    }
  };

  const handleCalculate = async () => {
    if (!formData.email || !formData.startDate || !formData.endDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const request: CalculateAttendanceRequest = {
        email: formData.email,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        attendanceRule: parseInt(formData.attendanceRule),
        userType: activeTab,
        currentAttendancePercentage: formData.currentAttendancePercentage ? parseFloat(formData.currentAttendancePercentage) : undefined,
        leavesAvailedAlready: formData.leavesAvailedAlready ? parseInt(formData.leavesAvailedAlready) : undefined,
        institutionType: formData.institutionType || undefined,
        examDates: formData.examDates || undefined,
        projectDeadlines: formData.projectDeadlines || undefined
      };

      const calculation = await backend.attendance.calculate(request);
      setResult(calculation);
      
      // Auto-fetch holidays after calculation
      if (!publicHolidays) {
        await fetchPublicHolidays();
      }
      
      toast({
        title: "Calculation Complete",
        description: `Your ${activeTab} attendance analysis is ready!`,
      });
    } catch (error) {
      console.error('Calculation error:', error);
      toast({
        title: "Calculation Error",
        description: "Failed to calculate attendance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    if (!result) return;

    setIsExporting(true);
    try {
      const exportData = {
        attendanceData: {
          totalDays: result.totalDays,
          requiredDays: result.requiredDays,
          safeLeaveDays: result.safeLeaveDays,
          attendanceRule: parseInt(formData.attendanceRule),
          recommendations: result.recommendations,
          warnings: result.warnings,
          suggestedHolidayDates: result.suggestedHolidayDates || []
        },
        userInfo: {
          email: formData.email,
          userType: activeTab,
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
          institutionType: formData.institutionType,
          projectDeadlines: formData.projectDeadlines
        },
        format
      };

      const response = await backend.reports.generate(exportData);
      
      // Create a blob from the response data
      const blob = new Blob([response.fileContent], { 
        type: format === 'pdf' ? 'application/pdf' : 'text/csv' 
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = response.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export Ready",
        description: `Your ${format.toUpperCase()} report has been downloaded!`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-indigo-50 via-purple-50 via-pink-50 to-rose-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-violet-400/30 via-purple-400/30 to-fuchsia-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-emerald-400/30 via-teal-400/30 to-cyan-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-r from-amber-400/20 via-orange-400/20 to-rose-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="h-8 w-8 text-violet-600 mr-2 animate-pulse" />
            <span className="text-violet-600 font-medium text-lg">AI-Powered Analysis</span>
            <Sparkles className="h-8 w-8 text-emerald-600 ml-2 animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 via-fuchsia-600 to-rose-600 bg-clip-text text-transparent mb-8 animate-bounce-slow">
            AI Attendance Calculator
          </h1>
          <p className="text-xl text-gray-700 max-w-4xl mx-auto">
            Plan your semester or work year smartly with AI-powered attendance insights and holiday recommendations.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex justify-center mb-12 animate-slide-up">
          <div className="bg-white/90 backdrop-blur-xl border-2 border-violet-300 rounded-2xl p-2 shadow-2xl">
            <button
              onClick={() => handleTabChange('student')}
              className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-semibold transition-all duration-500 hover:scale-105 ${
                activeTab === 'student'
                  ? 'bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 text-white shadow-2xl transform scale-105'
                  : 'text-gray-700 hover:text-violet-600 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50'
              }`}
            >
              <GraduationCap className="h-5 w-5" />
              <span>Student</span>
            </button>
            <button
              onClick={() => handleTabChange('employee')}
              className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-semibold transition-all duration-500 hover:scale-105 ${
                activeTab === 'employee'
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-2xl transform scale-105'
                  : 'text-gray-700 hover:text-emerald-600 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50'
              }`}
            >
              <Briefcase className="h-5 w-5" />
              <span>Employee</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Input Form */}
          <Card className="p-8 bg-white/90 backdrop-blur-xl border-2 border-violet-300 shadow-2xl hover:shadow-violet-500/30 transition-all duration-500 hover:scale-105 transform-gpu animate-slide-left">
            <div className="space-y-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className={`w-10 h-10 ${
                  activeTab === 'student' 
                    ? 'bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500' 
                    : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500'
                } rounded-lg flex items-center justify-center shadow-xl animate-pulse`}>
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {activeTab === 'student' ? 'Semester Details' : 'Annual Planning'}
                </h2>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="group">
                  <Label htmlFor="email" className="text-gray-800 font-medium">
                    {activeTab === 'student' ? 'Email Address' : 'Work Email Address'}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder={activeTab === 'student' ? 'your.email@university.edu' : 'your.email@company.com'}
                    className="mt-2 bg-white border-2 border-gray-400 text-gray-900 placeholder:text-gray-600 focus:border-violet-500 hover:border-violet-400 transition-all duration-300 py-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="group">
                    <Label htmlFor="startDate" className="text-gray-800 font-medium">
                      {activeTab === 'student' ? 'Semester Start' : 'Year Start'}
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className="mt-2 bg-white border-2 border-gray-400 text-gray-900 focus:border-violet-500 hover:border-violet-400 transition-all duration-300 py-2"
                    />
                  </div>
                  <div className="group">
                    <Label htmlFor="endDate" className="text-gray-800 font-medium">
                      {activeTab === 'student' ? 'Semester End' : 'Year End'}
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className="mt-2 bg-white border-2 border-gray-400 text-gray-900 focus:border-violet-500 hover:border-violet-400 transition-all duration-300 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="group">
                    <Label htmlFor="attendanceRule" className="text-gray-800 font-medium">Attendance Requirement (%)</Label>
                    <Input
                      id="attendanceRule"
                      type="number"
                      value={formData.attendanceRule}
                      onChange={(e) => handleInputChange('attendanceRule', e.target.value)}
                      min="1"
                      max="100"
                      className="mt-2 bg-white border-2 border-gray-400 text-gray-900 focus:border-violet-500 hover:border-violet-400 transition-all duration-300 py-2"
                    />
                  </div>
                  <div className="group">
                    <Label htmlFor="currentAttendancePercentage" className="text-gray-800 font-medium">
                      Current Attendance % (Optional)
                    </Label>
                    <Input
                      id="currentAttendancePercentage"
                      type="number"
                      value={formData.currentAttendancePercentage}
                      onChange={(e) => handleInputChange('currentAttendancePercentage', e.target.value)}
                      placeholder="e.g., 85"
                      min="0"
                      max="100"
                      step="0.1"
                      className="mt-2 bg-white border-2 border-gray-400 text-gray-900 placeholder:text-gray-600 focus:border-violet-500 hover:border-violet-400 transition-all duration-300 py-2"
                    />
                  </div>
                </div>

                <div className="group">
                  <Label htmlFor="leavesAvailedAlready" className="text-gray-800 font-medium">
                    Leaves Availed Already (Optional)
                  </Label>
                  <Input
                    id="leavesAvailedAlready"
                    type="number"
                    value={formData.leavesAvailedAlready}
                    onChange={(e) => handleInputChange('leavesAvailedAlready', e.target.value)}
                    placeholder="Number of days already taken off"
                    className="mt-2 bg-white border-2 border-gray-400 text-gray-900 placeholder:text-gray-600 focus:border-violet-500 hover:border-violet-400 transition-all duration-300 py-2"
                  />
                </div>

                {activeTab === 'student' ? (
                  <>
                    <div className="group">
                      <Label htmlFor="institutionType" className="text-gray-800 font-medium">Institution Type</Label>
                      <Select value={formData.institutionType} onValueChange={(value) => handleInputChange('institutionType', value)}>
                        <SelectTrigger className="mt-2 bg-white border-2 border-gray-400 text-gray-900 focus:border-violet-500 hover:border-violet-400 transition-all duration-300 py-2">
                          <SelectValue placeholder="Select institution type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="university">University</SelectItem>
                          <SelectItem value="college">College</SelectItem>
                          <SelectItem value="school">School</SelectItem>
                          <SelectItem value="technical">Technical Institute</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="group">
                      <Label htmlFor="examDates" className="text-gray-800 font-medium">Important Exam Dates (Optional)</Label>
                      <Input
                        id="examDates"
                        type="text"
                        value={formData.examDates}
                        onChange={(e) => handleInputChange('examDates', e.target.value)}
                        placeholder="e.g., Mid-terms: March 15-20, Finals: May 10-15"
                        className="mt-2 bg-white border-2 border-gray-400 text-gray-900 placeholder:text-gray-600 focus:border-violet-500 hover:border-violet-400 transition-all duration-300 py-2"
                      />
                    </div>
                  </>
                ) : (
                  <div className="group">
                    <Label htmlFor="projectDeadlines" className="text-gray-800 font-medium">Project Deadlines (Optional)</Label>
                    <Input
                      id="projectDeadlines"
                      type="text"
                      value={formData.projectDeadlines}
                      onChange={(e) => handleInputChange('projectDeadlines', e.target.value)}
                      placeholder="e.g., Q1 Report: March 31, Product Launch: June 15"
                      className="mt-2 bg-white border-2 border-gray-400 text-gray-900 placeholder:text-gray-600 focus:border-violet-500 hover:border-violet-400 transition-all duration-300 py-2"
                    />
                  </div>
                )}
              </div>

              {/* Holiday Integration Button */}
              <Button
                onClick={fetchPublicHolidays}
                disabled={isLoadingHolidays || !formData.startDate || !formData.endDate}
                variant="outline"
                className="w-full border-2 border-emerald-400 text-emerald-600 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 hover:border-emerald-500 py-3 text-lg font-semibold shadow-lg hover:shadow-emerald-500/40 transition-all duration-500 hover:scale-105 transform-gpu rounded-xl"
              >
                {isLoadingHolidays ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading Holidays...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5" />
                    <span>Load Public Holidays</span>
                  </div>
                )}
              </Button>

              <Button
                onClick={handleCalculate}
                disabled={isLoading}
                className={`w-full ${
                  activeTab === 'student'
                    ? 'bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600'
                    : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600'
                } text-white py-3 text-lg font-semibold shadow-2xl hover:shadow-violet-500/40 transition-all duration-500 hover:scale-105 transform-gpu rounded-xl`}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Calculating...</span>
                  </div>
                ) : (
                  'Calculate with AI'
                )}
              </Button>
            </div>
          </Card>

          {/* Results */}
          <Card className="p-8 bg-white/90 backdrop-blur-xl border-2 border-violet-300 shadow-2xl hover:shadow-violet-500/30 transition-all duration-500 hover:scale-105 transform-gpu animate-slide-right">
            {result ? (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <TrendingUp className={`h-6 w-6 ${
                    activeTab === 'student' ? 'text-violet-600' : 'text-emerald-600'
                  } animate-pulse`} />
                  <h3 className="text-2xl font-bold text-gray-900">AI Analysis Results</h3>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 ${
                    activeTab === 'student'
                      ? 'bg-gradient-to-r from-violet-100 via-purple-100 to-fuchsia-100 border-violet-400'
                      : 'bg-gradient-to-r from-emerald-100 via-teal-100 to-cyan-100 border-emerald-400'
                  } rounded-xl border-2 hover:scale-105 transition-transform duration-300 shadow-lg`}>
                    <div className={`text-2xl font-bold ${
                      activeTab === 'student' ? 'text-violet-700' : 'text-emerald-700'
                    }`}>{result.safeLeaveDays}</div>
                    <div className="text-gray-700 font-medium">Safe Leave Days</div>
                  </div>
                  <div className={`p-4 ${
                    activeTab === 'student'
                      ? 'bg-gradient-to-r from-fuchsia-100 via-pink-100 to-rose-100 border-fuchsia-400'
                      : 'bg-gradient-to-r from-cyan-100 via-blue-100 to-indigo-100 border-cyan-400'
                  } rounded-xl border-2 hover:scale-105 transition-transform duration-300 shadow-lg`}>
                    <div className={`text-2xl font-bold ${
                      activeTab === 'student' ? 'text-fuchsia-700' : 'text-cyan-700'
                    }`}>{result.totalDays}</div>
                    <div className="text-gray-700 font-medium">Total Working Days</div>
                  </div>
                </div>

                {/* Status */}
                <div className={`p-4 rounded-xl border-2 hover:scale-105 transition-transform duration-300 shadow-lg ${
                  result.isAtRisk 
                    ? 'bg-gradient-to-r from-red-100 to-orange-100 border-red-400' 
                    : 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-400'
                }`}>
                  <div className="flex items-center space-x-3">
                    {result.isAtRisk ? (
                      <AlertTriangle className="h-5 w-5 text-red-600 animate-pulse" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-600 animate-pulse" />
                    )}
                    <span className={`font-semibold ${
                      result.isAtRisk ? 'text-red-700' : 'text-green-700'
                    }`}>
                      {result.isAtRisk ? 'At Risk' : 'Safe Zone'}
                    </span>
                  </div>
                </div>

                {/* Suggested Leave Dates */}
                {result.suggestedLeaveDates && result.suggestedLeaveDates.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <CalendarDays className={`h-4 w-4 ${
                        activeTab === 'student' ? 'text-violet-600' : 'text-emerald-600'
                      } mr-2 animate-pulse`} />
                      AI-Suggested Leave Dates
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {result.suggestedLeaveDates.map((suggestion, index) => (
                        <div key={index} className={`p-3 ${
                          suggestion.type === 'festival' 
                            ? 'bg-gradient-to-r from-orange-100 to-yellow-100 border-orange-400'
                            : suggestion.type === 'long_weekend'
                            ? 'bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-400'
                            : 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-400'
                        } border-2 rounded-lg hover:scale-105 transition-transform duration-300 shadow-lg`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-800">{suggestion.reason}</p>
                              <p className="text-sm text-gray-600">{suggestion.description}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(suggestion.date).toLocaleDateString()} • {suggestion.duration} day(s)
                              </p>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-600">{suggestion.duration}d</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Public Holidays Integration */}
                {publicHolidays && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <MapPin className="h-4 w-4 text-blue-600 mr-2 animate-pulse" />
                      Long Weekend Opportunities
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {publicHolidays.suggestedLongWeekends.slice(0, 5).map((weekend, index) => (
                        <div key={index} className="p-3 bg-gradient-to-r from-blue-100 to-cyan-100 border-2 border-blue-400 rounded-lg hover:scale-105 transition-transform duration-300 shadow-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-blue-800">{weekend.holidayName}</p>
                              <p className="text-sm text-blue-600">{weekend.description}</p>
                              <p className="text-xs text-blue-500 mt-1">
                                {weekend.startDate.toLocaleDateString()} - {weekend.endDate.toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-blue-700">{weekend.leaveDaysRequired} leave day(s)</div>
                              <div className="text-xs text-blue-600">{weekend.totalDaysOff} total days off</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Recommendations */}
                {result.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 animate-pulse" />
                      AI Recommendations
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {result.recommendations.map((rec, index) => (
                        <div key={index} className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-400 rounded-lg hover:scale-105 transition-transform duration-300 shadow-lg">
                          <p className="text-green-800 text-sm">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warnings */}
                {result.warnings.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <AlertTriangle className="h-4 w-4 text-orange-600 mr-2 animate-pulse" />
                      Important Warnings
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {result.warnings.map((warning, index) => (
                        <div key={index} className="p-3 bg-gradient-to-r from-orange-100 to-yellow-100 border-2 border-orange-400 rounded-lg hover:scale-105 transition-transform duration-300 shadow-lg">
                          <p className="text-orange-800 text-sm">{warning}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Export Options */}
                <div className="pt-6 border-t-2 border-gray-300">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Download className={`h-4 w-4 ${
                      activeTab === 'student' ? 'text-violet-600' : 'text-emerald-600'
                    } mr-2 animate-pulse`} />
                    Export Report
                  </h4>
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => handleExport('pdf')}
                      disabled={isExporting}
                      variant="outline"
                      className={`flex-1 py-2 hover:scale-105 transition-all duration-300 ${
                        activeTab === 'student'
                          ? 'border-2 border-violet-400 text-violet-600 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 hover:border-violet-500'
                          : 'border-2 border-emerald-400 text-emerald-600 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 hover:border-emerald-500'
                      }`}
                    >
                      {isExporting ? 'Generating...' : 'Download PDF'}
                    </Button>
                    <Button
                      onClick={() => handleExport('excel')}
                      disabled={isExporting}
                      variant="outline"
                      className={`flex-1 py-2 hover:scale-105 transition-all duration-300 ${
                        activeTab === 'student'
                          ? 'border-2 border-fuchsia-400 text-fuchsia-600 hover:bg-gradient-to-r hover:from-fuchsia-50 hover:to-pink-50 hover:border-fuchsia-500'
                          : 'border-2 border-cyan-400 text-cyan-600 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 hover:border-cyan-500'
                      }`}
                    >
                      {isExporting ? 'Generating...' : 'Download Excel'}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 animate-float">
                <Calendar className="h-16 w-16 text-gray-500 mx-auto mb-4 animate-pulse" />
                <h3 className="text-xl font-semibold text-gray-700 mb-3">Ready for Analysis</h3>
                <p className="text-gray-600">
                  Fill in your {activeTab === 'student' ? 'semester' : 'annual'} details and click "Calculate with AI" to get personalized attendance insights.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      <style jsx>{`
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
      `}</style>
    </div>
  );
};

export default CalculatorPage;
