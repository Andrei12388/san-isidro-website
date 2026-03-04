// Don't extend DOM Event, just define your own interface
export interface CalendarEvent {
  id: string;                // unique id
  creatorId: string | null;  // may be null
  creatorName: string;       // default "Unknown"
  title: string;             // default "Untitled Event"
  description: string;       // default ""
  image: string;             // default "" or placeholder
  location: string | null;          // default "TBD"
  allowRegistration: boolean;
  start: Date;
  end: Date;
}