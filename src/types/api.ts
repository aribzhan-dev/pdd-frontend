// Shapes returned by pdd_backend. Enum-like fields arrive as {value, label}:
// the value drives logic, the label is the Russian text shown to the user.

export type Language = "ru" | "kz";

export interface LabeledValue {
  value: string;
  label: string;
}

export interface Media {
  url: string;
  kind: string;
  byte_size: number;
}

export interface Answer {
  id: number;
  text: string;
  /** Null until the question has been answered — the backend withholds it. */
  is_correct: boolean | null;
}

export interface Question {
  id: number;
  text: string;
  explanation: string | null;
  image: Media | null;
  situation_video: Media | null;
  explanation_video: Media | null;
  is_exam_only: boolean;
  answers: Answer[];
}

export interface TopicBrief {
  id: number;
  number: number;
  title: string;
  question_count: number;
  /** How many parts the topic is offered in; 1 means it is run in one go. */
  part_count: number;
  best_percent: number | null;
}

/** One slot of a session — this is what colours the numbered chips. */
export interface ItemState {
  position: number;
  question_id: number;
  is_answered: boolean;
  is_correct: boolean | null;
  answer_id: number | null;
}

export interface Session {
  id: number;
  mode: LabeledValue;
  status: LabeledValue;
  language: Language;
  topic_id: number | null;
  title: string;
  started_at: string;
  total_questions: number;
  answered_count: number;
  correct_count: number;
  can_finish: boolean;
  min_answers_to_finish: number;
  /** Allotted time for timed modes; null when the run is untimed. */
  time_limit_seconds: number | null;
  /** Time left, so a reload restores the clock instead of restarting it. */
  seconds_left: number | null;
  /** Slot to open on load: the first unanswered one. */
  current_position: number;
  /** False while an exam runs: show answered/unanswered only, never correctness. */
  reveals_answers: boolean;
  items: ItemState[];
  questions: Question[];
}

export interface AnswerResult {
  /** Null during the exam: the verdict is withheld until the run is handed in. */
  is_correct: boolean | null;
  correct_answer_id: number | null;
  explanation: string | null;
  explanation_video_url: string | null;
  can_finish: boolean;
  answered_count: number;
  reveals_answer: boolean;
}

export interface QuestionReview {
  position: number;
  question_id: number;
  question_text: string;
  given_answer_text: string | null;
  correct_answer_text: string;
  is_correct: boolean;
  is_answered: boolean;
}

export interface SessionResult {
  id: number;
  mode: LabeledValue;
  title: string;
  total_questions: number;
  answered_count: number;
  correct_count: number;
  score_percent: number;
  is_passed: boolean;
  time_seconds: number | null;
  finished_at: string | null;
  /** Every question of the run, in order. */
  review: QuestionReview[];
  /** The failed subset of `review`. */
  mistakes: QuestionReview[];
}

export interface ResultBrief {
  id: number;
  mode: LabeledValue;
  title: string;
  total_questions: number;
  answered_count: number;
  correct_count: number;
  score_percent: number;
  is_passed: boolean;
  time_seconds: number | null;
  finished_at: string | null;
}

export interface StudentContext {
  category: LabeledValue;
  status: LabeledValue;
  access_expires_at: string;
  days_left: number;
}

export interface CurrentUser {
  id: number;
  iin: string;
  name: string;
  surname: string;
  full_name: string;
  phone_number: string | null;
  role: LabeledValue;
  student: StudentContext | null;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginResponse {
  tokens: TokenPair;
  user: CurrentUser;
}

export interface Student {
  id: number;
  iin: string;
  name: string;
  surname: string;
  full_name: string;
  phone_number: string | null;
  is_active: boolean;
  category: LabeledValue;
  status: LabeledValue;
  access_starts_at: string;
  access_expires_at: string;
  days_left: number;
  note: string | null;
  last_login_at: string | null;
  created_at: string;
}

export interface UserBrief {
  id: number;
  iin: string;
  full_name: string;
  phone_number: string | null;
  role: LabeledValue;
  is_active: boolean;
  created_at: string;
}

export interface CredentialsIssued {
  iin: string;
  password: string;
  full_name: string;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export type UserRole = "admin" | "manager" | "student";
