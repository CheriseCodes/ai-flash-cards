import appConfig from "./config.js";

const reducer = (state, action) => {
  switch (action.type) {
    case "add-card": {
      console.log(`add-card state: ${JSON.stringify(state)}`);
      return {
        ...state,
        cards: [...state.cards, ...[JSON.stringify(action.cardData)]],
      };
    }
    case "update-card": {
      console.log(`update-card state: ${JSON.stringify(state)}`);
      return {
        ...state,
        cards: state.cards.map((item) => {
          if (item.includes(action.cardId)) {
            return JSON.stringify(action.cardData);
          }
          return item;
        }),
      };
    }
    case "delete-card": {
      console.log(`delete-card state: ${JSON.stringify(state)}`);
      return {
        ...state,
        cards: state.cards.filter((prevCardData) => {
          return !prevCardData.includes(action.cardId);
        }),
      };
    }
    case "update-language-level": {
      console.log(`update-language-level state: ${JSON.stringify(state)}`);
      return {
        ...state,
        languageLevel: action.langLevel,
      };
    }
    case "update-language-mode": {
      console.log(`update-language-mode state: ${JSON.stringify(state)}`);
      let langLevel = appConfig.cferLanguageLevels.A1;
      if (action.langMode === appConfig.languageModes.KOREAN) {
        langLevel = appConfig.koreanLanguageLevels.TOPIK1;
      }
      return {
        ...state,
        languageLevel: langLevel,
        languageMode: action.langMode,
      };
    }
    case "add-selected-card": {
      return {
        ...state,
        selectedCards: [...state.selectedCards, ...[action.cardId]],
      };
    }
    case "remove-selected-card": {
      return {
        ...state,
        selectedCards: state.selectedCards.filter((currId) => {
          return currId != action.cardId;
        }),
      };
    }
    default: {
      return { ...state };
    }
  }
};

export default reducer;
