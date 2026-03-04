'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, Calculator, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface EventAttendance {
  id: number;
  userId: number;
  eventId: number;
  date: string;
  timeIn: string;
  isPresent: boolean;
  user: {
    id: number;
    name: string;
    email: string;
    personalInformation?: {
      firstName?: string;
      lastName?: string;
    };
  };
  event: {
    id: number;
    title: string;
    isRegular: boolean;
    recurrence?: string;
  };
}

export default function AttendanceSummaryPage() {
  const [attendances, setAttendances] = useState<EventAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlyRegular, setOnlyRegular] = useState(false);
  const [recurrence, setRecurrence] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchAttendances();
  }, [onlyRegular, recurrence, startDate, endDate]);

  const fetchAttendances = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (onlyRegular) {
        params.append('onlyRegular', 'true');
      }
      
      if (recurrence && recurrence !== 'all') {
        params.append('recurrence', recurrence);
      }
      
      if (startDate) {
        params.append('startDate', startDate.toISOString());
      }
      
      if (endDate) {
        params.append('endDate', endDate.toISOString());
      }

      const response = await fetch(`/api/event-attendance?${params.toString()}`);
      const data = await response.json();
      // Ensure data is an array
      const attendancesArray = Array.isArray(data) ? data : [];
      setAttendances(attendancesArray);
    } catch (error) {
      console.error('Error fetching attendances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(attendances.map(a => a.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (id: number, checked: boolean) => {
    const newSelection = new Set(selectedRows);
    if (checked) {
      newSelection.add(id);
    } else {
      newSelection.delete(id);
    }
    setSelectedRows(newSelection);
  };

  const exportToExcel = () => {
    // Prepare data for export
    const exportData = attendances
      .filter(a => selectedRows.size === 0 || selectedRows.has(a.id))
      .map(a => ({
        Date: format(new Date(a.date), 'MM/dd/yyyy'),
        'Time In': format(new Date(a.timeIn), 'hh:mm a'),
        'Employee Name': a.user.personalInformation?.firstName && a.user.personalInformation?.lastName
          ? `${a.user.personalInformation.firstName} ${a.user.personalInformation.lastName}`
          : a.user.name,
        Event: a.event.title,
        Present: a.isPresent ? 'Yes' : 'No',
        'Is Regular': a.event.isRegular ? 'Yes' : 'No',
        Recurrence: a.event.recurrence || 'N/A',
      }));

    // Convert to CSV
    const headers = Object.keys(exportData[0] || {});
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => 
        headers.map(header => `"${row[header as keyof typeof row]}"`).join(',')
      ),
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-summary-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getUserDisplayName = (attendance: EventAttendance) => {
    const { user } = attendance;
    if (user.personalInformation?.firstName && user.personalInformation?.lastName) {
      return `${user.personalInformation.firstName} ${user.personalInformation.lastName}`;
    }
    return user.name;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Attendance Summary</h1>
          <p className="text-muted-foreground">Track and manage event attendance records</p>
        </div>
        <div className="flex gap-2">
          <Link href="/attendance/check-in">
            <Button variant="default">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Check In
            </Button>
          </Link>
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="mr-2 h-4 w-4" />
            Export to Excel
          </Button>
          <Button variant="outline">
            <Calculator className="mr-2 h-4 w-4" />
            Calculate
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter attendance records by date range and event type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* Date Range */}
            <div className="flex gap-2 items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : 'Start Date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <span className="text-muted-foreground">to</span>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : 'End Date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Only Regular Events */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="onlyRegular"
                checked={onlyRegular}
                onCheckedChange={(checked) => setOnlyRegular(checked as boolean)}
              />
              <label
                htmlFor="onlyRegular"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Only Regular Events
              </label>
            </div>

            {/* Recurrence Filter */}
            <Select value={recurrence} onValueChange={setRecurrence}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select recurrence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button
              variant="ghost"
              onClick={() => {
                setStartDate(undefined);
                setEndDate(undefined);
                setOnlyRegular(false);
                setRecurrence('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Register Details</CardTitle>
          <CardDescription>
            Showing {attendances.length} attendance record{attendances.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedRows.size === attendances.length && attendances.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time In</TableHead>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Present</TableHead>
                  <TableHead>Regular Event</TableHead>
                  <TableHead>Recurrence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : attendances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                ) : (
                  attendances.map((attendance) => (
                    <TableRow key={attendance.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.has(attendance.id)}
                          onCheckedChange={(checked) =>
                            handleSelectRow(attendance.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>{format(new Date(attendance.date), 'MM/dd/yyyy')}</TableCell>
                      <TableCell>{format(new Date(attendance.timeIn), 'hh:mm a')}</TableCell>
                      <TableCell>{getUserDisplayName(attendance)}</TableCell>
                      <TableCell>
                        <Link
                          href={`/events/${attendance.eventId}`}
                          className="text-blue-600 hover:underline"
                        >
                          {attendance.event.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            attendance.isPresent
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {attendance.isPresent ? 'Yes' : 'No'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {attendance.event.isRegular ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {attendance.event.recurrence ? (
                          <span className="capitalize">{attendance.event.recurrence}</span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
