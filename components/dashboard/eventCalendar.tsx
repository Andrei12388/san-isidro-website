"use client";

import { useState, useEffect, useRef } from "react";
import { Calendar, dateFnsLocalizer, Event, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Modal from "react-modal";
import { useAuth } from "@/context/AuthContext";
import { fetchAuth } from "@/context/fetchAuth";
import styles from "@/components/dashboard/sections/devotions.module.css";
import { formatDate, toLocalDatetimeInput } from "@/lib/formatData";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

type CalendarEvent = Event & { id: string | null, creatorId: string | null, location: string | null, creatorName: string | null };

export default function Scheduler() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>("month");
  const [slotData, setSlotData] = useState<{ start: Date; end: Date } | null>(
    null,
  );
  const [newTitle, setNewTitle] = useState("");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { access_token, id } = useAuth();

  const [closing, setClosing] = useState(false);

  //event inputs
  const [description, setDescription] = useState("");
  const [startInput, setStartInput] = useState("");
  const [endInput, setEndInput] = useState("");

  const handleClose = () => {
    setClosing(true);
    setModalOpen(true)
    setTimeout(() => {
      setClosing(false);
      setModalOpen(false)
    }, 300);
  };

  //fetch events from API on mount
  useEffect(() => {
  fetchEvents();
}, []);

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

    const formatted = json.data.map((e: any) => ({
      id: String(e.id),
      creatorId: String(e.creatorId),
      creatorName: e.creator?.name || "Unknown",
      title: e.title || "Untitled Event",
      location: e.location || "TBD",
      description: e.description || "",
      image: e.image || "",
      start: e.start ? new Date(e.start) : new Date(),
      end: e.end ? new Date(e.end) : new Date(),
    }));

    console.log("formatted data even:", formatted);

    setEvents(formatted);
  } finally {
    setLoading(false);
  }
};

  // Set modal app element once
  useEffect(() => {
    setMounted(true);
    Modal.setAppElement(document.body); // safest option for calendar interaction
  }, []);

const handleSelectEvent = (event: CalendarEvent & any) => {
  setSelectedEvent({
    ...event,
    creatorId: event.creatorId?.toString() ?? null, // ensure string type
  });

  setNewTitle(event.title ?? "");
  setDescription(event.description ?? "");

 setStartInput(toLocalDatetimeInput(event.start));
setEndInput(toLocalDatetimeInput(event.end));

  setModalOpen(true);
};

const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
  setSlotData({ start, end });
  setSelectedEvent(null);

  setNewTitle("");
  setDescription("");

 setStartInput(toLocalDatetimeInput(start));
setEndInput(toLocalDatetimeInput(end));

  setModalOpen(true);
};

const handleSave = async () => {
  try {
    if (!newTitle.trim() || !access_token) return;

    setLoading(true);
      const payload = {
      title: newTitle,
      description,
      start: new Date(startInput),
      end: new Date(endInput),
    };

    // UPDATE
    if (selectedEvent) {
      await fetchAuth(
        `/api/postgre/events/${selectedEvent.id}`,
        access_token,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );
    }

    // CREATE
    else if (slotData) {
      await fetchAuth(
        "/api/postgre/events",
        access_token,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
    }

    await fetchEvents();
    setModalOpen(false);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

 const handleDelete = async () => {
  if (!selectedEvent || !access_token) return;

  setLoading(true);

  try {
    await fetchAuth(
      `/api/postgre/events/${selectedEvent.id}`,
      access_token,
      { method: "DELETE" }
    );

    await fetchEvents();
    setModalOpen(false);
  } finally {
    setLoading(false);
  }
};

  const isOwner = selectedEvent
  ? String(selectedEvent.creatorId) === String(id)
  : true;
  console.log("owner and event id", String(id), selectedEvent?.creatorId)

  // Render only after client mount to avoid SSR issues
  if (!mounted) return <div style={{ height: "700px", margin: "20px" }} />;

  return (
    <div
      style={{
        height: "700px",
        margin: "20px",
        border: "1px solid",
        borderRadius: "8px",
        padding: "10px",
      }}
    >
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        date={currentDate} // controlled date
        onNavigate={(date) => setCurrentDate(date)} // update date on prev/next/today
        view={currentView} // controlled view
        onView={(view) => setCurrentView(view)} // update view when switching
        defaultView="month"
        views={["month", "week", "day"]}
        popup
        style={{ height: "100%" }}
      />

    <Modal
  isOpen={modalOpen}
  onRequestClose={handleClose}
  contentLabel="Event Modal"
  className={`bg-background text-foreground p-6 rounded shadow-lg w-lg mx-auto mt-20 z-900 ${
    closing ? styles.backdropOut : styles.backdropIn
  }`}
  overlayClassName={`fixed inset-0 bg-black/50 flex justify-center items-start z-800 ${
    closing ? styles.backdropOut : styles.backdropIn
  }`}
>
  <div className="border-b">
  <h2 className="text-xl font-bold mb-4">
    {selectedEvent
      ? isOwner
        ? "Edit Event"
        : "Event Details"
      : "New Event"}
  </h2>
  </div>

  {isOwner ? (
    <>
      <input
        className="border p-2 w-full mb-3"
        placeholder="Event Title"
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
      />
      <textarea
        className="border p-2 w-full mb-3"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
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
    </>
  ) : (
    <>
   <p className="mb-2 opacity-60">Posted By: {selectedEvent?.creatorName}</p> 
    <p className="mb-2 font-bold opacity-60">{formatDate(startInput)}</p>
      <p className="mb-2 text-2xl"><strong>{newTitle}</strong></p>
      <p className="mb-2 opacity-75 py-2">{description}</p>
    </>
  )}

  <div className="flex justify-end gap-2 mt-4">
    {isOwner && selectedEvent && (
      <button
        className={`px-4 py-2 rounded text-white font-semibold transition 
                    ${loading ? "bg-red-300 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"}`}
        onClick={handleDelete}
        disabled={loading}
      >
        Delete
      </button>
    )}

    <button
      className={`px-4 py-2 rounded border border-gray-300 font-medium transition
                  ${loading ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-gray-800 hover:bg-gray-50"}`}
      onClick={handleClose}
      disabled={loading}
    >
      {isOwner && selectedEvent ? "Cancel" : "Close"}
    </button>

    {isOwner && (
        <button
          className={`px-4 py-2 rounded font-semibold transition
                      ${loading ? "bg-blue-200 text-blue-400 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`}
          onClick={handleSave}
          disabled={loading}
        >
          Save
        </button>
      )}
  </div>
</Modal>
    </div>
  );
}
