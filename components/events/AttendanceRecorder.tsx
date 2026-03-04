'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Search } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  personalInformation?: {
    firstName?: string;
    lastName?: string;
  };
}

interface AttendanceRecorderProps {
  eventId: number;
  eventTitle?: string;
}

export default function AttendanceRecorder({ eventId, eventTitle }: AttendanceRecorderProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [attendance, setAttendance] = useState<Map<number, { present: boolean; timeIn: Date }>>(
    new Map()
  );
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter((user) => {
          const fullName = user.personalInformation?.firstName && user.personalInformation?.lastName
            ? `${user.personalInformation.firstName} ${user.personalInformation.lastName}`
            : user.name;
          return (
            fullName.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
          );
        })
      );
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/postgre/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      // Map the response to include personalInformation
      const mappedUsers = data.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        personalInformation: user.personalInfo || user.personalInformation,
      }));
      setUsers(mappedUsers);
      setFilteredUsers(mappedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (userId: number, present: boolean) => {
    const newAttendance = new Map(attendance);
    if (present) {
      newAttendance.set(userId, { present: true, timeIn: new Date() });
    } else {
      newAttendance.delete(userId);
    }
    setAttendance(newAttendance);
  };

  const markAllPresent = () => {
    const newAttendance = new Map();
    filteredUsers.forEach((user) => {
      newAttendance.set(user.id, { present: true, timeIn: new Date() });
    });
    setAttendance(newAttendance);
    toast.success('Marked all as present');
  };

  const clearAll = () => {
    setAttendance(new Map());
    toast.success('Cleared all attendance');
  };

  const submitAttendance = async () => {
    if (attendance.size === 0) {
      toast.error('No attendance records to submit');
      return;
    }

    try {
      setSubmitting(true);
      const records = Array.from(attendance.entries()).map(([userId, data]) => ({
        userId,
        eventId,
        timeIn: data.timeIn.toISOString(),
        isPresent: data.present,
      }));

      const promises = records.map((record) =>
        fetch('/api/event-attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        })
      );

      await Promise.all(promises);
      toast.success(`Recorded ${records.length} attendance records`);
      setAttendance(new Map());
    } catch (error) {
      console.error('Error submitting attendance:', error);
      toast.error('Failed to submit attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const getUserDisplayName = (user: User) => {
    if (user.personalInformation?.firstName && user.personalInformation?.lastName) {
      return `${user.personalInformation.firstName} ${user.personalInformation.lastName}`;
    }
    return user.name;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Attendance</CardTitle>
        <CardDescription>
          {eventTitle ? `Mark attendance for ${eventTitle}` : 'Mark attendance for this event'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={markAllPresent}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark All Present
            </Button>
            <Button variant="outline" size="sm" onClick={clearAll}>
              <XCircle className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Total: {filteredUsers.length}</span>
          <span>Present: {attendance.size}</span>
        </div>

        {/* User List */}
        <div className="border rounded-lg max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No users found</div>
          ) : (
            <div className="divide-y">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center space-x-4 p-4 hover:bg-muted/50">
                  <Checkbox
                    id={`user-${user.id}`}
                    checked={attendance.has(user.id)}
                    onCheckedChange={(checked) =>
                      handleAttendanceChange(user.id, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`user-${user.id}`}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="font-medium">{getUserDisplayName(user)}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </Label>
                  {attendance.has(user.id) && (
                    <div className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      Present
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button
          onClick={submitAttendance}
          disabled={submitting || attendance.size === 0}
          className="w-full"
        >
          {submitting ? 'Submitting...' : `Submit Attendance (${attendance.size} records)`}
        </Button>
      </CardContent>
    </Card>
  );
}
