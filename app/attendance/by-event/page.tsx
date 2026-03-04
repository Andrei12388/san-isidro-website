'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, XCircle, Users, Clock, MapPin, Calendar, Download } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Event {
  id: number;
  title: string;
  description?: string;
  location: string;
  start: string;
  end: string;
  isRegular: boolean;
  recurrence?: string;
}

interface AttendanceRecord {
  userId: number;
  userName: string;
  userEmail: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  isPresent: boolean;
  timeIn: string | null;
  date: string | null;
  attendanceId: number | null;
  checkedIn: boolean;
}

interface AttendanceData {
  event: Event;
  attendance: AttendanceRecord[];
  stats: {
    totalUsers: number;
    present: number;
    absent: number;
    checkedIn: number;
    notCheckedIn: number;
  };
}

export default function EventAttendancePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchAttendanceByEvent(selectedEventId);
    }
  }, [selectedEventId]);

  const fetchEvents = async () => {
    try {
      setEventsLoading(true);
      const response = await fetch('/api/postgre/events?allowRegistration=true');
      const result = await response.json();
      
      // API returns { data: [...] }
      const eventsArray = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);
      setEvents(eventsArray);
      
      // Auto-select first event if available
      if (eventsArray.length > 0) {
        setSelectedEventId(eventsArray[0].id.toString());
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]); // Set empty array on error
    } finally {
      setEventsLoading(false);
    }
  };

  const fetchAttendanceByEvent = async (eventId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/event-attendance/by-event?eventId=${eventId}`);
      const data = await response.json();
      setAttendanceData(data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserDisplayName = (record: AttendanceRecord) => {
    if (record.firstName && record.lastName) {
      return `${record.firstName} ${record.lastName}`;
    }
    return record.userName;
  };

  const exportToCSV = () => {
    if (!attendanceData) return;

    const csvData = attendanceData.attendance.map((record) => ({
      Name: getUserDisplayName(record),
      Email: record.userEmail,
      Status: record.isPresent ? 'Present' : 'Absent',
      'Checked In': record.checkedIn ? 'Yes' : 'No',
      'Time In': record.timeIn ? format(new Date(record.timeIn), 'hh:mm a') : 'N/A',
      Date: record.date ? format(new Date(record.date), 'MM/dd/yyyy') : 'N/A',
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map((row) =>
        headers.map((header) => `"${row[header as keyof typeof row]}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${attendanceData.event.title}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Event Attendance</h1>
          <p className="text-muted-foreground">View attendance records by event</p>
        </div>
        <Link href="/attendance/check-in">
          <Button>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Check In
          </Button>
        </Link>
      </div>

      {/* Event Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Event</CardTitle>
          <CardDescription>Choose an event to view attendance</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an event" />
            </SelectTrigger>
            <SelectContent>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id.toString()}>
                  <div className="flex items-center gap-2">
                    <span>{event.title}</span>
                    {event.isRegular && (
                      <Badge variant="secondary" className="text-xs">
                        {event.recurrence}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Event Info & Stats */}
      {attendanceData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Event Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Event:</span>
                  <span className="font-semibold">{attendanceData.event.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {attendanceData.event.location}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date & Time:</span>
                  <span>{format(new Date(attendanceData.event.start), 'PPp')}</span>
                </div>
                {attendanceData.event.isRegular && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Recurrence:</span>
                    <Badge variant="secondary">{attendanceData.event.recurrence}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Attendance Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Users:</span>
                  <span className="text-2xl font-bold">{attendanceData.stats.totalUsers}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Present</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{attendanceData.stats.present}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm">Absent</span>
                    </div>
                    <p className="text-2xl font-bold text-red-600">{attendanceData.stats.absent}</p>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Attendance Rate:</span>
                    <span className="font-semibold">
                      {((attendanceData.stats.present / attendanceData.stats.totalUsers) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Table */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Attendance Records</CardTitle>
                  <CardDescription>
                    {attendanceData.stats.checkedIn} of {attendanceData.stats.totalUsers} users checked in via biometric verification
                  </CardDescription>
                </div>
                <Button onClick={exportToCSV} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time In</TableHead>
                      <TableHead>Checked In</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : attendanceData.attendance.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      attendanceData.attendance.map((record) => (
                        <TableRow key={record.userId}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={record.profileImage || ''} />
                                <AvatarFallback>
                                  {getUserDisplayName(record).charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{getUserDisplayName(record)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{record.userEmail}</TableCell>
                          <TableCell>
                            {record.isPresent ? (
                              <Badge className="gap-1 bg-green-600">
                                <CheckCircle2 className="h-3 w-3" />
                                Present
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="gap-1">
                                <XCircle className="h-3 w-3" />
                                Absent
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {record.timeIn ? (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                {format(new Date(record.timeIn), 'hh:mm a')}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {record.checkedIn ? (
                              <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
                                <CheckCircle2 className="h-3 w-3" />
                                Via Biometric
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">Not checked in</span>
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
        </>
      )}

      {/* Empty State */}
      {!eventsLoading && events.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-2">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-semibold">No Events Found</h3>
              <p className="text-sm text-muted-foreground">
                Create an event to start tracking attendance
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
