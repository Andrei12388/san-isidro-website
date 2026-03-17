"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Completion {
  completed: boolean;
}

interface Member {
  id: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  completions?: Completion[];
  user: { id: number; name: string; personalInformation?: { profileImage?: string } };
}

interface MinistryMembersContextType {
  members: Member[];
  refreshMembers: () => void;
}

const MinistryMembersContext = createContext<MinistryMembersContextType | undefined>(undefined);

export const MinistryMembersProvider = ({ children, ministryId }: { children: ReactNode; ministryId: number | string }) => {
  const [members, setMembers] = useState<Member[]>([]);
  
  const fetchMembers = async () => {
    try {
      const res = await fetch(`/api/postgre/ministries/${ministryId}/members`);
      const data = await res.json();
      setMembers(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [ministryId]);

  return (
    <MinistryMembersContext.Provider value={{ members, refreshMembers: fetchMembers }}>
      {children}
    </MinistryMembersContext.Provider>
  );
};

export const useMinistryMembers = () => {
  const context = useContext(MinistryMembersContext);
  if (!context) throw new Error("useMinistryMembers must be used within a MinistryMembersProvider");
  return context;
};