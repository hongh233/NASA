import geopandas as gpd
from shapely.geometry import Point
from shapely.ops import nearest_points

class ShippingCorridorHandler:
    def __init__(self, geojson_path: str, buffer_m=5000, crs="EPSG:4326"):
        self.routes = gpd.read_file(geojson_path)
        self.routes = self.routes.to_crs(crs)
        self.buffer_m = buffer_m
        self.corridors = self.routes.buffer(buffer_m)
        self.corridor_union = self.corridors.unary_union
        self.crs = crs

    def is_point_in_corridor(self, lon: float, lat: float):
        pt = gpd.GeoSeries([Point(lon, lat)], crs="EPSG:4326").to_crs(self.routes.crs)
        return self.corridor_union.contains(pt.iloc[0])
