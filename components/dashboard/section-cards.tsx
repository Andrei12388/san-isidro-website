import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { Member } from "@/lib/data";
import { Spinner } from "../ui/loadingSpinner";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_APP_URL
    : "http://localhost:3000";

export function SectionCards() {
  const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState<Member[]>([]);
    const { access_token } = useAuth();
  
    const fetchMembers = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/postgre/users/`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch users");
        const json = await response.json();
        setMembers(json.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    useEffect(() => {
      fetchMembers();
    }, []);

      if (loading) {
        return (
          <div className="flex flex-1 flex-row justify-center items-center text-center">
            Loading Infos...
            <Spinner size={16} />
          </div>
        );
      }

  return (
    <>
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Project YA Total Funds</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              ₱5,250.00
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp />
                +12.5%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Trending up this month <IconTrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Visitors for the last 6 months
            </div>
          </CardFooter>
        </Card>
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>New Invites</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              5
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingDown />
                -20%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Down 20% this period <IconTrendingDown className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Acquisition needs attention
            </div>
          </CardFooter>
        </Card>
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Active Members</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {members.length}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp />
                +12.5%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Strong user retention <IconTrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Engagement exceed targets
            </div>
          </CardFooter>
        </Card>
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Growth Rate</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              4.5%
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp />
                +4.5%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Steady performance increase <IconTrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Meets growth projections
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
