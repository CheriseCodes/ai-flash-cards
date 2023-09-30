import React, { useState } from "react";
import WordInput from "./components/WordInput.js";
import FlashCard from "./components/FlashCard.js";
import LanguageModeForm from "./components/LanguageModeForm.js";
import LanguageLevelForm from "./components/LanguageLevelForm.js";

import appConfig from "./config.js";
import { v4 as uuidv4 } from "uuid";

import cloneDeep from "lodash/cloneDeep.js";

// TODO: Decide what data needs to persist between page refreshes
// - allCardData
// - selectedCards
// - languageMode
// - languageLevel

// TODO: Globalize language modes and levels without using global variables
// - https://www.w3.org/wiki/JavaScript_best_practices#Avoid_globals
const App = () => {
  const [spinner, setSpinner] = useState(false);
  const [allCardData, setAllCardData] = useState([]);
  const [languageMode, setLanguageMode] = useState(
    appConfig.languageModes.KOREAN,
  );
  const [languageLevel, setLanguageLevel] = useState(
    appConfig.koreanLanguageLevels.TOPIK1,
  );

  const generateCard = async (word) => {
    console.log(`App.generateCard - word: ${word}`);
    try {
      if (word) {
        setSpinner(true);
        const response = await fetch(
          `http://localhost:8000/openai/test/text?word=${word}&lang_mode=${languageMode}&lang_level=${languageLevel}`,
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
        // cardData =
        console.log(`App.generateCard - cardData: ${JSON.stringify(cardData)}`);
        setAllCardData((curr) => [...curr, ...[cardData]]);
        setSpinner(false);
        console.log(`App.generateCard - allCardData: ${allCardData}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log();
  };

  const replaceCard = (cardId, newCardData) => {
    const newArray = cloneDeep(allCardData);

    // Find and update the object in the cloned array
    const updatedArray = newArray.map((item) => {
      if (item.id === cardId) {
        return { ...item, ...newCardData }; // Update the object with new values
      }
      return item; // Return unchanged objects
    });
    setAllCardData(updatedArray);
  };

  // TODO: Add tool tip for each button
  // TODO: Convert buttons into svgs
  return (
    <div className="App">
      <LanguageModeForm
        setLanguageMode={setLanguageMode}
        languageMode={languageMode}
        setLanguageLevel={setLanguageLevel}
      />
      <LanguageLevelForm
        languageMode={languageMode}
        languageLevel={languageLevel}
        setLanguageLevel={setLanguageLevel}
      />
      <WordInput
        generateCard={generateCard}
        setAllCardData={setAllCardData}
        allCardData={allCardData}
        spinner={spinner}
      />
      <form className="flash-card-form" onSubmit={handleSubmit}>
        {allCardData
          ? allCardData.map((cardData) => (
              <FlashCard
                key={cardData.id}
                cardData={cardData}
                setAllCardData={setAllCardData}
                allCardData={allCardData}
                replaceCard={replaceCard}
                languageLevel={languageLevel}
                languageMode={languageMode}
              />
            ))
          : ""}
        <button>Download</button>
      </form>
      {spinner && <p>Generating sentences...</p>}
    </div>
  );
};

export default App;
