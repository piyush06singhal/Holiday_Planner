import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Star, 
  AlertTriangle,
  CheckCircle,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';
import backend from '~backend/client';
import type { PublicHolidaysRequest, PublicHolidaysResponse } from '~backend/calendar/integration';

interface HolidayCalendarProps {
  startDate?: Date;
  endDate?: Date;
  attendanceData?: {
    safeLeaveDays: number;
    optimalLeaveDates?: Array<{
      startDate: string;
      endDate: string;
      reason: string;
      aiScore: number;
    }>;
  };
}

const HolidayCalendar: React.FC<HolidayCalendarProps> = ({ 
  startDate, 
  endDate, 
  attendanceData 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [publicHolidays, setPublicHolidays] = useState<PublicHolidaysResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [hasShownSuccessToast, setHasShownSuccessToast] = useState(false);
  const { toast } = useToast();

  // Fetch holidays when component mounts or date range changes
  useEffect(() => {
    if (startDate && endDate && !publicHolidays) {
      fetchHolidays();
    }
  }, [startDate, endDate]);

  const fetchHolidays = async () => {
    if (!startDate || !endDate) return;

    setIsLoading(true);
    try {
      const request: PublicHolidaysRequest = {
        startDate,
        endDate,
        country: "IN"
      };

      const holidays = await backend.calendar.getPublicHolidays(request);
      setPublicHolidays(holidays);
      
      // Only show success toast if not shown before
      if (!hasShownSuccessToast) {
        toast({
          title: "🎉 Smart Calendar Loaded!",
          description: `Found ${holidays.holidays.length} holidays and ${holidays.suggestedLongWeekends.length} long weekend opportunities!`,
        });
        setHasShownSuccessToast(true);
      }
    } catch (error) {
      console.error('Error fetching holidays:', error);
      toast({
        title: "Calendar Load Error",
        description: "Failed to load holiday calendar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCalendarData = () => {
    if (!publicHolidays) return;

    const calendarData = {
      holidays: publicHolidays.holidays.map(h => ({
        date: h.date.toDateString(),
        name: h.name,
        type: h.type,
        description: h.description
      })),
      longWeekends: publicHolidays.suggestedLongWeekends.map(lw => ({
        startDate: lw.startDate.toDateString(),
        endDate: lw.endDate.toDateString(),
        holidayName: lw.holidayName,
        leaveDaysRequired: lw.leaveDaysRequired,
        totalDaysOff: lw.totalDaysOff,
        description: lw.description
      })),
      optimalLeaveDates: attendanceData?.optimalLeaveDates || [],
      generatedAt: new Date().toISOString(),
      period: startDate && endDate ? `${startDate.toDateString()} - ${endDate.toDateString()}` : 'Not specified'
    };

    const blob = new Blob([JSON.stringify(calendarData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smart-holiday-calendar-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "📥 Calendar Downloaded!",
      description: "Your smart holiday calendar data has been downloaded as JSON.",
    });
  };

  const downloadICS = () => {
    if (!publicHolidays) return;

    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//AI Holiday Planner//Smart Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];

    // Add holidays
    publicHolidays.holidays.forEach((holiday, index) => {
      const date = new Date(holiday.date);
      const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
      
      icsContent.push(
        'BEGIN:VEVENT',
        `UID:holiday-${index}-${Date.now()}@ai-holiday-planner.com`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DTSTART;VALUE=DATE:${dateStr}`,
        `SUMMARY:🎉 ${holiday.name}`,
        `DESCRIPTION:${holiday.description || 'Public Holiday'}`,
        `CATEGORIES:HOLIDAY,PUBLIC`,
        'END:VEVENT'
      );
    });

    // Add optimal leave dates
    if (attendanceData?.optimalLeaveDates) {
      attendanceData.optimalLeaveDates.forEach((optimal, index) => {
        const startDate = new Date(optimal.startDate);
        const endDate = new Date(optimal.endDate);
        const startDateStr = startDate.toISOString().split('T')[0].replace(/-/g, '');
        const endDateStr = endDate.toISOString().split('T')[0].replace(/-/g, '');
        
        icsContent.push(
          'BEGIN:VEVENT',
          `UID:optimal-${index}-${Date.now()}@ai-holiday-planner.com`,
          `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
          `DTSTART;VALUE=DATE:${startDateStr}`,
          `DTEND;VALUE=DATE:${endDateStr}`,
          `SUMMARY:🎯 ${optimal.reason} (AI Score: ${optimal.aiScore})`,
          `DESCRIPTION:AI-optimized leave period with score ${optimal.aiScore}/100`,
          `CATEGORIES:LEAVE,AI-OPTIMAL`,
          'END:VEVENT'
        );
      });
    }

    icsContent.push('END:VCALENDAR');

    const blob = new Blob([icsContent.join('\n')], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smart-holiday-calendar-${new Date().toISOString().split('T')[0]}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "📅 Calendar File Ready!",
      description: "Import the .ics file into Google Calendar, Outlook, or Apple Calendar.",
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const isHoliday = (date: Date) => {
    if (!publicHolidays) return null;
    return publicHolidays.holidays.find(h => 
      new Date(h.date).toDateString() === date.toDateString()
    );
  };

  const isOptimalLeaveDate = (date: Date) => {
    if (!attendanceData?.optimalLeaveDates) return null;
    return attendanceData.optimalLeaveDates.find(optimal => {
      const start = new Date(optimal.startDate);
      const end = new Date(optimal.endDate);
      return date >= start && date <= end;
    });
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const days = getDaysInMonth(currentDate);
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <Card className="p-6 bg-white/90 backdrop-blur-xl border-2 border-violet-300 shadow-2xl hover:shadow-violet-500/30 transition-all duration-500">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-lg flex items-center justify-center shadow-xl">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Smart Holiday Calendar</h2>
              <p className="text-gray-600">Real holidays with AI-optimized planning</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {publicHolidays && (
              <>
                <Button
                  onClick={downloadCalendarData}
                  variant="outline"
                  size="sm"
                  className="border-2 border-emerald-400 text-emerald-600 hover:bg-emerald-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  JSON
                </Button>
                <Button
                  onClick={downloadICS}
                  variant="outline" 
                  size="sm"
                  className="border-2 border-blue-400 text-blue-600 hover:bg-blue-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Calendar
                </Button>
              </>
            )}
            
            {startDate && endDate && (
              <Button
                onClick={fetchHolidays}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="border-2 border-violet-400 text-violet-600 hover:bg-violet-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
            )}
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between">
          <Button
            onClick={() => navigateMonth('prev')}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h3 className="text-xl font-semibold text-gray-800">{monthYear}</h3>
          
          <Button
            onClick={() => navigateMonth('next')}
            variant="outline"
            size="sm"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
              <div key={day} className={`text-center text-sm font-bold p-3 rounded-lg ${
                index === 0 || index === 6 
                  ? 'bg-gradient-to-br from-orange-100 to-red-100 text-orange-700' 
                  : 'bg-gradient-to-br from-violet-100 to-purple-100 text-violet-700'
              }`}>
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              const holiday = isHoliday(day);
              const optimalLeave = isOptimalLeaveDate(day);
              const isWeekendDay = isWeekend(day);
              const isTodayDay = isToday(day);
              const isCurrentMonthDay = isCurrentMonth(day);
              
              return (
                <div
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    relative p-3 h-20 cursor-pointer transition-all duration-300 rounded-xl border-2
                    ${!isCurrentMonthDay ? 'opacity-40 scale-95' : 'hover:scale-105'}
                    ${isTodayDay ? 'ring-4 ring-violet-400 ring-opacity-50 shadow-lg shadow-violet-500/30' : ''}
                    ${isWeekendDay && !holiday && !optimalLeave ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200' : ''}
                    ${!isWeekendDay && !holiday && !optimalLeave ? 'bg-white border-gray-200 hover:border-violet-300 hover:shadow-md' : ''}
                    ${holiday ? 'bg-gradient-to-br from-red-50 via-red-100 to-pink-100 border-red-300 shadow-md hover:shadow-red-200' : ''}
                    ${optimalLeave ? 'bg-gradient-to-br from-emerald-50 via-emerald-100 to-green-100 border-emerald-300 shadow-md hover:shadow-emerald-200' : ''}
                    hover:z-10 transform-gpu
                  `}
                >
                  <div className={`text-sm font-bold mb-1 ${
                    isTodayDay ? 'text-violet-700' :
                    holiday ? 'text-red-700' :
                    optimalLeave ? 'text-emerald-700' :
                    isWeekendDay ? 'text-gray-600' : 'text-gray-800'
                  }`}>
                    {day.getDate()}
                  </div>
                  
                  {/* Multiple indicators container */}
                  <div className="absolute top-2 right-2 flex flex-col space-y-1">
                    {/* Holiday indicator */}
                    {holiday && (
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-sm"></div>
                    )}
                    
                    {/* Today indicator */}
                    {isTodayDay && (
                      <div className="w-3 h-3 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full animate-pulse shadow-md"></div>
                    )}
                  </div>
                  
                  {/* Bottom indicators */}
                  <div className="absolute bottom-2 left-2 flex space-x-1">
                    {/* Optimal leave indicator */}
                    {optimalLeave && (
                      <Star className="h-4 w-4 text-emerald-600 animate-bounce" />
                    )}
                  </div>
                  
                  {/* Holiday name (better positioned) */}
                  {holiday && (
                    <div className="absolute bottom-1 left-1 right-1 text-xs text-red-700 font-semibold text-center truncate">
                      {holiday.name.length > 8 ? holiday.name.substring(0, 6) + '...' : holiday.name}
                    </div>
                  )}
                  
                  {/* Optimal leave badge */}
                  {optimalLeave && !holiday && (
                    <div className="absolute bottom-1 left-1 right-1 text-xs text-emerald-700 font-semibold text-center truncate">
                      AI: {optimalLeave.aiScore}/100
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Enhanced Legend */}
        <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-200">
          <h4 className="text-sm font-bold text-gray-700 mb-3 text-center">Calendar Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-white shadow-sm border border-red-200">
              <div className="w-5 h-5 bg-gradient-to-br from-red-100 to-pink-100 border-2 border-red-300 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
              <span className="font-medium text-red-700">Public Holiday</span>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-white shadow-sm border border-emerald-200">
              <div className="w-5 h-5 bg-gradient-to-br from-emerald-100 to-green-100 border-2 border-emerald-300 rounded-lg flex items-center justify-center">
                <Star className="h-3 w-3 text-emerald-600" />
              </div>
              <span className="font-medium text-emerald-700">AI-Optimal Leave</span>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-white shadow-sm border border-gray-200">
              <div className="w-5 h-5 bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 rounded-lg"></div>
              <span className="font-medium text-gray-600">Weekend</span>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-white shadow-sm border border-violet-200">
              <div className="w-5 h-5 border-2 border-violet-500 rounded-lg bg-gradient-to-r from-violet-100 to-purple-100 flex items-center justify-center">
                <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></div>
              </div>
              <span className="font-medium text-violet-700">Today</span>
            </div>
          </div>
        </div>

        {/* Enhanced Statistics */}
        {publicHolidays && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center p-6 bg-gradient-to-br from-red-50 via-red-100 to-pink-50 border-2 border-red-200 hover:shadow-lg hover:scale-105 transition-all duration-300">
              <div className="text-3xl font-bold text-red-600 mb-2">{publicHolidays.holidays.length}</div>
              <div className="text-sm font-semibold text-red-700 mb-1">Public Holidays</div>
              <div className="text-xs text-red-600 opacity-75">Upcoming celebrations</div>
            </Card>
            <Card className="text-center p-6 bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-50 border-2 border-blue-200 hover:shadow-lg hover:scale-105 transition-all duration-300">
              <div className="text-3xl font-bold text-blue-600 mb-2">{publicHolidays.suggestedLongWeekends.length}</div>
              <div className="text-sm font-semibold text-blue-700 mb-1">Long Weekends</div>
              <div className="text-xs text-blue-600 opacity-75">Smart opportunities</div>
            </Card>
            <Card className="text-center p-6 bg-gradient-to-br from-emerald-50 via-emerald-100 to-green-50 border-2 border-emerald-200 hover:shadow-lg hover:scale-105 transition-all duration-300">
              <div className="text-3xl font-bold text-emerald-600 mb-2">{attendanceData?.safeLeaveDays || 0}</div>
              <div className="text-sm font-semibold text-emerald-700 mb-1">Safe Leave Days</div>
              <div className="text-xs text-emerald-600 opacity-75">Available for planning</div>
            </Card>
          </div>
        )}

        {/* Enhanced Selected date info */}
        {selectedDate && (
          <Card className="p-6 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 border-2 border-violet-300 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-violet-900">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h4>
                <p className="text-sm text-violet-600">{selectedDate.getFullYear()}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {isHoliday(selectedDate) && (
                <div className="flex items-center space-x-3 p-3 bg-red-100 rounded-lg border border-red-200">
                  <MapPin className="h-5 w-5 text-red-600" />
                  <div>
                    <span className="font-semibold text-red-700">{isHoliday(selectedDate)?.name}</span>
                    <p className="text-xs text-red-600">{isHoliday(selectedDate)?.type} holiday</p>
                  </div>
                </div>
              )}
              
              {isOptimalLeaveDate(selectedDate) && (
                <div className="flex items-center space-x-3 p-3 bg-emerald-100 rounded-lg border border-emerald-200">
                  <Star className="h-5 w-5 text-emerald-600" />
                  <div>
                    <span className="font-semibold text-emerald-700">
                      {isOptimalLeaveDate(selectedDate)?.reason}
                    </span>
                    <p className="text-xs text-emerald-600">
                      AI Optimization Score: {isOptimalLeaveDate(selectedDate)?.aiScore}/100
                    </p>
                  </div>
                </div>
              )}
              
              {isWeekend(selectedDate) && !isHoliday(selectedDate) && (
                <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg border border-gray-200">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <div>
                    <span className="font-semibold text-gray-700">Weekend</span>
                    <p className="text-xs text-gray-600">Regular weekend day</p>
                  </div>
                </div>
              )}
              
              {!isWeekend(selectedDate) && !isHoliday(selectedDate) && !isOptimalLeaveDate(selectedDate) && (
                <div className="flex items-center space-x-3 p-3 bg-blue-100 rounded-lg border border-blue-200">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <div>
                    <span className="font-semibold text-blue-700">Regular Working Day</span>
                    <p className="text-xs text-blue-600">Standard attendance required</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {!publicHolidays && !isLoading && (
          <div className="text-center py-12">
            <div className="relative">
              <Calendar className="h-20 w-20 text-gray-400 mx-auto mb-6 animate-pulse" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Smart Calendar Ready</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Load your attendance calculation to see smart holiday calendar with real holidays and AI recommendations.
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }
        
        .animate-scale-in {
          animation: scaleIn 0.4s ease-out;
        }
        
        .animate-slide-in {
          animation: slideIn 0.5s ease-out;
        }
        
        .animate-bounce-gentle {
          animation: bounce 2s infinite;
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
      `}</style>
    </Card>
  );
};

export default HolidayCalendar;