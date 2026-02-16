export async function fetchWithTimeout(url:string, timeout = 30000, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(url, {
    ...options,
    signal: controller.signal,
  });
  clearTimeout(id);
  return response;
}

export function startHealthPolling(url: string, interval = 30000) {
  return setInterval(() => {
    fetchWithTimeout(url, 30000)
      .then(r => r.json())
     // .then(data => console.log("Health:", data))
      //.catch(err => console.error("Health failed:", err));
  }, interval);
}
