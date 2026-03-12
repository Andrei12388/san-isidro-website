"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconClock, IconEdit, IconPlus } from "@tabler/icons-react";
import styles from "./devotions.module.css";
import { fetchAuth } from "@/context/fetchAuth";
import Modal from "react-modal";
import { useAuth } from "@/context/AuthContext";
import { CalendarEvent } from "@/app/types/types";
import { AiOutlineEnvironment } from "react-icons/ai";
import { formatDate, formatDateToDay, formatDateToDayNoMonth, formatDateToHours, toLocalDatetimeInput } from "@/lib/formatData";
import ImageSelector from "@/lib/imageSelector";
import { ImageCropperProvider } from "@/context/ImageCropperContext";
import { useSidebar } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import HoverCard from "@/components/userCard/hoverCard";

type Attendee = {
  id: number
  eventId: number
  userId: number
  joinedAt: string
  status: string

  user: {
    id: number
    name: string

    personalInformation?: {
      profileImage?: string | null
    } | null
  }
}

export function Posts({id: eventId, title, image, description, start, end, location, onEdit }: CalendarEvent & { onEdit?: () => void }) {
  const startDate = toLocalDatetimeInput(start)
  const endDate = toLocalDatetimeInput(end)

  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [attendeeCount, setAttendeeCount] = useState(0);

  const router = useRouter();

  const sameDate = startDate === endDate;

   const { access_token, id: userId, profileImage, name } = useAuth();
    const [open, setOpen] = useState(false)
    const [mounted, setMounted] = useState(false);

   useEffect(() => {
  if (!access_token) return;

  const fetchJoinStatus = async () => {
    try {
      const res = await fetchAuth(
        `/api/postgre/events/${eventId}`,
        access_token,
        { method: "GET" }
      );

      const json = await res.json();

      if (!res.ok) return;

      const attendeeList = json.data.attendees || [];

      setAttendees(attendeeList);
      setAttendeeCount(attendeeList.length);

      const isJoined = attendeeList.some(
        (a: any) => String(a.userId) === String(userId)
      );

      setJoined(isJoined);
    } catch (err) {
      console.error("Join status fetch error:", err);
    }
  };

  fetchJoinStatus();
}, [open]);

//handle join event
       const handleJoin = async () => {
          if (!access_token || !eventId || !userId) return;

          setJoining(true);

          try {
            const res = await fetchAuth(
              `/api/postgre/events/${eventId}/join`,
              access_token,
              { method: joined ? "DELETE" : "POST" }
            );

            if (!res.ok) throw new Error("Failed to join/leave event");

            const data = await res.json();

            if (joined) {
              // User is leaving
              setJoined(false);
              setAttendeeCount((prev) => prev - 1);

              setAttendees((prev) =>
                prev.filter((a) => a.userId !== userId)
              );
            } else {
              // User just joined, use API response for full attendee
              const newAttendee: Attendee = {
                id: data.data.id,
                eventId: data.data.eventId,
                userId: data.data.userId,
                joinedAt: data.data.joinedAt,
                status: data.data.status,
                user: {
                  id: userId,
                  name: name || "", // Optional, or fetch from session if available
                  personalInformation: {
                    profileImage: profileImage || null, // can set real profile image if you have it
                  },
                },
              };

              setJoined(true);
              setAttendeeCount((prev) => prev + 1);

              setAttendees((prev) => [...prev, newAttendee]);
            }
          } catch (err) {
            console.error("Join error:", err);
          } finally {
            setJoining(false);
          }
        };

      useEffect(() => {
        setMounted(true);
        Modal.setAppElement(document.body); // safest option for calendar interaction
      }, []);

    const [closing, setClosing] = useState(false);

     const handleClose = () => {
    setClosing(true);
    setOpen(true)
    setTimeout(() => {
      setClosing(false);
      setOpen(false)
    }, 300);
  };

  // Render only after client mount to avoid SSR issues
  if (!mounted) return <div style={{ height: "700px", margin: "20px" }} />;
 
  const { authActiveItem } = useAuth();
  
  return (
     <>
      <div className="group w-full overflow-hidden rounded-xl border border-border bg-background dark:bg-muted shadow-sm hover:shadow-lg transition justify-between flex flex-col relative">

        {/* Image */}
        <div className="h-48 w-full relative overflow-hidden">
          <div className="absolute z-10 bg-background dark:bg-yellow-200 w-15 h-16 rounded-md right-2 top-2">
            <span className="text-foreground dark:text-background flex flex-col text-xl text-center capitalize font-bold">
             {sameDate
              ? formatDateToDay(startDate)
              : `${formatDateToDay(startDate)}-${formatDateToDayNoMonth(endDate)}`
            }
            </span>
          </div>

          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
          />
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-3 flex-1">

          <h3 className="text-lg font-bold leading-tight line-clamp-1">
            {title}
          </h3>

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

          <p className="text-sm text-muted-foreground line-clamp-1 flex-1">
            {description}
          </p>

        </div>

                {/* Buttons */}
                <div className="flex flex-row justify-between px-4 mb-2 gap-2">

                  <div className="flex items-center gap-2">

                    <div className="flex -space-x-2">
                      {attendees.slice(0, 3).map((a) => (
                        <Avatar key={a.userId} className="h-8 w-8 border">
                          <HoverCard
                            userId={a.user?.id || 0}
                            name={a.user?.name || "Unknown"}
                            title={"Member"}
                            image={
                              a.user?.personalInformation?.profileImage ||
                              "/images/userIcon.png"
                            }
                          >
                            <AvatarImage src={a.user?.personalInformation?.profileImage || ""} />
                          </HoverCard>
                          
                          <AvatarFallback>
                            {a.user?.name?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>

                    <span className="text-sm text-muted-foreground">
                    {attendeeCount >= 4 && `+ ${attendeeCount}`} 
                    </span>

                  </div>
                      <div className="flex flex-row gap-2">
                  {authActiveItem === "Events" && (
                    <button
                      onClick={onEdit}
                      className="px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium cursor-pointer"
                    >
                      <IconEdit size={20} />
                    </button>
                  )}

                  <button
                    onClick={() => setOpen(true)}
                    className="px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium cursor-pointer"
                  >
                    Read More
                  </button>
                    </div>
                </div>
      </div>

      {/* Modal */}
            
          <Modal
            isOpen={open}
            onRequestClose={handleClose}
            contentLabel="Event Details"
            className={`bg-muted text-foreground p-0 rounded-md shadow-xl z-100 
                      max-w-lg w-full max-h-[90vh] mx-auto overflow-y-auto ${
                        closing ? styles.backdropOut : styles.backdropIn
                      }`}
           overlayClassName={`fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 ${
    closing ? styles.backdropOut : styles.backdropIn
  }`}
          >
            {/* Image */}
            <div className="w-full relative overflow-hidden">
              <div className="absolute z-10 bg-background dark:bg-yellow-200 w-15 h-16 rounded-md right-2 top-2">
                <span className="text-foreground dark:text-background flex flex-col text-xl text-center capitalize font-bold">
                   {sameDate
              ? formatDateToDay(startDate)
              : `${formatDateToDay(startDate)}-${formatDateToDayNoMonth(endDate)}`
            }
                </span>
              </div>

              <img
                src={image}
                alt={title}
                className="h-full w-full object-background"
              />
            </div>

            {/* Body */}
            <div className="px-6 py-4">
            <div className="py-2">
              <h2 className="text-xl font-bold">{title}</h2>
            </div>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-4">

                <div className="flex items-center gap-2">
                  <IconClock size={18} />
                  {formatDateToHours(startDate)} - {formatDateToHours(endDate)}
                </div>

                <div className="flex items-center gap-2">
                  <AiOutlineEnvironment size={18} />
                  {location}
                </div>

              </div>

              <p className="text-sm leading-relaxed">
                {description}
              </p>

            </div>

            {/* Footer */}
            <div className="flex justify-between gap-2 px-6 pb-6">

               <div className="flex items-center gap-2">

                    <div className="flex -space-x-2">
                      {attendees.slice(0, 5).map((a) => (
                        <Avatar key={a.userId} className="h-8 w-8 border">
                         <HoverCard
                            userId={a.user?.id || 0}
                            name={a.user?.name || "Unknown"}
                            title={"Member"}
                            image={
                              a.user?.personalInformation?.profileImage ||
                              "/images/userIcon.png"
                            }
                          >
                            <AvatarImage src={a.user?.personalInformation?.profileImage || ""} />
                          </HoverCard>
                          <AvatarFallback>
                            {a.user?.name?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>

                    <span className="text-sm text-muted-foreground">
                      {attendeeCount} {attendeeCount === 1 ? "person" : "people"} joined
                    </span>

                  </div>
                  <div className="flex flex-row gap-2">
              {/*Join Button */}
              <button
              onClick={handleJoin}
              disabled={joining}
              className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer
                ${joined 
                  ? "bg-red-500 text-white" 
                  : "bg-green-600 text-white"
                }`}
            >
              {joining
                ? "Processing..."
                : joined
                ? "Leave Event"
                : "Join Event"}
            </button>

                <button
                  className="px-4 py-2 rounded border border-gray-300 font-medium transition bg-white text-gray-800 hover:bg-gray-50"
                  onClick={handleClose}
                >
                  Close
                </button>

            </div>
            </div>

          </Modal>
        
    </>
  );
}

const PostsSection = () => {
  const [addingPost, setAddingPost] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImage, setFormImage] = useState<File | null>(null);
  const [startInput, setStartInput] = useState("");
  const [endInput, setEndInput] = useState("");
  const [location, setLocation] = useState("");

  const [previewImage, setPreviewImage] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState(""); // For existing image
  const [closing, setClosing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationAddress, setLocationAddress] = useState("");
  const [locationLatitude, setLocationLatitude] = useState<string>("");
  const [locationLongitude, setLocationLongitude] = useState<string>("");
  const [locationRadius, setLocationRadius] = useState<string>("100");

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

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEventId(event.id);
    setFormTitle(event.title);
    setFormDescription(event.description || "");
    setLocationAddress(event.location || "");
    setLocationLatitude(event.locationLatitude?.toString() || "");
    setLocationLongitude(event.locationLongitude?.toString() || "");
    setLocationRadius(event.locationRadius?.toString() || "100");
    setCurrentImageUrl(event.image);
    setPreviewImage(event.image); // Show existing image as preview
    setAddingPost(true);
    setStartInput(toLocalDatetimeInput(event.start));
    setEndInput(toLocalDatetimeInput(event.end));
  };

  const handleDeleteEvent = async () => {
  if (!editingEventId) return;

  const confirmDelete = confirm("Are you sure you want to delete this event?");
  if (!confirmDelete) return;

  try {
    const res = await fetchAuth(
      `/api/postgre/events/${editingEventId}`,
      access_token || "",
      { method: "DELETE" }
    );

    if (!res.ok) {
      throw new Error("Failed to delete event");
    }

    // remove from UI
    setEvents((prev) => prev.filter((e) => e.id !== editingEventId));

    alert("Event deleted successfully");

    handleClose();
  } catch (error) {
    console.error("Delete error:", error);
    alert("Failed to delete event");
  }
};

  const handleAddPost = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!formTitle.trim() || !formDescription.trim()) {
    alert("Please fill in all fields");
    return;
  }

  let imageUrl = currentImageUrl || "/images/defaultPost.jpg"; // Use existing image if editing
  setIsSubmitting(true);

  // Only upload new image if one was selected
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
      alert("Failed to upload image. Using existing/default.");
    }
  }

  try {
    const eventData = {
      title: formTitle,
      description: formDescription,
      image: imageUrl,
      location: locationAddress || "TBD",
      locationLatitude: locationLatitude || null,
      locationLongitude: locationLongitude || null,
      locationRadius: locationRadius || "100",
      allowRegistration: true,
      start: new Date(startInput).toISOString(),
      end: new Date(endInput).toISOString(),
    };

    if (editingEventId) {
      // Update existing event
      const response = await fetchAuth(
        `/api/postgre/events/${editingEventId}`,
        access_token || '',
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update event");
      }

      const result = await response.json();
      
      // Update the event in the UI
      setEvents((prev) =>
        prev.map((event) =>
          event.id === editingEventId
            ? {
                ...event,
                title: result.data.title,
                description: result.data.description,
                image: result.data.image,
                location: result.data.location,
                locationLatitude: result.data.locationLatitude,
                locationLongitude: result.data.locationLongitude,
                locationRadius: result.data.locationRadius,
              }
            : event
        )
      );

      alert("Event updated successfully!");
    } else {
      // Create new event
      const response = await fetchAuth(
        "/api/postgre/events",
        access_token || '',
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create event");
      }

      const result = await response.json();
      
      // Add the newly created event to the UI
      const newEvent: CalendarEvent = {
        id: String(result.data.id),
        creatorId: String(result.data.creatorId),
        creatorName: "You",
        title: result.data.title,
        allowRegistration: result.data.allowRegistration,
        description: result.data.description,
        image: result.data.image,
        location: result.data.location,
        locationLatitude: result.data.locationLatitude,
        locationLongitude: result.data.locationLongitude,
        locationRadius: result.data.locationRadius,
        start: new Date(result.data.start),
        end: new Date(result.data.end),
      };

      setEvents((prev) => [newEvent, ...prev]);
      alert("Event created successfully!");
    }

    // Reset form
    setFormTitle("");
    setFormDescription("");
    setFormImage(null);
    setPreviewImage("");
    setCurrentImageUrl("");
    setLocationAddress("");
    setLocationLatitude("");
    setLocationLongitude("");
    setLocationRadius("100");
    setEditingEventId(null);
    setAddingPost(false);
  } catch (error) {
    console.error("Error saving event:", error);
    alert("Failed to save event. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};

  const handleClose = () => {
    setClosing(true);

    setFormTitle("");
    setFormDescription("");
    setFormImage(null);
    setPreviewImage("");
    setCurrentImageUrl("");
    setLocationAddress("");
    setLocationLatitude("");
    setLocationLongitude("");
    setLocationRadius("100");
    setEditingEventId(null);
    setTimeout(() => {
      setClosing(false);
      setAddingPost(false);
    }, 300);
  };

  const { activeItem } = useSidebar();
const { setSession } = useAuth();

useEffect(() => {
  setSession({ authActiveItem: activeItem });
}, []);

  return (
    <>
    <ImageCropperProvider>
      
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
                locationLatitude={post.locationLatitude}
                locationLongitude={post.locationLongitude}
                locationRadius={post.locationRadius}
                onEdit={() => handleEditEvent(post)}
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
            className={`bg-background rounded-lg p-6 w-full max-w-md shadow-lg h-auto max-h-[95vh] overflow-x-auto ${closing ? styles.modalOut : styles.modalIn}`}
          >
            <h2 className="text-lg font-semibold mb-4">{editingEventId ? "Edit Event" : "Add New Event"}</h2>
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
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold">Image</label>
                  <ImageSelector setImage={setFormImage} aspect={16/9} />
                {editingEventId && !formImage && (
                  <p className="text-xs text-muted-foreground mt-1">Leave empty to keep current image</p>
                )}
                {previewImage && (
                  <img
                    src={previewImage}
                    alt="preview"
                    className="mt-2 max-h-48 rounded"
                  />
                )}
                {formImage && (
                          <div className="mt-3 flex flex-row justify-center">
                            <img
                              src={URL.createObjectURL(formImage)}
                              alt="preview"
                              className="max-w-xs max-h-64 mt-2"
                            />
                          </div>
                        )}
              </div>

              {/* Location Section */}
              <div className="flex flex-col gap-3 border-t pt-4">
                <label className="font-semibold">Event Location (Optional)</label>
                
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-muted-foreground">Address</label>
                  <Input
                    type="text"
                    placeholder="e.g., Cubao, Ali Mall, JCSGO"
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            setLocationLatitude(position.coords.latitude.toFixed(6));
                            setLocationLongitude(position.coords.longitude.toFixed(6));
                          },
                          (error) => {
                            alert("Unable to get current location: " + error.message);
                          }
                        );
                      } else {
                        alert("Geolocation is not supported by your browser");
                      }
                    }}
                  >
                    📍 Use Current Location
                  </Button>

                  {locationLatitude && locationLongitude && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const url = `https://www.google.com/maps?q=${locationLatitude},${locationLongitude}`;
                        window.open(url, "_blank");
                      }}
                    >
                      🗺️ View on Map
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-muted-foreground">Latitude</label>
                    <Input
                      type="number"
                      step="0.000001"
                      placeholder="14.5995"
                      value={locationLatitude}
                      onChange={(e) => setLocationLatitude(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-muted-foreground">Longitude</label>
                    <Input
                      type="number"
                      step="0.000001"
                      placeholder="120.9842"
                      value={locationLongitude}
                      onChange={(e) => setLocationLongitude(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm text-muted-foreground">Verification Radius (meters)</label>
                  <Input
                    type="number"
                    step="1"
                    placeholder="100"
                    value={locationRadius}
                    onChange={(e) => setLocationRadius(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Users must be within this distance to check-in</p>
                </div>
                 <label className="text-sm">Start</label>
                  <input
                    type="datetime-local"
                    className="border p-2 w-full mb-3 accent-blue-500"
                    value={startInput}
                    onChange={(e) => setStartInput(e.target.value)}
                  />
                  <label className="text-sm">End</label>
                  <input
                    type="datetime-local"
                    className="border p-2 w-full mb-4 text-foreground accent-green-500"
                    value={endInput}
                    onChange={(e) => setEndInput(e.target.value)}
                  />
              </div>

              <div className="flex gap-2 justify-end">
                 {editingEventId && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDeleteEvent}
                    disabled={isSubmitting}
                  >
                    Delete Event
                  </Button>
                )}
                <Button
                  variant="outline"
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (editingEventId ? "Updating..." : "Adding...") : (editingEventId ? "Update Event" : "Add Post")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </ImageCropperProvider>
    </>
  );
};

export default PostsSection;
