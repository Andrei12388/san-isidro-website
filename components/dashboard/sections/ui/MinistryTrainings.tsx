"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { useMinistryMembers } from "@/context/MinistryMemberContext";

interface Training {
  id: number;
  title: string;
  description?: string;
  completions?: { id: number; member: { id: number; user: { name: string } }; completed: boolean }[];
}

interface Member {
  id: number;
  user: { id: number; name: string };
}

export default function MinistryTrainings({ ministryId }: { ministryId: number }) {
  const { access_token } = useAuth();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(false);
  const { members, refreshMembers } = useMinistryMembers();

  // Form state
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Fetch trainings and members
  async function fetchData() {
    setLoading(true);
    try {
      const [trainRes, memberRes] = await Promise.all([
        fetch(`/api/postgre/ministries/${ministryId}/trainings`),
        fetch(`/api/postgre/ministries/${ministryId}/members`),
      ]);
      const trainingsData = await trainRes.json();
      const membersData = await memberRes.json();
      setTrainings(trainingsData.data || []);
     
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [ministryId]);

  // Save training
  async function saveTraining() {
    if (!access_token || !title.trim()) return alert("Title is required");
    setLoading(true);
    try {
      const method = editingTraining ? "PATCH" : "POST";
      const endpoint = editingTraining
        ? `/api/postgre/ministries/${ministryId}/trainings/${editingTraining.id}`
        : `/api/postgre/ministries/${ministryId}/trainings`;

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({ title, description }),
      });

      if (!res.ok) throw new Error("Failed to save training");
      await fetchData();
      setTitle("");
      setDescription("");
      setEditingTraining(null);
    } catch (err: any) {
      alert(err.message || "Error saving training");
    } finally {
      setLoading(false);
    }
  }

  // Delete training
  async function deleteTraining(id: number) {
    if (!access_token) return;
    if (!confirm("Are you sure you want to delete this training?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/postgre/ministries/${ministryId}/trainings/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (!res.ok) throw new Error("Failed to delete training");
      await fetchData();
    } catch (err: any) {
      alert(err.message || "Error deleting training");
    } finally {
      setLoading(false);
    }
  }

  // Toggle completion
  async function toggleCompletion(trainingId: number, memberId: number, completed: boolean) {
    if (!access_token) return;
    try {
      const res = await fetch(`/api/postgre/ministries/${ministryId}/trainings/${trainingId}/completion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({ memberId, completed }),
      });
      if (!res.ok) throw new Error("Failed to update completion");
     await fetchData();
     refreshMembers(); // <-- update the members progress
    } catch (err: any) {
      alert(err.message || "Error updating completion");
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Trainings</h2>

      {/* Add/Edit Form */}
      <div className="border p-4 rounded mb-4 space-y-2">
        <Input
          placeholder="Training Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex space-x-2">
          <Button onClick={saveTraining} disabled={loading}>
            {editingTraining ? "Update" : "Add"} Training
          </Button>
          {editingTraining && (
            <Button
              variant="secondary"
              onClick={() => {
                setEditingTraining(null);
                setTitle("");
                setDescription("");
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Trainings List */}
      {loading ? (
        <p>Loading trainings...</p>
      ) : (
        <ul className="space-y-4">
          {trainings.map((t) => (
            <li key={t.id} className="border rounded p-3 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">{t.title}</div>
                  <div className="text-sm text-muted-foreground">{t.description}</div>
                </div>
                <div className="space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingTraining(t);
                      setTitle(t.title);
                      setDescription(t.description || "");
                    }}
                  >
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteTraining(t.id)}>
                    Delete
                  </Button>
                </div>
              </div>

              {/* Members Completion */}
              <div className="mt-2">
                <div className="font-medium text-sm mb-1">Completion:</div>
                <div className="flex flex-wrap gap-2">
                  {members.map((m) => {
                    const completion = t.completions?.find((c) => c.member.id === m.id);
                    const isCompleted = completion?.completed || false;
                    return (
                      <Button
                        key={m.id}
                        size="xs"
                        variant={isCompleted ? "default" : "outline"}
                        onClick={() => toggleCompletion(t.id, m.id, !isCompleted)}
                      >
                        {m.user.name} {isCompleted ? "✅" : "❌"}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}