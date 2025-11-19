import { GlobalState, GlobalAction } from "./globalTypes";

export const initialState: GlobalState = {
  theme: "dark",
  tokenBalance: 0,
  riskScore: 0,
  txSignature: null,
  cardUUID: null,
  unLockedCards: [],
  userProfileStatus: 0,
};

export function globalReducer(
  state: GlobalState,
  action: GlobalAction
): GlobalState {
  switch (action.type) {
    case "SET_THEME":
      return { ...state, theme: action.payload };
    case "SET_TOKEN_BALANCE":
      return { ...state, tokenBalance: action.payload };
    case "SET_RISK_SCORE":
      return { ...state, riskScore: action.payload };
    case "SET_TX_SIGNATURE":
      return { ...state, txSignature: action.payload };
    case "SET_CARD_UUID":
      return { ...state, cardUUID: action.payload };
    case "SET_UNLOCKED_CARDS":
      return { ...state, unLockedCards: action.payload || [] };
    case "SET_USER_PROFILE_STATUS":
      return { ...state, userProfileStatus: action.payload };
    default:
      return state;
  }
}
