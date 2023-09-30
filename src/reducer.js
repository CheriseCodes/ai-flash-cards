const reducer = (state, action) => {
  switch (action.type) {
    case "add-card": {
      return {
        ...state,
        cards: [...state.cards, ...[action.payload]],
      };
    }
    case "update-card": {
      return {
        ...state,
        cards: state.cards.map((item) => {
          if (item.id === action.payload.id) {
            return { ...action.payload.data }; // Update the object with new values
          }
          return item; // Return unchanged objects
        }),
      };
    }
    case "delete-card": {
      return {
        ...state,
        cards: state.cards.filter((prevCardData) => {
          return prevCardData.id !== action.payload;
        }),
      };
    }
    case "update-language-level": {
      return {
        ...state,
        languageLevel: action.payload,
      };
    }
    case "update-language-mode": {
      return {
        ...state,
        languageMode: action.payload,
      };
    }
    default: {
      throw new Error("Unknown action:");
    }
  }
};

export default reducer;
