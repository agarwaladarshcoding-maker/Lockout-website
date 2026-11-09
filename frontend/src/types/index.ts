/**
 * Core type definitions for Lockout Frontend
 * Covers user profiles, navigation views, challenge configuration, history, and notifications.
 */

export interface UserProfile {
  username: string;
  fullName: string;
  email: string;
  codeforcesHandle: string;
  avatarUrl?: string;
  rating?: number;
}

export type DashboardView = "challenge" | "history" | "notifications" | "settings";

export type TiebreakerMode = "draw" | "questions";

export type AuthMode = "signin" | "signup";

export type VerificationPhase = "handle" | "challenge" | "checking" | "success";

export type MatchResult = "Won" | "Lost" | "Draw";

export interface MatchHistoryItem {
  id: string;
  opponent: string;
  format: string;
  result: MatchResult;
  ratingChange: string;
  date: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  type: "challenge" | "verified" | "rating" | "system";
}

export interface ChallengeConfig {
  opponentUsername: string;
  startingRating: number;
  questionCount: number;
  durationMinutes: number;
  tiebreaker: TiebreakerMode;
  tieQuestions?: number;
  tieRating?: number;
  tieTimeMinutes?: number;
}

