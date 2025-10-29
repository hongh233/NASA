export async function computeRoute(
  start: [number, number],
  end: [number, number],
  tif_path?: string,
  use_corridor = false
) {
  const res = await fetch("/api/route_navigation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ start, end, tif_path, use_corridor }),
  });

  if (!res.ok) {
    throw new Error(`Route computation failed: ${res.statusText}`);
  }

  return res.json(); // GeoJSON FeatureCollection
}
