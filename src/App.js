import React, { useState, useReducer } from "react";
import WordInput from "./components/WordInput.js";
import FlashCard from "./components/FlashCard.js";
import LanguageModeForm from "./components/LanguageModeForm.js";
import LanguageLevelForm from "./components/LanguageLevelForm.js";

import reducer from "./reducer.js";
import appConfig from "./config.js";
import { v4 as uuidv4 } from "uuid";

//import cloneDeep from "lodash/cloneDeep.js";

// TODO: Decide what data needs to persist between page refreshes
// - allCardData
// - selectedCards
// - languageMode
// - languageLevel

// TODO: Use reducer pattern
// - action types: add-card, regenerate-card, update-card
// - payload: input for each action type
// data structure: { "cards": [...{card: data}], "language-mode": "mode", "language-level": "level"}

// TODO: Transform reducer to Redux pattern
const App = () => {
  const [state, dispatch] = useReducer(reducer, {
    cards: [],
    languageMode: appConfig.languageModes.KOREAN,
    languageLevel: appConfig.koreanLanguageLevels.TOPIK1,
  });

  const [spinner, setSpinner] = useState(false);

  const generateCard = async (word) => {
    console.log(`App.generateCard - word: ${word}`);
    try {
      if (word) {
        setSpinner(true);
        const response = await fetch(
          `http://localhost:8000/openai/test/text?word=${word}&lang_mode=${state.languageMode}&lang_level=${state.languageLevel}`,
        );
        const json = await response.json();
        console.log(`generateCardImage response:${JSON.stringify(json)}`);
        console.log(`generateCards response:${JSON.stringify(json)}`);
        let cardData = json.choices[0].message.content; // stringified JSON
        cardData = JSON.parse(cardData);
        const imageResponse = await fetch(
          `http://localhost:8000/openai/test/imagine?sentence=${cardData.tr}`,
        );
        const imageJson = await imageResponse.json();
        cardData.id = uuidv4();
        cardData.img = imageJson.data[0].url;
        console.log(`App.generateCard - cardData: ${JSON.stringify(cardData)}`);
        dispatch({ type: "add-card", payload: cardData });
        setSpinner(false);
        console.log(`App.generateCard - allCardData: ${state.cards}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log();
  };

  // TODO: Add tool tip for each button
  // TODO: Convert buttons into svgs
  return (
    <div className="App">
      <LanguageModeForm state={state} dispatch={dispatch} />
      <LanguageLevelForm state={state} dispatch={dispatch} />
      <WordInput generateCard={generateCard} spinner={spinner} />
      <form className="flash-card-form" onSubmit={handleSubmit}>
        {state.cards.map((cardData) => (
          <FlashCard
            key={cardData.id}
            cardData={cardData}
            state={state}
            dispatch={dispatch}
          />
        ))}
        <button>Download</button>
      </form>
      {spinner && <p>Generating sentences...</p>}
    </div>
  );
};

export default App;
