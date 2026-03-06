  export const formatDate = (date:string) =>
  new Date(date).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

export const formatDateToHours = (date:string) =>
    new Date(date).toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  export const formatDateToDay = (date:string) =>
  new Date(date).toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    hour12: true,
  });

  export const formatDateToDayWithYear = (date:string) =>
  new Date(date).toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour12: true,
  });

  export const toLocalDatetimeInput = (date: Date) => {
  const d = new Date(date);
  const offset = d.getTimezoneOffset(); // in minutes
  const localDate = new Date(d.getTime() - offset * 60000);
  return localDate.toISOString().slice(0, 16);
};