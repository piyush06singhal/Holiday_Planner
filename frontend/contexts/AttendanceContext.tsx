import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AttendanceData {
  totalDays: number;
  requiredDays: number;
  safeLeaveDays: number;
  attendanceRule: number;
  userType: 'student' | 'employee';
  optimalLeaveDates?: Array<{
    startDate: string;
    endDate: string;
    duration: number;
    reason: string;
    aiScore: number;
    description: string;
  }>;
}

interface AttendanceContextType {
  attendanceData: AttendanceData | null;
  setAttendanceData: (data: AttendanceData | null) => void;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};

interface AttendanceProviderProps {
  children: ReactNode;
}

export const AttendanceProvider: React.FC<AttendanceProviderProps> = ({ children }) => {
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);

  return (
    <AttendanceContext.Provider value={{ attendanceData, setAttendanceData }}>
      {children}
    </AttendanceContext.Provider>
  );
};