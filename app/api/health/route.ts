let cachedHealth: any = null;
let lastCheck = 0;

export async function GET() {
  const now = Date.now();

  if (now - lastCheck > 30000) {
    try {
      const res = await fetch(
        "https://isidro-webapi.onrender.com/health"
      );

      cachedHealth = await res.json();
      lastCheck = now;
      console.log("Health Stats:", cachedHealth)

    } catch {
      cachedHealth = { status: "down" };
    }
  }

  return Response.json(cachedHealth);
}
