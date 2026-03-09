'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Users, Calendar as CalendarCheck, TrendingUp, BarChart } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface Analytics {
  totalUniqueUsers: number;
  totalAttendance: number;
  totalRecords: number;
  attendanceRate: number;
  attendanceByEvent: Array<{
    eventId: number;
    eventTitle: string;
    count: number;
    isRegular: boolean;
    recurrence?: string;
    start: string;
    end: string;
  }>;
  dailyAttendance: Array<{
    date: string;
    count: number;
  }>;
}

export default function AnalyticsSection() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [recurrence, setRecurrence] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  useEffect(() => {
    fetchAnalytics();
  }, [recurrence, startDate, endDate]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (recurrence && recurrence !== 'all') {
        params.append('recurrence', recurrence);
      }
      
      if (startDate) {
        params.append('startDate', startDate.toISOString());
      }
      
      if (endDate) {
        params.append('endDate', endDate.toISOString());
      }

      const response = await fetch(`/api/event-attendance/analytics?${params.toString()}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Failed to load analytics</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Attendance Analytics v1</h1>
          <p className="text-muted-foreground">View insights and statistics on event attendance</p>
        </div>
        <Link href="/attendance">
          <Button variant="outline">View Attendance Summary</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Date Range & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
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

            <Select value={recurrence} onValueChange={setRecurrence}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select recurrence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              onClick={() => {
                setStartDate(undefined);
                setEndDate(undefined);
                setRecurrence('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUniqueUsers}</div>
            <p className="text-xs text-muted-foreground">Unique attendees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attendance</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalAttendance}</div>
            <p className="text-xs text-muted-foreground">Present records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalRecords}</div>
            <p className="text-xs text-muted-foreground">All attendance entries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">Present vs total records</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">By Event</TabsTrigger>
          <TabsTrigger value="daily">Daily Trend</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance by Event</CardTitle>
              <CardDescription>Number of attendees per event</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.attendanceByEvent.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No data available</p>
                ) : (
                  analytics.attendanceByEvent
                    .sort((a, b) => b.count - a.count)
                    .map((event) => (
                      <div key={event.eventId} className="flex items-center justify-between border-b pb-4">
                        <div className="space-y-1 flex-1">
                          <Link
                            href={`/events/${event.eventId}`}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {event.eventTitle}
                          </Link>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>
                              {format(new Date(event.start), 'MMM dd, yyyy')}
                            </span>
                            {event.isRegular && (
                              <span className="text-green-600">
                                Regular • {event.recurrence}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{event.count}</div>
                          <div className="text-xs text-muted-foreground">attendees</div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Attendance Trend</CardTitle>
              <CardDescription>Attendance count by day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics.dailyAttendance.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No data available</p>
                ) : (
                  analytics.dailyAttendance.map((daily) => (
                    <div
                      key={daily.date}
                      className="flex items-center justify-between border-b pb-2"
                    >
                      <span className="font-medium">
                        {format(new Date(daily.date), 'EEEE, MMMM dd, yyyy')}
                      </span>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 bg-blue-500 rounded"
                          style={{
                            width: `${Math.min((daily.count / Math.max(...analytics.dailyAttendance.map(d => d.count))) * 200, 200)}px`,
                          }}
                        />
                        <span className="font-bold w-12 text-right">{daily.count}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
