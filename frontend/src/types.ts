// API Response types for fetch, Request, and Response
import type { FeatureCollection } from "geojson";

export type IceExtentResponse = {
  date: string;
  source: string;
  radius_km: number;
  feature_collection: FeatureCollection;
};