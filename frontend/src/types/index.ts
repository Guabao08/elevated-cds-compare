export interface School {
  id: number;
  scorecard_id: number | null;
  name: string;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  url: string | null;
  school_type: string | null;
  locale: string | null;
  size_category: string | null;
  acceptance_rate: number | null;
  sat_avg: number | null;
  act_midpoint: number | null;
  tuition_in_state: number | null;
  tuition_out_state: number | null;
  avg_net_price: number | null;
  median_debt: number | null;
  graduation_rate: number | null;
  retention_rate: number | null;
  median_earnings_10yr: number | null;
  undergrad_enrollment: number | null;
  hbcu: boolean;
  hispanic_serving: boolean;
  womens_only: boolean;
  mens_only: boolean;
  top_programs: string | null;
}

export interface SchoolList {
  total: number;
  page: number;
  per_page: number;
  results: School[];
}

export interface RecommendRequest {
  gpa: number;
  sat?: number;
  act?: number;
  budget?: number;
  state_preference?: string;
  intended_major?: string;
  school_size?: string;
  locale_preference?: string;
  priorities?: string[];
}

export interface RecommendedSchool {
  school: School;
  tier: "Reach" | "Target" | "Safety";
  fit_score: number;
  reasoning: string;
}

export interface RecommendResponse {
  profile_summary: string;
  schools: RecommendedSchool[];
}

export interface SearchFilters {
  q: string;
  state: string;
  school_type: string;
  locale: string;
  size_category: string;
  max_acceptance: string;
  max_tuition: string;
  min_grad_rate: string;
  sort_by: string;
  sort_dir: string;
}
