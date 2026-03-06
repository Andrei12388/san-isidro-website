"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatDateToDay, formatDateToDayWithYear, toLocalDatetimeInput } from "@/lib/formatData";

export const description = "An interactive area chart";

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  male: {
    label: "Male",
    color: "var(--primary)",
  },
  female: {
    label: "Female",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

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
  gender: string;
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

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");

  const [chartData, setChartData] = React.useState<{ date: string; male: number; female: number }[]>([]);


React.useEffect(() => {
  fetch("/api/postgre/attendance/by-event")
    .then(res => res.json())
    .then(res => setChartData(res.data))
    .catch(console.error);
}, []);


  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2026-03-01");
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  const maxGenderValue = Math.max(
    ...filteredData.map((d) => Math.max(d.male, d.female)),
  );

  return (
    <Card className="@container/card mt-2">
      <CardHeader>
        <CardTitle>Total Attendees</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total for the last 3 months
          </span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillMale" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={1} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>

              <linearGradient id="fillFemale" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis
              domain={[0, maxGenderValue + 5]}
              tickCount={5}
              tickLine={false}
              axisLine={false}
            />

            <ChartTooltip
              cursor={false}
              content={
               <ChartTooltipContent
              labelFormatter={(value, payload) => {
                const item = payload?.[0]?.payload;
                const date = new Date(value); // convert ISO string to Date
                const startDate = toLocalDatetimeInput(date)
                return `${item?.eventName || ""} - ${formatDateToDayWithYear(startDate) || ""}`;
              }}
            />
              }
            />
            <Area
              dataKey="female"
              type="linear"
              fill="url(#fillFemale)"
              stroke="#ec4899"
            />

            <Area
              dataKey="male"
              type="linear"
              fill="url(#fillMale)"
              stroke="#3b82f6"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
