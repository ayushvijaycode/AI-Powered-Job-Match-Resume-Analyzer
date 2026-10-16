export type LearningItem = { skill: string; action: string; deliverable: string }
export type Analysis = {
  id: number
  resume_filename: string
  job_title: string
  match_score: number
  skill_coverage: number
  semantic_similarity: number
  experience_relevance: number
  matched_skills: string[]
  missing_skills: string[]
  resume_skills: string[]
  job_skills: string[]
  learning_plan: LearningItem[]
  created_at: string
  job_description?: string
  resume_text?: string
}
