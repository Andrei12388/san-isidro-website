'use client';
import { NavUser } from "@/components/dashboard/nav-user";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { IconBell, IconMail, IconHeart, IconPlus } from "@tabler/icons-react";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FaCommentDots } from "react-icons/fa";
import styles from "@/components/dashboard/sections/devotions.module.css";
import { Spinner } from "@/components/ui/loadingSpinner";
import DOMPurify from "dompurify";
import HoverCard from "@/components/userCard/hoverCard";
import { useRouter } from "next/navigation";

function CommentActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded hover:bg-muted-foreground cursor-pointer text-foreground"
      >
        ⋮
      </button>

      {open && (
        <div className="absolute right-0 w-28 bg-background border rounded shadow z-50">
          <button
            onClick={() => {
              onEdit();
              setOpen(false);
            }}
            className="block w-full text-left text-foreground px-3 py-2 hover:bg-muted-foreground cursor-pointer"
          >
            Edit
          </button>
          <button
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
            className="block w-full text-left px-3 py-2 hover:bg-muted-foreground text-red-600 cursor-pointer"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

interface UserType {
  name: string;
  email: string;
  avatar: string;
  id: number;
}

interface DevotionType {
  id: number;
  title: string;
  content: string;
  image: string;
  scriptureReference?: string;
  devotionDate: string;
  createdAt: string;
  updatedAt: string;
  comments: any[];
  likesCount: number;
  userLiked: boolean;
  user: {
    id: number;
    name: string;
    profileImage?: string;
  };
}

const API_BASE =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_APP_URL
    : "http://localhost:3000";

export default function Page() {
  const [user, setUser] = useState<UserType | null>(null);
  const [devotions, setDevotions] = useState<DevotionType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<DevotionType | null>(null);
  const [editingCommentIdx, setEditingCommentIdx] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);
  const [comment, setComment] = useState("");
  const { access_token } = useAuth();
  const fetchOnce = useRef(false);

// Alternatively, use a hook:
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank'); // open in new tab
    node.setAttribute('rel', 'noopener noreferrer'); // security best practice
  }
});

  const router = useRouter();

  useEffect(() => {
    if (fetchOnce.current) return;

    const fetchUser = async () => {
      try {
        const sessionRes = await fetch(`${API_BASE}/api/auth/getSession`);
        const userData = await sessionRes.json();

        setUser({
          id: userData.user,
          name: userData.name,
          email: userData.email,
          avatar: userData.profileImage,
        });

        fetchOnce.current = true;
      } catch (error) {
        console.error("Error fetching user session:", error);
      }
    };

    fetchUser();
  }, [access_token]);

  // Fetch all devotions
  useEffect(() => {
    const fetchDevotions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!access_token) {
          setError("Not authenticated");
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE}/api/postgre/devotions?all=true`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch devotions");
        }

        const result = await response.json();
        setDevotions(result.data || []);
        console.log("Fetched devotions:", result.data);
      } catch (err) {
        console.error("Error fetching devotions:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    if (access_token) {
      fetchDevotions();
    }
  }, [access_token]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setSelected(null);
      setClosing(false);
      setComment("");
    }, 300);
  };

  const handleHeartReact = async (id: number) => {
    if (!access_token) return;

    try {
      const res = await fetch(`${API_BASE}/api/postgre/devotions/likes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({ devotionId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to toggle like");

      setDevotions((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              likesCount: data.likesCount,
              userLiked: data.userLiked,
            };
          }
          return item;
        })
      );

      if (selected?.id === id) {
        setSelected((prev) =>
          prev && {
            ...prev,
            likesCount: data.likesCount,
            userLiked: data.userLiked,
          }
        );
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleAddComment = async () => {
    if (!selected || !comment.trim() || !access_token) return;

    try {
      const res = await fetch(`${API_BASE}/api/postgre/devotions/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({ devotionId: selected.id, comment: comment.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add comment");

      const newComment = data.data;
      // if the API didn't return the profile image yet, use current user's avatar
      const augmentedComment = {
        ...newComment,
        user: {
          ...newComment.user,
          profileImage:
            newComment.user?.profileImage || user?.avatar || null,
        },
      };

      setDevotions((prev) =>
        prev.map((item) => {
          if (item.id === selected.id) {
            return {
              ...item,
              comments: [...item.comments, augmentedComment],
            };
          }
          return item;
        })
      );

      setSelected((prev) =>
        prev && {
          ...prev,
          comments: [...prev.comments, augmentedComment],
        }
      );

      setComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleEditComment = (devotionId: number, commentIdx: number) => {
    const devotion = devotions.find((d) => d.id === devotionId);
    const current = devotion?.comments?.[commentIdx];
    if (current) {
      setComment(current.comment);
      setEditingCommentIdx(commentIdx);
      // ensure selected is set to the devotion being edited
      if (!selected || selected.id !== devotionId) {
        setSelected(devotion || null);
      }
    }
  };

  const handleSaveEditComment = async () => {
    if (!selected || editingCommentIdx === null || !comment.trim() || !access_token) return;

    const current = selected.comments?.[editingCommentIdx];
    if (!current) return;

    try {
      const res = await fetch(`${API_BASE}/api/postgre/devotions/comments/${current.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({ comment: comment.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update comment");

      // update devotions list
      setDevotions((prev) =>
        prev.map((d) => {
          if (d.id === selected.id) {
            const updated = [...d.comments];
            updated[editingCommentIdx] = { ...updated[editingCommentIdx], comment: comment.trim() };
            return { ...d, comments: updated };
          }
          return d;
        })
      );

      // update selected comments
      setSelected((prev) => prev && {
        ...prev,
        comments: prev.comments.map((c, i) => (i === editingCommentIdx ? { ...c, comment: comment.trim() } : c)),
      });

      setComment("");
      setEditingCommentIdx(null);
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const handleDeleteComment = async (devotionId: number, commentIdx: number) => {
    if (!access_token) return;

    const devotion = devotions.find((d) => d.id === devotionId);
    const commentToDelete = devotion?.comments?.[commentIdx];
    if (!commentToDelete) return;

    try {
      const res = await fetch(`${API_BASE}/api/postgre/devotions/comments/${commentToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to delete comment");
      }

      setDevotions((prev) => prev.map((d) => (d.id === devotionId ? { ...d, comments: d.comments.filter((_, i) => i !== commentIdx) } : d)));
      if (selected?.id === devotionId) {
        setSelected((prev) => prev && ({ ...prev, comments: prev.comments.filter((_, i) => i !== commentIdx) }));
      }
      // if we were editing this comment, cancel edit
      if (editingCommentIdx === commentIdx) {
        setEditingCommentIdx(null);
        setComment("");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleCommentSubmit = () => {
    if (editingCommentIdx !== null) {
      handleSaveEditComment();
    } else {
      handleAddComment();
    }
  };
  return (
    <>
      <Head>
        <meta name="description" content="Devotions page for My App" />
      </Head>

      <main className="h-screen w-full flex flex-col overflow-hidden">
        {/* header navigation */}
        <header className="fixed top-0 z-50 w-full bg-background border-b">
          <div className="flex justify-between items-center px-5">
            <a
              href="/"
              className="flex gap-2 p-2 items-center rounded-sm hover:bg-muted-foreground/30"
            >
              <Image
                src="/images/logonotitle.png"
                alt="logo"
                width={40}
                height={40}
              />
              <h1 className="hidden sm:block font-bold">JCSGO: SAN ISIDRO</h1>
            </a>

            <div className="flex items-center ml-2 gap-2">
              <Button size="icon" variant="outline">
                <IconMail />
              </Button>

              <Button size="icon" variant="outline">
                <IconBell />
              </Button>

              {user && <NavUser item={user} />}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="mt-20 flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-center">Devotions</h1>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p>{error}</p>
              </div>
            )}

            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            )}

            {!isLoading && devotions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No devotions found. Create one to get started!
                </p>
              </div>
            )}

            {!isLoading && devotions.length > 0 && (
              <section className="grid gap-2 lg:gap-4 justify-center grid-cols-2 sm:grid-cols-3 lg:grid-cols-[repeat(auto-fit,minmax(240px,240px))]">
                {devotions.map((devotion) => (
                  <div
                    key={devotion.id}
                    onClick={() => setSelected(devotion)}
                    className={`${styles.devotionCard} border rounded-lg p-4 shadow bg-background flex flex-col gap-3 cursor-pointer`}
                  >
                    <div>
                      <h2 className="font-semibold text-foreground text-lg line-clamp-1">
                        {devotion.title}
                      </h2>
                      <span className="text-muted-foreground text-sm line-clamp-1">
                        {devotion.user?.name || "Unknown User"}
                      </span>
                    </div>
                    <div className="flex flex-row justify-center items-center gap-2">
                      <img
                        src={devotion.image}
                        alt={devotion.title}
                        className="w-full h-40 object-cover rounded"
                      />
                    </div>
                    <span className="text-muted-foreground text-sm line-clamp-1">
                      {devotion.scriptureReference || "No scripture reference"}
                    </span>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      <div
                  className="
                  mt-3 max-w-none
                  [&_a]:text-blue-600
                  [&_a]:underline
                  [&_a]:font-medium
                  [&_a:hover]:text-blue-800
                "
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(devotion.content) }}
                />
                    </p>
                    <div className="flex justify-between text-sm text-foreground-500">
                      <span 
                        className="text-md flex items-center cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleHeartReact(devotion.id);
                        }}
                      >
                        <IconHeart
                          className={styles.heart}
                          fill={devotion.userLiked ? "red" : "white"}
                          color={devotion.userLiked ? "red" : "black"}
                          size={18}
                        />{" "}
                        {devotion.likesCount}
                      </span>
                      <span className="flex flex-row gap-1">
                        <FaCommentDots size={18} />
                        {devotion.comments.length}
                      </span>
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* Modal */}
            {selected && (
              <div
                className={`fixed inset-0 bg-black/40 flex justify-center items-start p-4 z-100 overflow-y-auto ${
                  closing ? styles.backdropOut : styles.backdropIn
                }`}
                onClick={handleClose}
              >
                <div
                  className="flex flex-col w-full max-w-6xl gap-4 md:flex-col lg:flex-row"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    className={`bg-background rounded-lg p-6 flex flex-col flex-[2_2_0%] ${
                      closing ? styles.modalOut : styles.modalIn
                    }`}
                  >
                    <div className="overflow-y-auto max-h-[80vh]">
                      <div className="flex flex-col justify-center items-center">
                        <img
                          src={selected.image}
                          className="mb-3 rounded w-full max-w-lg"
                          alt={selected.title}
                        />
                        <span className="text-muted-foreground text-sm mb-5">
                          {selected.scriptureReference}
                        </span>
                      </div>
                      <p className="text-foreground whitespace-pre-line mt-3">
                        <div
                  className="
                  mt-3 max-w-none
                  [&_a]:text-blue-600
                  [&_a]:underline
                  [&_a]:font-medium
                  [&_a:hover]:text-blue-800
                "
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selected.content) }}
                />
                      </p>
                    </div>
                  </div>

                  <div
                    className={`bg-background rounded-lg p-6 flex flex-col justify-between flex-[1_1_0%] max-h-[90vh] ${
                      closing ? styles.modalOut : styles.modalIn
                    }`}
                  >
                    <div className="overflow-y-auto">
                      <div className="mb-2 flex flex-row justify-between">
                        <div className="flex flex-col">
                          <h2 className="font-semibold text-foreground text-lg">
                            {selected.title}
                          </h2>
                          <span className="text-muted-foreground text-sm">
                            {selected.user?.name || "Unknown User"}
                          </span>
                        </div>
                        <div className="flex flex-row items-center justify-between mb-5">
                          <button
                            className="px-4 py-2 bg-background text-foreground rounded cursor-pointer"
                            onClick={handleClose}
                          >
                            Close
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-row justify-between mb-2">
                        <span 
                          className="text-lg text-foreground flex items-center cursor-pointer"
                          onClick={() => handleHeartReact(selected.id)}
                        >
                          <IconHeart
                            fill={selected.userLiked ? "red" : "white"}
                            color={selected.userLiked ? "red" : "black"}
                            className={styles.heart}
                            size={22}
                          />
                          {selected.likesCount}
                        </span>
                        <span className="flex flex-row justify-center items-center gap-1 text-muted-foreground">
                          <FaCommentDots size={22} />
                          {selected.comments.length}
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg text-foreground">
                        Comments
                      </h3>
                      <div className="overflow-y-auto mt-2 pb-15">
                        <div className="flex flex-col gap-3">
                          {selected.comments.length === 0 ? (
                            <p className="text-muted-foreground text-sm">
                              No comments yet
                            </p>
                          ) : (
                            selected.comments.map((c, idx) => (
                              <div key={c.id} className="rounded p-3">
                                <div className="flex items-start gap-2">
                                  <img
                                    src={c.user?.profileImage || "images/userIcon.png"}
                                    alt={c.user?.name || "User"}
                                    onClick={() => router.push(`/user/${c.user?.id}`)}
                                    className="w-8 h-8 rounded-full object-cover cursor-pointer"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                      <div>
                                        <HoverCard
                                        userId={c.user?.id}
                                        name={c.user?.name || "Unknown"}
                                        title={c.user?.title || "Member"}
                                        image={c.user?.profileImage || "/images/userIcon.png"}
                                        onView={() => router.push(`/user/${c.user?.id}`)}
                                        >
                                        <span className="font-semibold text-sm cursor-pointer hover:underline" onClick={() => router.push(`/user/${c.user?.id}`)}>{c.user?.name || "Unknown"}</span>
                                        </HoverCard>
                                        <p className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</p>
                                      </div>
                                      <div className="self-start">
                                        <CommentActions
                                          onEdit={() => handleEditComment(selected.id, idx)}
                                          onDelete={() => handleDeleteComment(selected.id, idx)}
                                        />
                                      </div>
                                    </div>
                                    <p className="text-sm text-foreground mt-1 break-words">{c.comment}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-5">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleCommentSubmit();
                            }
                          }}
                          placeholder={editingCommentIdx !== null ? "Edit comment..." : "Add comment..."}
                          className="input sz-md variant-mixed text-foreground flex-1 border rounded px-2 py-1"
                        />
                        <Button onClick={handleCommentSubmit} disabled={!comment.trim()}>
                          {editingCommentIdx === null ? "Post" : "Save"}
                        </Button>

                        {editingCommentIdx !== null && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              setComment("");
                              setEditingCommentIdx(null);
                            }}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}