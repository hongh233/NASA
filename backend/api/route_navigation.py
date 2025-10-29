from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Tuple, Dict, Any
import numpy as np
import geopandas as gpd
from shapely.geometry import Point
from scipy.spatial import cKDTree

from backend.routing import pathfinder

router = APIRouter(tags=["route_navigation"])

class RouteRequest(BaseModel):
    start: Tuple[float, float]  # (lon, lat)
    end: Tuple[float, float]    # (lon, lat)
    geojson: Dict[str, Any]
    use_corridor: bool = False


@router.post("/route_navigation")
def compute_route(request: RouteRequest):
    print("=== 🚀 Route Request Received ===")
    print(f"Start: {request.start} End: {request.end}")
    print(f"GeoJSON features: {len(request.geojson.get('features', []))}")

    try:
        gdf = gpd.GeoDataFrame.from_features(request.geojson["features"])
        if gdf.empty:
            raise HTTPException(status_code=400, detail="Empty GeoJSON")

        geom_type = gdf.geometry.iloc[0].geom_type
        if geom_type == "Point":
            print("🧊 Detected Point geometries — building KDTree")
            ice_points = np.array([[p.x, p.y] for p in gdf.geometry])
        else:
            print("📦 Non-point geometries detected — using centroids")
            ice_points = np.array([[p.centroid.x, p.centroid.y] for p in gdf.geometry])

        tree = cKDTree(ice_points)

        bounds = gdf.total_bounds  # [minx, miny, maxx, maxy]
        W, H = 200, 200 
        xs = np.linspace(bounds[0], bounds[2], W)
        ys = np.linspace(bounds[1], bounds[3], H)
        navmap = np.zeros((H, W), dtype=np.uint8)


        for i, y in enumerate(ys):
            for j, x in enumerate(xs):
                dist, _ = tree.query([x, y], k=1)
                if dist < 0.02: 
                    navmap[i, j] = 1

        def latlon_to_px(lon, lat):
            j = int((lon - bounds[0]) / (bounds[2] - bounds[0]) * (W - 1))
            i = int((lat - bounds[1]) / (bounds[3] - bounds[1]) * (H - 1))
            i = np.clip(i, 0, H - 1)
            j = np.clip(j, 0, W - 1)
            return i, j

        start_px = latlon_to_px(*request.start)
        goal_px = latlon_to_px(*request.end)

        path_pixels = pathfinder.astar_pathfinding(navmap, start_px, goal_px)

        if not path_pixels or len(path_pixels) < 2:
            print("⚠️ No valid A* path found, using straight fallback")
            path_coords = [
                (request.start[0] + t * (request.end[0] - request.start[0]),
                 request.start[1] + t * (request.end[1] - request.start[1]))
                for t in np.linspace(0, 1, 50)
            ]
        else:
            path_coords = [(xs[j], ys[i]) for (i, j) in path_pixels]

        geojson_route = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "LineString",
                        "coordinates": path_coords
                    },
                    "properties": {
                        "method": "astar" if len(path_pixels) > 2 else "fallback"
                    }
                }
            ]
        }

        print(f"Route computed successfully ({len(path_coords)} points)")
        return geojson_route

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Route computation failed: {e}")
