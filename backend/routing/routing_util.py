import rasterio
from rasterio.transform import xy
from pyproj import Transformer
import numpy as np
from shapely.geometry import LineString, MultiLineString, mapping
from PIL import Image
import json


def read_rgb_from_tiff(path):
    """Read a TIFF and return (H, W, 3) uint8 RGB image."""
    with rasterio.open(path) as src:
        if src.count >= 3:
            r, g, b = src.read(1), src.read(2), src.read(3)
            def to_uint8(x):
                if np.issubdtype(x.dtype, np.floating):
                    x = np.nan_to_num(x)
                    x -= x.min()
                    maxv = x.max()
                    return (x / maxv * 255).astype(np.uint8) if maxv != 0 else np.zeros_like(x, dtype=np.uint8)
                else:
                    maxv = x.max()
                    if maxv > 255:
                        x = x.astype(np.float32) / maxv * 255
                    return x.astype(np.uint8)
            return np.stack([to_uint8(r), to_uint8(g), to_uint8(b)], axis=-1), src
        else:
            arr = src.read(1)
            a8 = np.clip(arr / np.nanmax(arr) * 255, 0, 255).astype(np.uint8)
            img = np.stack([a8, a8, a8], axis=-1)
            return img, src


def color_to_binary_navigability(img_rgb, blue_ratio_threshold=1.2, blue_min=80, ice_brightness_threshold=220):
    """Return binary map (1=water, 0=ice/land)."""
    r, g, b = [img_rgb[..., i].astype(np.float32) for i in range(3)]
    eps = 1e-6
    blue_ratio = b / ((r + g) / 2 + eps)
    water = (blue_ratio >= blue_ratio_threshold) & (b >= blue_min)
    ice = (r >= ice_brightness_threshold) & (g >= ice_brightness_threshold) & (b >= ice_brightness_threshold)
    navmap = np.zeros(img_rgb.shape[:2], dtype=np.uint8)
    navmap[water] = 1
    return navmap


def preprocess_color_tiff_to_binary(tif_path, water_blue_ratio=1.2, blue_min=80, ice_brightness=220):
    img, src = read_rgb_from_tiff(tif_path)
    navmap = color_to_binary_navigability(img, water_blue_ratio, blue_min, ice_brightness)
    return navmap, img, src


def get_pixel_value_from_latlon(tif_path, lat, lon):
    with rasterio.open(tif_path) as src:
        transformer = Transformer.from_crs("EPSG:4326", src.crs, always_xy=True)
        x, y = transformer.transform(lon, lat)
        row, col = src.index(x, y)
    return (row, col)


def export_route_geojson(path_pixels, tif_path, output_path=None):
    """Convert pixel path to GeoJSON FeatureCollection."""
    with rasterio.open(tif_path) as src:
        transform_affine = src.transform
        transformer = Transformer.from_crs(src.crs, "EPSG:4326", always_xy=True)
        coords = []
        for row, col in path_pixels:
            x, y = xy(transform_affine, row, col, offset="center")
            lon, lat = transformer.transform(x, y)
            coords.append((lon, lat))
    line = LineString(coords)
    geojson = {
        "type": "FeatureCollection",
        "features": [{"type": "Feature", "geometry": mapping(line), "properties": {}}],
    }
    if output_path:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(geojson, f, indent=2)
    return geojson
