import { languageConfig } from "./config";

const currentStateSummary = (state: any) => {
  console.log(`# of cards is ${state.cards.length}`)
  for (const [index, card] of state.cards.entries()) {
    console.log(`Card #${index}: ${card}`)
  }
}
const reducer = (state: any, action: any) => {
  switch (action.type) {
    case "add-card": {
      const newState = {
        ...state,
        cards: [...state.cards, ...[JSON.stringify(action.cardData)]],
      }
      console.log("add-card state:");
      currentStateSummary(newState)
      return newState;
    }
    case "update-card": {
      const newState = {
        ...state,
        cards: state.cards.map((item: string) => {
          if (item.includes(action.cardId)) {
            return JSON.stringify(action.cardData);
          }
          return item;
        }),
      }
      console.log("update-card state:");
      currentStateSummary(newState)
      return newState;
    }
    case "delete-card": {
      const newState = {
        ...state,
        cards: state.cards.filter((prevCardData: string) => {
          return !prevCardData.includes(action.cardId);
        }),
      }
      console.log("delete-card state");
      currentStateSummary(newState)
      return newState;
    }
    case "toggle-generating-text": {
      const newState = {
        ...state,
        cards: state.cards.map((item: string) => {
          if (item.includes(action.cardId)) {
            const cardJson = JSON.parse(item);
            cardJson.generatingText = !cardJson.generatingText;
            return JSON.stringify(cardJson);
          }
          return item;
        }),
      }
      return newState;
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
      const newState = {
        ...state,
        languageLevel: action.langLevel,
      }
      console.log("update-language-level state:");
      currentStateSummary(newState)
      return newState;
    }
    case "update-language-mode": {
      let langLevel = languageConfig.cferLanguageLevels.A1;
      if (action.langMode === languageConfig.languageModes.KOREAN) {
        langLevel = languageConfig.koreanLanguageLevels.TOPIK1;
      }
      const newState = {
        ...state,
        languageLevel: langLevel,
        languageMode: action.langMode,
      }
      console.log("update-language-mode state:");
      currentStateSummary(newState)
      return newState;
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
    default: {
      return { ...state };
    }
  }
};

export default reducer;
