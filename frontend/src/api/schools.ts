import api from "./client";
import type { School, SchoolList, RecommendRequest, RecommendResponse } from "../types";

export async function fetchSchools(params: Record<string, string | number>): Promise<SchoolList> {
  const filtered = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v !== undefined));
  const res = await api.get("/schools", { params: filtered });
  return res.data;
}

export async function fetchSchool(id: number): Promise<School> {
  const res = await api.get(`/schools/${id}`);
  return res.data;
}

export async function fetchCompare(ids: number[]): Promise<School[]> {
  const res = await api.get("/schools/compare/batch", { params: { ids: ids.join(",") } });
  return res.data;
}

export async function fetchRecommendations(req: RecommendRequest): Promise<RecommendResponse> {
  const res = await api.post("/recommend", req);
  return res.data;
}
