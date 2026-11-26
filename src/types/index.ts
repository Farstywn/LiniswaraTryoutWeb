export type UserRole = "student" | "admin";
export type SubscriptionStatus = "free" | "active";
export type EducationLevel = "SD/MI" | "SMP/MTs" | "SMA/MA" | "SMK/MAK";

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  school: string;
  grade: string;
  subscription_status: SubscriptionStatus;
  subscription_plan: string | null;
  subscription_expires_at: string | null;
  created_at: string;
}

export interface SafeUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  school: string;
  grade: string;
  subscription_status: SubscriptionStatus;
  subscription_plan: string | null;
  subscription_expires_at: string | null;
  created_at: string;
}

export interface RedeemCode {
  id: number;
  code: string;
  plan_name: string;
  description: string;
  duration_days: number;
  quota: number;
  used_count: number;
  is_active: boolean;
  created_at: string;
}

export interface UserRedemption {
  id: number;
  user_id: number;
  redeem_code_id: number;
  code: string;
  plan_name: string;
  description?: string;
  redeemed_at: string;
  expires_at: string;
}

export interface VideoMaterial {
  id: number;
  title: string;
  category: string;
  subject: string;
  grade_level: string;
  youtube_id: string;
  duration: string;
  summary: string;
  book_reference: string;
  is_premium: boolean;
  order_num: number;
}

export interface UserMaterialProgress {
  id: number;
  user_id: number;
  material_id: number;
  completed_at: string;
}

export interface TryoutPackage {
  id: number;
  slug: string;
  title: string;
  level: EducationLevel;
  subject: string;
  description: string;
  duration_minutes: number;
  question_count: number;
  is_premium: boolean;
}

export interface TryoutQuestion {
  id: number;
  package_id: number;
  question_number: number;
  topic: string;
  stimulus: string;
  statement_1: string;
  answer_1: boolean;
  statement_2: string;
  answer_2: boolean;
  statement_3: string;
  answer_3: boolean;
  explanation: string;
}

export interface PublicTryoutQuestion {
  id: number;
  package_id: number;
  question_number: number;
  topic: string;
  stimulus: string;
  statement_1: string;
  statement_2: string;
  statement_3: string;
}

export type StatementAnswer = boolean | null;

export interface QuestionUserAnswer {
  questionId: number;
  questionNumber: number;
  answers: [StatementAnswer, StatementAnswer, StatementAnswer];
}

export interface TryoutAttempt {
  id: number;
  user_id: number;
  package_id: number;
  score: number;
  correct_statements: number;
  total_statements: number;
  perfect_questions: number;
  answers_json: string;
  duration_seconds: number;
  created_at: string;
}

export interface TryoutSession {
  id: number;
  user_id: number;
  package_id: number;
  started_at_ms: number;
  ends_at_ms: number;
  total_seconds: number;
  current_index: number;
  answers: Record<number, [StatementAnswer, StatementAnswer, StatementAnswer]>;
  flagged: Record<number, boolean>;
  updated_at: string;
}
