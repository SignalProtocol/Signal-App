export interface GlobalState {
  theme: "light" | "dark";
  tokenBalance: number | null;
  riskScore: number | null;
  txSignature: string | null;
  cardUUID?: string | null;
  unLockedCards?: any[];
  userProfileStatus?: number;
  selectedDex?: string;
}

export type GlobalAction =
  | { type: "SET_THEME"; payload: "light" | "dark" }
  | { type: "SET_TOKEN_BALANCE"; payload: number | null }
  | { type: "SET_RISK_SCORE"; payload: number | null }
  | { type: "SET_TX_SIGNATURE"; payload: string | null }
  | { type: "SET_CARD_UUID"; payload: string | null }
  | { type: "SET_UNLOCKED_CARDS"; payload: any[] | null }
  | { type: "SET_USER_PROFILE_STATUS"; payload: number }
  | { type: "SET_SELECTED_DEX"; payload: string | null };