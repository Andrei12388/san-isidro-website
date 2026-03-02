"use client";

import { useEffect, useState } from "react";
import styles from "./devotions.module.css";
import { Input } from "@/components/ui/input";
import { IconHeart, IconPlus } from "@tabler/icons-react";
import BibleVersePickerNoAPI from "@/components/bible/BibleVersePicker";
import { Button } from "@/components/ui/button";
import { FaCommentDots, FaFacebookMessenger } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import DOMPurify from "dompurify";
import { Spinner } from "@/components/ui/loadingSpinner";
import HoverCard from "@/components/userCard/hoverCard";
import { useRouter } from "next/navigation";
import MessageEditor from "@/components/ui/editors/textField";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_APP_URL
    : "http://localhost:3000";

export interface DevotionCommentItem {
  id: number;
  userId: number;
  devotionId: number;
  comment: string;

  createdAt: string;
  updatedAt: string;

  user?: {
    id: number;
    name: string;
    profileImage?: string | null;
  };
}

export interface DevotionItem {
  id: number;
  title: string;
  image: string;
  message: string;
  verse: string;
  heart: number;
  heartActive: boolean;
  comments: DevotionCommentItem[];
  user?: {
    id: number;
    name: string;
    profileImage?: string | null;
  };
}

type CommentType = {
  userId: number;
  id: number;
  name: string;
  comment: string;
  time: string;
  image: string;
};

type CommentsCardProps = CommentType;

function CommentActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative inline-block">
      {/* 3 dots button */}
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
  )
}

function CommentsCard({userId, name, comment, time, image, onEdit, onDelete }: CommentsCardProps & { onEdit: () => void; onDelete: () => void }) {
  const router = useRouter();
  return (
    <div className="p-2 bg-background text-muted-foreground rounded flex-col">
      <section className="flex flex-row justify-between gap-2">
      <div className="flex flex-row gap-5"><img src={image} className="rounded-full w-8 h-8 cursor-pointer" />
        <div className="flex flex-col">
        <HoverCard
                                                userId={userId}
                                                name={name || "Unknown"}
                                                title={"Member"}
                                                image={image || "/images/userIcon.png"}
                                                onView={() => router.push(`/user/${userId}`)}
                                                >
                                                <span className="font-semibold text-sm text-foreground cursor-pointer hover:underline" onClick={() => router.push(`/user/${userId}`)}>{name || "Unknown"}</span>
                                                </HoverCard>
        <span className="text-sm mb-1">{time}</span>
         <span className="text-sm text-foreground"> {comment} </span>
        </div>
      </div>
      
      <div className="self-start"><CommentActions onEdit={onEdit} onDelete={onDelete} /></div>
      </section>
      <section>
    
      </section>
    </div>
  )
}


export default function DevotionsSection() {
  const [devotions, setDevotions] = useState<DevotionItem[]>([]);
  const [commentsById, setCommentsById] = useState<Record<number, CommentType[]>>({});
  const [selected, setSelected] = useState<DevotionItem | null>(null);
  const [comment, setComment] = useState("");
  const [editingCommentIdx, setEditingCommentIdx] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);
  const { access_token, name } = useAuth();
  const [addDevotion, setAddDevotion] = useState(false);
  const [loadingDevotion, setLoadingDevotion] = useState(false);

  const addDevotionToState = (newDev: DevotionItem) => {
    setDevotions((prev) => [newDev, ...prev]);
    setCommentsById((prev) => ({ ...prev, [newDev.id]: [] }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [verseInput, setVerseInput] = useState("");

  const [book, setBook] = useState<string>("John");
  const [chapter, setChapter] = useState<number>(3);
  const [verse, setVerse] = useState<number>(16);
  const [verseData, setVerseData] = useState<any>(null);

  // Alternatively, use a hook:
useEffect(() => {
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A') {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });
}, []);

  // fetch devotions from the backend (includes comments and like info)
  const fetchDevotions = async () => {
    setLoadingDevotion(true);
    if (!access_token) return;
    try {
      const response = await fetch(`${API_BASE}/api/postgre/devotions`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch devotions");
      const json = await response.json();

      // API already returns flattened comment/user objects, but we need to
      // rename `likesCount`/`userLiked` to the local fields `heart`/`heartActive`
      const items: DevotionItem[] = json.data.map((d: any) => ({
        ...d,
        message: d.content,
        title: d.title,
        verse: d.scriptureReference,
        heart: d.likesCount ?? 0,
        heartActive: d.userLiked ?? false,
      }));

      const byId: Record<number, CommentType[]> = {};
      items.forEach((d: any) => {
        byId[d.id] = (d.comments || []).map((c: any) => ({
          id: c.id,
          userId: c.user?.id || 0,
          name: c.user?.name || "",
          comment: c.comment,
          time: new Date(c.createdAt).toLocaleString(),
          image: c.user?.profileImage || "images/userIcon.png",
        }));
      });
      
      setLoadingDevotion(false);
      setDevotions(items);
      setCommentsById(byId);
    } catch (error) {
      console.error("Error fetching devotions:", error);
    }
  };

  useEffect(() => {
    fetchDevotions();
  }, [access_token]);

  useEffect(() => {
    const searchVerse = async () => {
      try {
        const response = await fetch(`https://bible-api.com/${book}+${chapter}:${verse}`);
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        console.log(data.reference, data.verses);
        setVerseData(data); // store it in state if needed
      } catch (error) {
        console.error("Error fetching verse:", error);
      }
    };

    searchVerse();
  }, [book, chapter, verse]); // re-run when book, chapter, or verse changes

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

      // update both list and selected item in one pass
      setDevotions((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              heart: data.likesCount,
              heartActive: data.userLiked,
            };
          }
          return item;
        })
      );

      if (selected?.id === id) {
        setSelected((prev) =>
          prev && {
            ...prev,
            heart: data.likesCount,
            heartActive: data.userLiked,
          }
        );
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleSetImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // get the selected file
    if (file) {
      setImage(file); // store the File object
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  setVerseInput(e.target.value)

  e.target.style.height = "auto"
  e.target.style.height = e.target.scrollHeight + "px"
}


  const handleChangeMessage = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  setMessage(e.target.value)

  e.target.style.height = "auto"
  e.target.style.height = e.target.scrollHeight + "px"
}

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setSelected(null);
      setClosing(false);
      setAddDevotion(false);
    }, 300);
  };

  //add/edit/delete comments

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

      const newC = data.data;
      const newComment: CommentType = {
        id: newC.id,
        userId: newC.user?.id || 0,
        name: newC.user?.name || "",
        comment: newC.comment,
        time: "Just now",
        image:
          newC.user?.profileImage ||
          newC.user?.personalInformation?.profileImage ||
          "images/userIcon.png",
      };

      setCommentsById((prev) => {
        const existing = prev[selected.id] || [];
        return { ...prev, [selected.id]: [...existing, newComment] };
      });
      setComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleEditComment = (devotionId: number, commentIdx: number) => {
    const currentComment = commentsById[devotionId]?.[commentIdx];
    if (currentComment) {
      setComment(currentComment.comment);
      setEditingCommentIdx(commentIdx);
    }
  };

  const handleSaveEditComment = async () => {
    if (!selected || !comment.trim() || editingCommentIdx === null || !access_token) return;

    const current = commentsById[selected.id]?.[editingCommentIdx];
    if (!current) return;

    try {
      const res = await fetch(
        `${API_BASE}/api/postgre/devotions/comments/${current.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
          body: JSON.stringify({ comment: comment.trim() }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update comment");

      setCommentsById((prev) => {
        const existing = prev[selected.id] || [];
        const updated = [...existing];
        updated[editingCommentIdx] = {
          ...updated[editingCommentIdx],
          comment: comment.trim(),
          time: "Just now (edited)",
        };
        return { ...prev, [selected.id]: updated };
      });
      setComment("");
      setEditingCommentIdx(null);
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const handleDeleteComment = async (devotionId: number, commentIdx: number) => {
    if (!access_token) return;

    const commentToDelete = commentsById[devotionId]?.[commentIdx];
    if (!commentToDelete) return;

    try {
      const res = await fetch(
        `${API_BASE}/api/postgre/devotions/comments/${commentToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to delete comment");
      }

      setCommentsById((prev) => {
        const existing = prev[devotionId] || [];
        return { ...prev, [devotionId]: existing.filter((_, i) => i !== commentIdx) };
      });
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

  const openAddDevotion = () => {
    setAddDevotion(true);
    setTitle("");
    setVerseInput("");
    setMessage("");
    setImage(null);
  }

 const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!access_token) {
    console.warn("no access token, user probably not authenticated");
    alert("You must be logged in to add a devotion.");
    return;
  }

  setIsSubmitting(true);

  let uploadedImageUrl = "images/defaultDevotion.jpg"; // default fallback

  // 1️⃣ Upload image to Cloudinary if user selected one
  if (image) {
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = "unsigned_image"; // make sure this exists in Cloudinary

      const formData = new FormData();
      formData.append("file", image);
      formData.append("upload_preset", uploadPreset);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      uploadedImageUrl = data.secure_url;
      console.log("Cloudinary upload success:", uploadedImageUrl);
    } catch (err) {
      console.error("Cloudinary upload failed:", err);
      alert("Failed to upload image. Using default.");
    }
  }

  try {
    const res = await fetch(`${API_BASE}/api/postgre/devotions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        title,
        content: message,
        scriptureReference: verseInput,
        image: uploadedImageUrl, // use Cloudinary URL instead of blob
        devotionDate: new Date().toISOString(),
      }),
    });

    const result = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = result?.error || res.statusText || "unknown error";
      throw new Error(msg);
    }

    const created = result.data;
    const newDevotion: DevotionItem = {
      id: created.id,
      title: created.title,
      image: created.image,
      message: created.content,
      verse: created.scriptureReference || "",
      heart: 0,
      heartActive: false,
      comments: [],
      user: created.user
        ? {
            id: created.user.id,
            name: created.user.name,
            profileImage: created.user.personalInformation?.profileImage || null,
          }
        : undefined,
    };
    addDevotionToState(newDevotion);
  } catch (error: any) {
    console.error("Error submitting devotion:", error);
    alert(`Unable to submit devotion: ${error.message}`);
    setIsSubmitting(false);
    return;
  }

  setIsSubmitting(false);
  handleClose();
};

if (loadingDevotion) {
    return <div className="flex flex-1 flex-row justify-center items-center text-center">Loading Devotions... <Spinner size={16} /></div>;
  }

   return (
    
    <div className="flex flex-1 flex-col">
      <div className="fixed bottom-10 z-90 right-10">  <Button onClick={openAddDevotion}><IconPlus /> Add Devotion</Button></div>
      
      <div className="@container/main flex flex-1 flex-col gap-2">
        <span className="text-center text-xl font-bold mt-3">Devotion Wall</span>
       
      
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <section
            className="grid gap-2 lg:gap-4 justify-center grid-cols-2 sm:grid-cols-3 lg:grid-cols-[repeat(auto-fit,minmax(240px,240px))]"
            
          >
            {devotions.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelected(item)}
                className={`${styles.devotionCard} border rounded-lg p-4 shadow bg-background flex flex-col gap-3`}
              >
                <div>
                  <h2 className="font-semibold text-foreground text-lg line-clamp-1">{item.title}</h2>
                  <span className="text-muted-foreground text-sm line-clamp-1">{item.user?.name || "Unknown User"}</span>
                </div>
                <div className="flex flex-row justify-center items-center gap-2">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-40 object-cover rounded"
                />
                </div>
                <span className="text-muted-foreground text-sm line-clamp-1">{item.verse}</span>
                <div
                  className="
                  mt-3 max-w-none
                  [&_a]:text-blue-600
                  [&_a]:underline
                  [&_a]:font-medium
                  [&_a:hover]:text-blue-800
                  line-clamp-1
                "
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.message) }}
                />
                <div className="flex justify-between text-sm text-foreground-500">
                  <span
                    className="text-md flex items-center cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleHeartReact(item.id);
                    }}
                  >
                    <IconHeart
                      className={styles.heart}
                      fill={item.heartActive ? "red" : "white"}
                      color={item.heartActive ? "red" : "black"}
                      size={18}
                    />{" "}
                    {item.heart}
                  </span>
                  <span className="flex flex-row gap-1"><FaCommentDots size={18} />{commentsById[item.id] ? commentsById[item.id].length : 0}</span>
                 
                </div>
              </div>
            ))}

            {/* Modal */}
            {selected && (
              <div
                className={`fixed inset-0 bg-black/40 flex justify-center items-start p-4 z-100 overflow-y-auto  ${
                  closing ? styles.backdropOut : styles.backdropIn
                }`}
                onClick={handleClose}
              >
                <div className="flex flex-col w-full max-w-6xl gap-4 md:flex-col lg:flex-row" onClick={(e) => e.stopPropagation()}>
                  <div
                    className={`bg-background rounded-lg p-6 flex flex-col flex-[2_2_0%] ${
                      closing ? styles.modalOut : styles.modalIn
                    }`}
                  >
                    <div className="overflow-y-auto max-h-[80vh]">
                      <div className="flex flex-col justify-center items-center">
                        <img src={selected.image} className="mb-3 rounded w-full max-w-lg" />
                        <span className="text-muted-foreground text-sm mb-5">{selected.verse}</span>
                      </div>
                    <div
                  className="
                  mt-3 max-w-none
                  [&_a]:text-blue-600
                  [&_a]:underline
                  [&_a]:font-medium
                  [&_a:hover]:text-blue-800
                "
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selected.message) }}
                />
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
                      <h2 className="font-semibold text-foreground text-lg">{selected.title}</h2>
                      <span className="text-muted-foreground text-sm">{selected.user?.name || "Unknown User"}</span>
                      </div>
                      <div className="flex flex-row items-center justify-between mb-5">
                      <button className="px-4 py-2 bg-background text-foreground rounded cursor-pointer" onClick={handleClose}>
                        Close
                      </button>
                    </div>
                    </div>
                    <div className="flex flex-row justify-between mb-2"> <span
                      className="text-lg text-foreground flex items-center cursor-pointer"
                      onClick={() => handleHeartReact(selected.id)}
                    >
                      <IconHeart fill={selected.heartActive ? "red" : "white"} color={selected.heartActive ? "red" : "black"} className={styles.heart} size={22} />
                      {selected.heart}
                    </span>
                    <span className="flex flex-row justify-center items-center gap-1 text-muted-foreground"><FaCommentDots size={22}/>{commentsById[selected.id] ? commentsById[selected.id].length : 0}</span>
                    </div>
                      <h3 className="font-semibold text-lg text-foreground">Comments</h3>
                    <div className="overflow-y-auto mt-2 pb-15">
                      <div className="flex flex-col gap-3">
                       {/* <CommentsCard name="Robert Andrei L. Bardoquillo" image="images/userIcon.jpg" comment="Awesome post!" time="41 Minutes ago" />
                        <CommentsCard name="Granger Gusion" image="images/userIcon.jpg" comment="Great insights!" time="1 Hour ago" />
                        <CommentsCard name="David Goliath" image="images/userIcon.jpg" comment="Thanks for sharing." time="2 Hours ago" />
                        */}
                       {(commentsById[selected.id] || []).map((c, idx) => (
                            <CommentsCard
                              key={idx}
                              id={c.id} 
                              userId={c.userId}
                              name={c.name}
                              comment={c.comment}
                              time={c.time}
                              image={c.image}
                              onEdit={() => handleEditComment(selected.id, idx)}
                              onDelete={() => handleDeleteComment(selected.id, idx)}
                            />
                          ))}
                      </div>
                    </div>
                    </div>
                    <div className="mt-5">
                      <div className="flex gap-2">
                      <Input
                        type="text"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleCommentSubmit();
                          }
                        }}
                        placeholder={editingCommentIdx !== null ? "Edit comment..." : "Add Comment..."}
                        name="comment"
                        minLength={1}
                        id="comment"
                        className="input sz-md variant-mixed text-foreground flex-1"
                      />
                      <Button
                        onClick={handleCommentSubmit}
                        disabled={!comment.trim()}
                      >
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
            {addDevotion && (
               <form onSubmit={onSubmit} className={`fixed inset-0 bg-black/40 flex justify-center items-start overflow-y-auto z-100 ${
                  closing ? styles.backdropOut : styles.backdropIn
                }`}>
              <div className={`lg:fixed overflow-y-auto inset-0 bg-black/40 flex lg:flex-row flex-col lg:justify-end justify-center items-center lg:items-start z-100 ${
                      closing ? styles.modalOut : styles.modalIn
                    }`}>
                      <div className="bg-background lg:rounded-lg p-6 w-full lg:h-full lg:max-w-md lg:mr-2 flex flex-col lg:overflow-y-auto border-b">
                        <h2 className="text-lg font-semibold text-center mb-5 border-b">Bible Verse</h2>
                        <BibleVersePickerNoAPI/>
                        </div>
                <div className="bg-background lg:rounded-lg p-6 w-full lg:h-full max-w-3xl flex flex-col justify-between">
                  <div className="overflow-y-auto">
                  <h2 className="text-lg font-semibold mb-4">Add New Devotion</h2>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-1 w-full">
                    <span className="text-lg font-semibold">Title</span>
                  <Input type="text" placeholder="Title"  
                  value={title}
                  required
                  onChange={(e) => setTitle(e.target.value)}/>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-lg font-semibold">Verse</span>
                 <textarea
                  placeholder="Verse (e.g. John 3:16)"
                  value={verseInput}
                  required
                  rows={1}
                  onChange={handleChange}
                  className="mb-3 w-full resize-none overflow-hidden border border-muted-foreground rounded px-2"
                />
                  </div>
                  </div>
                  <div className="flex flex-col gap-2 mt-5">
                  <span className="text-lg font-semibold">Image</span> 
                 <input
                    className="border rounded px-2 py-1 cursor-pointer"
                    type="file"
                    accept="image/*"
                    onChange={handleSetImage}
                  />
                  {image && (
                    <div className="mt-3 flex flex-row justify-center">
                      <img
                        src={URL.createObjectURL(image)}
                        alt="preview"
                        className="max-w-xs max-h-64 mt-2"
                      />
                    </div>
                  )}
                    </div>
                  <span className="text-lg font-semibold">Message</span>
                    <MessageEditor message={message} setMessage={setMessage} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" type="button" onClick={handleClose}>
                      Cancel
                    </Button>
                     <Button  disabled={isSubmitting} type='submit'>{isSubmitting ? "Adding Devotion..." : "Add Devotion"}</Button>
                  </div>
                </div>
              </div>
              </form>
             )
                  }
          </section>
          
        </div>
      </div>
    </div>
  );
};