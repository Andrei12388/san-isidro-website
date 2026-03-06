import { useEffect, useState } from "react";
import { DataTable } from "../data-table";
import { Member } from "@/lib/data";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/ui/loadingSpinner";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_APP_URL
    : "http://localhost:3000";

const MembersSection = () => {
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
      // Reverse the original order
        const reversedData = json.data.slice().reverse(); // slice() to avoid mutating original array

        setMembers(reversedData);
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
        Loading Users...
        <Spinner size={16} />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <DataTable data={members as any} />
        </div>
      </div>
    </div>
  );
};

export default MembersSection;
