import { Club } from "../../types/club";
import { Court } from "../../types/court";
import { Profile } from "../../types/profile";

export type Step =
  | "club"
  | "date"
  | "court"
  | "time"
  | "gameMode"
  | "matchType"
  | "opponent"
  | "payment"
  | "summary";

export type PaymentMethod = "card" | "cash";

export type MatchType = "open" | "closed";

export type GameMode = "competitive" | "friendly" | "training";

export interface SelectedData {
  club?: Club;
  date?: Date;
  court?: Court;
  times?: string[];
  gameMode?: GameMode;
  matchType?: MatchType;
  opponent?: Profile;
  paymentMethod?: PaymentMethod;
}

export interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  primary: string;
  border: string;
}
