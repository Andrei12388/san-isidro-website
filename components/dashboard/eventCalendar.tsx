"use client";

import { useState, useEffect, useRef } from "react";
import { Calendar, dateFnsLocalizer, Event, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Modal from "react-modal";
import { useAuth } from "@/context/AuthContext";
import { fetchAuth } from "@/context/fetchAuth";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

type CalendarEvent = Event & { id: string };

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
  const { access_token } = useAuth();

  //event inputs
  const [description, setDescription] = useState("");
  const [startInput, setStartInput] = useState("");
  const [endInput, setEndInput] = useState("");

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
      title: e.title || "Untitled Event",
      description: e.description || "",
      image: e.image || "",
      start: e.start ? new Date(e.start) : new Date(),
      end: e.end ? new Date(e.end) : new Date(),
    }));

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
  setSelectedEvent(event);

  setNewTitle(event.title ?? "");
  setDescription(event.description ?? "");

  setStartInput(new Date(event.start).toISOString().slice(0, 16));
  setEndInput(new Date(event.end).toISOString().slice(0, 16));

  setModalOpen(true);
};

const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
  setSlotData({ start, end });
  setSelectedEvent(null);

  setNewTitle("");
  setDescription("");

  setStartInput(start.toISOString().slice(0, 16));
  setEndInput(end.toISOString().slice(0, 16));

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
        onRequestClose={() => setModalOpen(false)}
        contentLabel="Event Modal"
        className="bg-background text-foreground p-6 rounded shadow-lg max-w-md mx-auto mt-20 z-900"
        overlayClassName="fixed inset-0 bg-black/50 flex justify-center items-start z-800"
      >
        <h2 className="text-xl font-bold mb-4">
          {selectedEvent ? "Edit Event" : "New Event"}
        </h2>
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
        className="border p-2 w-full mb-3"
        value={startInput}
        onChange={(e) => setStartInput(e.target.value)}
      />

      <label className="text-sm">End</label>
      <input
        type="datetime-local"
        className="border p-2 w-full mb-4"
        value={endInput}
        onChange={(e) => setEndInput(e.target.value)}
      />
        <div className="flex justify-end gap-2">
          {selectedEvent && (
            <button
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={handleDelete}
            >
              Delete
            </button>
          )}
          <button
            className="bg-background px-4 py-2 rounded"
            onClick={() => setModalOpen(false)}
          >
            Cancel
          </button>
          <button
            className="bg-background text-foreground px-4 py-2 rounded"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </Modal>
    </div>
  );
}
