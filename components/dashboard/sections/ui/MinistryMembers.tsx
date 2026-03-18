"use client";

import { useEffect, useState, useCallback } from "react";
import styles from "@/components/dashboard/sections/devotions.module.css";
import { useMinistryMembers } from "@/context/MinistryMemberContext";
import HoverCard from "@/components/userCard/hoverCard";
import { useAuth } from "@/context/AuthContext";

interface Completion {
  completed: boolean;
}


// Define the Ministry type
interface Ministry {
  id: number;
  name: string;
}

interface Member {
  id: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  completions?: Completion[];
  user: {
    id: number;
    name: string;
    personalInformation?: { profileImage?: string };
  };
}

export default function MinistryMembers({ ministryId }: { ministryId: number }) {
  const [loading, setLoading] = useState(false);
  const [showRejectedModal, setShowRejectedModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [closing, setClosing] = useState(false);
  const { members } = useMinistryMembers();
  const { access_token, role } = useAuth();

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setShowPendingModal(false);
      setShowRejectedModal(false);
      setClosing(false);
    }, 300);
  };

  // Fetch members with completions
  const fetchMembers = useCallback(async () => {
    if (!ministryId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/postgre/ministries/${ministryId}/members`);
      const data = await res.json();
      if (!res.ok) {
        console.error("Fetch members error:", data);
       
        return;
      }
    
    } catch (error) {
      console.error("Fetch members failed:", error);
    
    } finally {
      setLoading(false);
    }
  }, [ministryId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Update member status
  const updateStatus = async (memberId: number, status: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch(
        `/api/postgre/ministries/${ministryId}/members/${memberId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        console.error("Failed to update member status:", data);
        return;
      }
      fetchMembers(); // refresh list
    } catch (error) {
      console.error("Error updating member status:", error);
    }
  };

  const pendingMembers = members.filter((m) => m.status === "PENDING");
  const approvedMembers = members.filter((m) => m.status === "APPROVED");
  const rejectedMembers = members.filter((m) => m.status === "REJECTED");

     // Inside your component
          const [ministries, setMinistries] = useState<Ministry[]>([]);
          const [loadingMinistries, setLoadingMinistries] = useState(true);
  
          useEffect(() => {
          async function fetchMinistries() {
              const token = localStorage.getItem("token");
              if (!token) return;
  
              try {
              const res = await fetch("/api/postgre/ministries", {
                  headers: { Authorization: `Bearer ${token}` },
              });
              const data = await res.json();
              setMinistries(data.data || []);
              } catch (err) {
              console.error(err);
              } finally {
              setLoadingMinistries(false);
              }
          }
          fetchMinistries();
          }, []);
  
          // Find ministry safely
          const currentMinistry = ministries[ministryId - 1]?.name || "Unknown Ministry";
         

  return (
    <div className="border  bg-muted/70 rounded-2xl p-5">
      <h2 className="text-xl font-bold mb-4 text-center"> {loadingMinistries ? "Loading..." : `${currentMinistry} Ministry`}</h2>
      <h2 className="text-xl font-bold mb-4 flex justify-between items-center">
        Members
        {role === "ADMIN" && (
          <>
           {pendingMembers.length > 0 && (
          
          <button
            className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:cursor-pointer"
            onClick={() => setShowPendingModal(true)}
          >
            Pending ({pendingMembers.length})
          </button>
    
        )}
        {rejectedMembers.length > 0 && (
          <button
            className="bg-red-500 text-white px-3 py-1 rounded text-sm ml-2 hover:cursor-pointer"
            onClick={() => setShowRejectedModal(true)}
          >
            Rejected ({rejectedMembers.length})
          </button>
        )}
        </>
        )}
       
      </h2>

      {loading ? (
        <p>Loading members...</p>
      ) : (
        <div className="space-y-4">
          {approvedMembers.map((m) => {
            const total = m.completions?.length || 0;
            const completed = m.completions?.filter((c) => c.completed)?.length || 0;
            const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
              <div key={m.id} className="border rounded p-3 flex justify-between items-center">
                <div>
                  <div className="flex flex-row items-center gap-2">
                    <HoverCard
                  userId={m.user?.id || 0}
                  name={m.user?.name || "Unknown"}
                  title={"Member"}
                  image={
                    m.user?.personalInformation?.profileImage ||
                    "/images/userIcon.png"
                  }
                >
                    <img
                          src={m.user?.personalInformation?.profileImage ||
                           "/images/userIcon.png"}
                          className="w-10 h-10 rounded-full object-cover cursor-pointer hover:brightness-110 transition"
                        />
                        </HoverCard>
                  <HoverCard
                  userId={m.user?.id || 0}
                  name={m.user?.name || "Unknown"}
                  title={"Member"}
                  image={
                    m.user?.personalInformation?.profileImage ||
                    "/images/userIcon.png"
                  }
                >
                    <div className="font-semibold">{m.user.name}</div>
                </HoverCard>
                </div>
                 
                  <div className="text-sm text-muted-foreground">
                    {completed}/{total} trainings completed ({percent}%)
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded mt-1">
                    <div
                      className="bg-green-500 h-2 rounded"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rejected Members Modal */}
      {showRejectedModal && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
            closing ? styles.backdropOut : styles.backdropIn
          }`}
        >
          <div
            className={`bg-muted rounded p-6 w-96 max-h-[80vh] overflow-y-auto ${
              closing ? styles.modalOut : styles.modalIn
            }`}
          >
            <h3 className="text-lg font-bold mb-4">Rejected Members</h3>
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={handleClose}
            >
              ✕
            </button>

            {rejectedMembers.map((m) => (
              <div
                key={m.id}
                className="border rounded p-3 mb-3 flex justify-between items-center"
              >
                <div>{m.user.name}</div>
                <div className="space-x-2">
                  <button
                    className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                    onClick={() => updateStatus(m.id, "APPROVED")}
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Members Modal */}
      {showPendingModal && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
            closing ? styles.backdropOut : styles.backdropIn
          }`}
        >
          <div
            className={`bg-background rounded p-6 w-120 max-h-[80vh] overflow-y-auto ${
              closing ? styles.modalOut : styles.modalIn
            }`}
          >
            <h3 className="text-lg font-bold mb-4">Pending Members</h3>
            <button
              className="absolute top-2 right-2 text-muted-foreground hover:text-gray-800 hover:cursor-pointer"
              onClick={handleClose}
            >
              ✕
            </button>

            {pendingMembers.map((m) => (
              <div
                key={m.id}
                className="border rounded p-3 mb-3 flex justify-between items-center"
              >
                <div>{m.user.name}</div>
                <div className="space-x-2">
                  <button
                    className="bg-green-500 text-foreground px-2 py-1 rounded text-sm hover:cursor-pointer"
                    onClick={() => updateStatus(m.id, "APPROVED")}
                  >
                    Accept
                  </button>
                  <button
                    className="bg-red-500 text-foreground px-2 py-1 rounded text-sm hover:cursor-pointer"
                    onClick={() => updateStatus(m.id, "REJECTED")}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}