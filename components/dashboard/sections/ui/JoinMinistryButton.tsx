"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface JoinMinistryButtonProps {
  ministryId: number;
}

export default function JoinMinistryButton({ ministryId }: JoinMinistryButtonProps) {
  const { access_token } = useAuth();
  const [status, setStatus] = useState<"APPROVED" | "PENDING" | "NOT_JOINED">("NOT_JOINED");
  const [loading, setLoading] = useState(false);

  // Fetch membership status
  useEffect(() => {
    if (!access_token) return;

    async function fetchStatus() {
      try {
        const res = await fetch(`/api/postgre/ministries/${ministryId}/status`, {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch membership status");

        const data = await res.json();
        setStatus(data.status); // "APPROVED" | "PENDING" | "NOT_JOINED"
      } catch (err) {
        console.error(err);
      }
    }

    fetchStatus();
  }, [ministryId, access_token]);

  // Join or Cancel depending on current status
  async function toggleMembership() {
    if (!access_token) return;

    setLoading(true);
    try {
      if (status === "APPROVED" || status === "PENDING") {
        // Cancel membership
        const res = await fetch(`/api/postgre/ministries/${ministryId}/join`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${access_token}` },
        });
        if (!res.ok) throw new Error("Failed to cancel membership");
        setStatus("NOT_JOINED");
      } else {
        // Join ministry
        const res = await fetch(`/api/postgre/ministries/${ministryId}/join`, {
          method: "POST",
          headers: { Authorization: `Bearer ${access_token}` },
        });
        if (!res.ok) throw new Error("Failed to send join request");
        setStatus("PENDING");
      }
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Button text & color
  let buttonText = "Join";
  let variant: "default" | "destructive" | "secondary" = "default";

  if (status === "APPROVED") {
    buttonText = "Cancel Membership";
    variant = "destructive"; // red
  } else if (status === "PENDING") {
    buttonText = "Pending Approval";
    variant = "secondary"; // gray
  } else {
    buttonText = "Join";
    variant = "default"; // green
  }

  return (
    <Button
      size="sm"
      onClick={toggleMembership}
      disabled={loading || status === "PENDING"}
      variant={variant}
    >
      {loading ? "Processing..." : buttonText}
    </Button>
  );
}