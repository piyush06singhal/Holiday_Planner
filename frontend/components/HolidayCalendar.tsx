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
  const { toast } = useToast();

  // Fetch holidays when component mounts or date range changes
  useEffect(() => {
    if (startDate && endDate) {
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
      
      toast({
        title: "🎉 Smart Calendar Loaded!",
        description: `Found ${holidays.holidays.length} holidays and ${holidays.suggestedLongWeekends.length} long weekend opportunities!`,
      });
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
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-semibold text-gray-600 p-3">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
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
                  relative p-2 h-16 cursor-pointer transition-all duration-300 rounded-lg
                  ${!isCurrentMonthDay ? 'opacity-30' : ''}
                  ${isTodayDay ? 'ring-2 ring-violet-500' : ''}
                  ${isWeekendDay ? 'bg-gray-100' : 'bg-white'}
                  ${holiday ? 'bg-gradient-to-br from-red-100 to-pink-100 border-2 border-red-300' : ''}
                  ${optimalLeave ? 'bg-gradient-to-br from-emerald-100 to-green-100 border-2 border-emerald-300' : ''}
                  hover:scale-105 hover:shadow-lg hover:z-10
                `}
              >
                <div className="text-sm font-medium text-gray-800">
                  {day.getDate()}
                </div>
                
                {/* Holiday indicator */}
                {holiday && (
                  <div className="absolute top-1 right-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                )}
                
                {/* Optimal leave indicator */}
                {optimalLeave && (
                  <div className="absolute bottom-1 left-1">
                    <Star className="h-3 w-3 text-emerald-600" />
                  </div>
                )}
                
                {/* Today indicator */}
                {isTodayDay && (
                  <div className="absolute bottom-1 right-1">
                    <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                  </div>
                )}
                
                {/* Holiday name (abbreviated) */}
                {holiday && (
                  <div className="absolute bottom-0 left-0 right-0 text-xs text-red-700 font-medium truncate px-1">
                    {holiday.name.substring(0, 8)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-br from-red-100 to-pink-100 border border-red-300 rounded"></div>
            <span>Public Holiday</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-br from-emerald-100 to-green-100 border border-emerald-300 rounded"></div>
            <span>AI-Optimal Leave</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-100 rounded"></div>
            <span>Weekend</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-violet-500 rounded"></div>
            <span>Today</span>
          </div>
        </div>

        {/* Statistics */}
        {publicHolidays && (
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">{publicHolidays.holidays.length}</div>
              <div className="text-sm text-red-700">Public Holidays</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{publicHolidays.suggestedLongWeekends.length}</div>
              <div className="text-sm text-blue-700">Long Weekends</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
              <div className="text-2xl font-bold text-emerald-600">{attendanceData?.safeLeaveDays || 0}</div>
              <div className="text-sm text-emerald-700">Safe Leave Days</div>
            </div>
          </div>
        )}

        {/* Selected date info */}
        {selectedDate && (
          <Card className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200">
            <h4 className="font-semibold text-violet-900 mb-2">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h4>
            
            {isHoliday(selectedDate) && (
              <div className="flex items-center space-x-2 text-red-700 mb-2">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">{isHoliday(selectedDate)?.name}</span>
              </div>
            )}
            
            {isOptimalLeaveDate(selectedDate) && (
              <div className="flex items-center space-x-2 text-emerald-700 mb-2">
                <Star className="h-4 w-4" />
                <span className="font-medium">
                  {isOptimalLeaveDate(selectedDate)?.reason} 
                  (AI Score: {isOptimalLeaveDate(selectedDate)?.aiScore}/100)
                </span>
              </div>
            )}
            
            {isWeekend(selectedDate) && (
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Weekend</span>
              </div>
            )}
          </Card>
        )}

        {!publicHolidays && !isLoading && (
          <div className="text-center py-8">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              Load your attendance calculation to see smart holiday calendar with real holidays and AI recommendations.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default HolidayCalendar;