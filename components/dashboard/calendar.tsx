"use client";

import { useState, useEffect, useRef } from "react";
import { Calendar, dateFnsLocalizer, Event, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Modal from "react-modal";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

type CalendarEvent = Event & { id: string };

export default function Scheduler() {
  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: "1", title: "Church Meeting", start: new Date(2026, 2, 3, 10, 0), end: new Date(2026, 2, 3, 11, 0) },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>("month");
  const [slotData, setSlotData] = useState<{ start: Date; end: Date } | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [mounted, setMounted] = useState(false);

  // Set modal app element once
  useEffect(() => {
    setMounted(true);
    Modal.setAppElement(document.body); // safest option for calendar interaction
  }, []);

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setNewTitle((event.title as string) ?? "");  // show event title for editing
    setModalOpen(true);
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSlotData({ start, end });
    setNewTitle(""); // empty title for new events
    setSelectedEvent(null);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (selectedEvent) {
      // update existing event
      setEvents(events.map(ev => ev.id === selectedEvent.id ? { ...ev, title: newTitle } : ev));
    } else if (slotData) {
      // create new event
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        title: newTitle || "Untitled Event",
        start: slotData.start,
        end: slotData.end,
      };
      setEvents([...events, newEvent]);
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (selectedEvent) {
      setEvents(events.filter(ev => ev.id !== selectedEvent.id));
      setModalOpen(false);
    }
  };

  // Render only after client mount to avoid SSR issues
  if (!mounted) return <div style={{ height: "700px", margin: "20px" }} />;

  return (
    <div style={{ height: "700px", margin: "20px", border: "1px solid", borderRadius: "8px", padding: "10px" }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        date={currentDate} // controlled date
        onNavigate={date => setCurrentDate(date)} // update date on prev/next/today
        view={currentView} // controlled view
        onView={view => setCurrentView(view)} // update view when switching
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
        <h2 className="text-xl font-bold mb-4">{selectedEvent ? "Edit Event" : "New Event"}</h2>
        <input
          className="border p-2 w-full mb-4"
          placeholder="Event Title"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          {selectedEvent && (
            <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={handleDelete}>
              Delete
            </button>
          )}
          <button className="bg-background px-4 py-2 rounded" onClick={() => setModalOpen(false)}>
            Cancel
          </button>
          <button className="bg-background text-foreground px-4 py-2 rounded" onClick={handleSave}>
            Save
          </button>
        </div>
      </Modal>
    </div>
  );
}