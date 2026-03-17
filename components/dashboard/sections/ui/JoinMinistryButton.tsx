"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface JoinMinistryButtonProps {
  ministryId: number;
}

export default function JoinMinistryButton({ ministryId }: JoinMinistryButtonProps) {
  const { access_token } = useAuth();
  const [status, setStatus] = useState<"APPROVED" | "PENDING" | "NOT_JOINED" | "REJECTED">("NOT_JOINED");
  const [loading, setLoading] = useState(false);

  // Fetch membership status on mount
  useEffect(() => {
    if (!access_token) return;

    async function fetchStatus() {
      try {
        const res = await fetch(`/api/postgre/ministries/${ministryId}/status`, {
          headers: { Authorization: `Bearer ${access_token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch membership status");

        const data = await res.json();
        setStatus(data.status); // status can be APPROVED, PENDING, NOT_JOINED, or REJECTED
      } catch (err) {
        console.error(err);
      }
    }

    fetchStatus();
  }, [ministryId, access_token]);

  // Join ministry
  async function joinMinistry() {
    if (!access_token) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/postgre/ministries/${ministryId}/join`, {
        method: "POST",
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (!res.ok) throw new Error("Failed to send join request");

      setStatus("PENDING");
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Cancel membership
  async function cancelMembership() {
    if (!access_token) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/postgre/ministries/${ministryId}/join`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (!res.ok) throw new Error("Failed to cancel membership");

      setStatus("NOT_JOINED");
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Determine button text & variant
  let buttonText = "Join";
  let variant: "default" | "destructive" | "secondary" = "default";

  if (status === "APPROVED") {
    buttonText = "Cancel Membership";
    variant = "destructive";
  } else if (status === "PENDING") {
    buttonText = "Pending Approval";
    variant = "secondary";
  } else if (status === "REJECTED") {
    buttonText = "Rejected";
    variant = "destructive";
  }

  // NOT_JOINED button
  if (status === "NOT_JOINED") {
    return (
      <Button size="sm" onClick={joinMinistry} disabled={loading}>
        {loading ? "Processing..." : "Join"}
      </Button>
    );
  }

  // APPROVED, PENDING, or REJECTED button
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button
          size="sm"
          variant={variant}
          disabled={loading || status === "PENDING" || status === "REJECTED"}
        >
          {loading ? "Processing..." : buttonText}
        </Button>
      </AlertDialogTrigger>

      {/* Only show cancel dialog for APPROVED */}
      {status === "APPROVED" && (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Ministry Membership?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave this ministry? You will need to
              request to join again if you change your mind.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Keep Membership</AlertDialogCancel>
            <AlertDialogAction onClick={cancelMembership}>
              Yes, Leave Ministry
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
}