import appConfig from "./config";

const reducer = (state: any, action: any) => {
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
        cards: state.cards.map((item: string) => {
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
        cards: state.cards.filter((prevCardData: string) => {
          return !prevCardData.includes(action.cardId);
        }),
      };
    }
    case "toggle-generating-text": {
      return {
        ...state,
        cards: state.cards.map((item: string) => {
          if (item.includes(action.cardId)) {
            const cardJson = JSON.parse(item);
            cardJson.generatingText = !cardJson.generatingText;
            return JSON.stringify(cardJson);
          }
          return item;
        }),
      };
    }
    case "toggle-generating-image": {
      return {
        ...state,
        cards: state.cards.map((item: string) => {
          if (item.includes(action.cardId)) {
            const cardJson = JSON.parse(item);
            cardJson.generatingImage = !cardJson.generatingImage;
            return JSON.stringify(cardJson);
          }
          return item;
        }),
      };
    }
    case "set-generating-image": {
      return {
        ...state,
        cards: state.cards.map((item: string) => {
          if (item.includes(action.cardId)) {
            const cardJson = JSON.parse(item);
            cardJson.generatingImage = action.isGenerating;
            return JSON.stringify(cardJson);
          }
          return item;
        }),
      };
    }
    case "set-generating-text": {
      return {
        ...state,
        cards: state.cards.map((item: string) => {
          if (item.includes(action.cardId)) {
            const cardJson = JSON.parse(item);
            cardJson.generatingText = action.isGenerating;
            return JSON.stringify(cardJson);
          }
          return item;
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
        selectedCards: state.selectedCards.filter((currId: string) => {
          return currId != action.cardId;
        }),
      };
    }
    // case "set-authenticated": {
    //   return {
    //     ...state,
    //     isAuthenticated: action.authenticated
    //   }
    // }
    default: {
      return { ...state };
    }
  }
};

export default reducer;
