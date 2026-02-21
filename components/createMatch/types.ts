import { Club } from "../../types/club";
import { Court } from "../../types/court";
import { Profile } from "../../types/profile";

export type Step =
  | "club"
  | "date"
  | "court"
  | "time"
  | "matchType"
  | "opponent"
  | "payment"
  | "summary";

export type PaymentMethod = "card" | "cash";

export type MatchType = "open" | "closed";

export interface SelectedData {
  club?: Club;
  date?: Date;
  court?: Court;
  times?: string[];
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
