"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconClock, IconPlus } from "@tabler/icons-react";
import styles from "./devotions.module.css";
import { fetchAuth } from "@/context/fetchAuth";
import { useAuth } from "@/context/AuthContext";
import { CalendarEvent } from "@/app/types/types";
import { AiOutlineEnvironment } from "react-icons/ai";
import { formatDate, formatDateToDay, formatDateToHours, toLocalDatetimeInput } from "@/lib/formatData";

export function Posts({ title, image, description, start, end, location }: CalendarEvent) {
  const startDate = toLocalDatetimeInput(start)
  const endDate = toLocalDatetimeInput(end)
  return (
    <div className="group w-full overflow-hidden rounded-xl border border-border bg-background shadow-sm hover:shadow-lg transition justify-between flex flex-col relative">
      {/* Image */}
      <div className="h-48 w-full relative overflow-hidden">
        <div className="absolute z-100 bg-background dark:bg-yellow-200 w-14 h-16 rounded-md right-2 top-2">
          <span className="text-foreground dark:text-background flex flex-col text-xl text-center capitalize font-bold"> {formatDateToDay(startDate)} </span>
        </div>
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
        />
      </div>

     {/* Content */}
<div className="p-5 flex flex-col gap-3 flex-1">

  {/* Title (normal flow now) */}
  <h3 className="text-lg font-bold leading-tight line-clamp-2">
    {title}
  </h3>

  {/* Date + Location row */}
  <div className="flex flex-col gap-1 text-sm text-muted-foreground font-medium">
    <div className="flex items-center gap-2">
      <IconClock size={18} />
      {formatDateToHours(startDate)} - {formatDateToHours(endDate)}
    </div>

    <div className="flex items-center gap-2">
      <AiOutlineEnvironment size={18} />
      {location}
    </div>
  </div>

  {/* Description */}
  <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
    {description}
  </p>

</div>
      <div className="flex flex-row justify-end px-2 mb-2">
        <button className="mt-auto self-end px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition cursor-pointer">
          Read More
        </button>
      </div>
    </div>
  );
}

const PostsSection = () => {
  const [addingPost, setAddingPost] = useState(false);

  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImage, setFormImage] = useState<File | null>(null);
  const [startInput, setStartInput] = useState("");
  const [endInput, setEndInput] = useState("");
  const [location, setLocation] = useState("");

  const [previewImage, setPreviewImage] = useState("");
  const [closing, setClosing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [events, setEvents] = useState<CalendarEvent[]>([]);
   const [loading, setLoading] = useState(false);
  //fetch events from API on mount
    useEffect(() => {
    fetchEvents();
  }, []);

    const { access_token, id } = useAuth();
  
  const fetchEvents = async () => {
    if (!access_token) return;
  
    setLoading(true);
  
    try {
      const res = await fetchAuth(
        "/api/postgre/events",
        access_token,
        { method: "GET" }
      );
  
      const json = await res.json();
  
          const formatted: CalendarEvent[] = json.data
        .map((e: any) => ({
          id: String(e.id),
          creatorId: e.creatorId ? String(e.creatorId) : null,
          creatorName: e.creator?.name || "Unknown",
          title: e.title || "Untitled Event",
          description: e.description || "",
          image: e.image || "/images/defaultPost.jpg",
          location: e.location || "TBD",
          allowRegistration: Boolean(e.allowRegistration),
          start: e.start ? new Date(e.start) : new Date(),
          end: e.end ? new Date(e.end) : new Date(),
        }))
        // 🔹 Only allow registration
        .filter((e: CalendarEvent) => e.allowRegistration === true);

      setEvents(formatted);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleAddPost = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!formTitle.trim() || !formDescription.trim()) {
    alert("Please fill in all fields");
    return;
  }

  let imageUrl = "/images/defaultPost.jpg"; // fallback
  setIsSubmitting(true);

  if (formImage) {
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = "unsigned_image";

      const formData = new FormData();
      formData.append("file", formImage);
      formData.append("upload_preset", uploadPreset);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );

      const data = await res.json();
      imageUrl = data.secure_url;
    } catch (err) {
      console.error("Cloudinary upload failed:", err);
      alert("Failed to upload image. Using default.");
    }
  }

  const newEvent: CalendarEvent = {
    id: String(Date.now()), // temp unique id
    creatorId: null,
    creatorName: "You",
    title: formTitle,
    allowRegistration: true,
    description: formDescription,
    image: imageUrl,
    location: location,
    start: new Date(startInput),
    end: new Date(endInput),
  };

  // Push the new post into events array
  setEvents((prev) => [newEvent, ...prev]);

  // Reset form
  setFormTitle("");
  setFormDescription("");
  setFormImage(null);
  setPreviewImage("");
  setAddingPost(false);
  setIsSubmitting(false);
};

  const handleClose = () => {
    setClosing(true);

    setFormTitle("");
    setFormDescription("");
    setFormImage(null);
    setPreviewImage("");
    setTimeout(() => {
      setClosing(false);
      setAddingPost(false);
    }, 300);
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="fixed bottom-10 z-90 right-10">
        <Button onClick={() => setAddingPost(true)}>
          <IconPlus /> Add Events
        </Button>
      </div>

      <div className="@container/main flex flex-1 flex-col gap-2">
        <span className="text-center text-xl font-bold mt-3">Events</span>

        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-2">
          <section className="grid gap-4 sm:gap-6 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
           {events.map((post) => (
              <Posts
                key={post.id}
                location={post.location}
                allowRegistration={post.allowRegistration}
                creatorName={post.creatorName}
                id={post.id}
                creatorId={post.creatorId}
                title={post.title}
                image={post.image}
                description={post.description}
                start={post.start}
                end={post.end}
              />
            ))}
          </section>
        </div>
      </div>

      {/* Add Post Modal */}
      {addingPost && (
        <div
          className={`fixed inset-0 bg-black/40 flex justify-center items-center z-100 p-4 overflow-y-auto ${closing ? styles.backdropOut : styles.backdropIn}`}
        >
          <div
            className={`bg-background rounded-lg p-6 w-full max-w-md shadow-lg ${closing ? styles.modalOut : styles.modalIn}`}
          >
            <h2 className="text-lg font-semibold mb-4">Add New Post</h2>
            <form onSubmit={handleAddPost} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-semibold">Title</label>
                <Input
                  type="text"
                  placeholder="Post title..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold">Description</label>
                <textarea
                  placeholder="Post description..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  required
                  className="border rounded px-2 py-2 bg-background text-foreground resize-none"
                  rows={4}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold">Location</label>
                <Input
                  type="text"
                  placeholder="Set Event Location..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={handleImageChange}
                  className="border rounded px-2 py-1 cursor-pointer"
                />
                 {previewImage && (
                  <img
                    src={previewImage}
                    alt="preview"
                    className="mt-2 max-h-48 rounded"
                  />
                )}
                <label className="text-sm">Start</label>
                <input
                  type="datetime-local"
                  className="border p-2 w-full mb-3 accent-blue-500"
                  value={startInput}
                  required
                  onChange={(e) => setStartInput(e.target.value)}
                />
                <label className="text-sm">End</label>
                <input
                  type="datetime-local"
                  className="border p-2 w-full mb-4 text-foreground accent-green-500"
                  value={endInput}
                  required
                  onChange={(e) => setEndInput(e.target.value)}
                />
               
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Post"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostsSection;
