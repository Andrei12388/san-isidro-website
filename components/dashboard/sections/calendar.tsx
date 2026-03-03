import Scheduler from "../eventCalendar";

export default function CalendarSection() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <Scheduler />
      </div>
    </div>
  );
}
