import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import WordInput from "./components/WordInput.js";
import FlashCard from "./components/FlashCard.js";
import LanguageModeForm from "./components/LanguageModeForm.js";
import LanguageLevelForm from "./components/LanguageLevelForm.js";

import { v4 as uuidv4 } from "uuid";

// TODO: Allow select different OpenAI versions
// TODO: Persist different OpenAI version settings

const App = () => {
  const [spinner, setSpinner] = useState(false);
  const languageLevel = useSelector((state) => state.languageLevel);
  const languageMode = useSelector((state) => state.languageMode);
  const cards = useSelector((state) => state.cards);
  const selectedCards = useSelector((state) => state.selectedCards);

  const dispatch = useDispatch();

  // TODO: Move out of App.js
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
        console.log(`App.generateCard - cardData: ${JSON.stringify(cardData)}`);
        dispatch({ type: "add-card", cardData: cardData });
        setSpinner(false);
        console.log(`App.generateCard - allCardData: ${cards}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log();
  };

  const handleDownload = () => {
    let fileContents = "#separator:tab\n#html:true\n";
    const parsedCards = cards.map((card) => JSON.parse(card));
    const cardsToDownload = parsedCards.filter((card) => {
      return selectedCards.includes(card.id);
    });
    for (let card of cardsToDownload) {
      fileContents = fileContents.concat(
        `${card.word}<br>${card.sampleSentence}    <img src="${card.img}"><br>${card.translatedSampleSentence}`,
      );
    }
    console.log(fileContents);
  };

  // TODO: Add tool tip for each button
  // TODO: Convert buttons into svgs
  return (
    <div className="App">
      <LanguageModeForm />
      <LanguageLevelForm />
      <WordInput generateCard={generateCard} spinner={spinner} />
      <form className="flash-card-form" onSubmit={handleSubmit}>
        <div className="flash-card-container">
          {cards.map((cardData) => (
            <FlashCard
              key={JSON.parse(cardData).id}
              cardData={JSON.parse(cardData)}
            />
          ))}
        </div>
        <button onClick={handleDownload}>Download</button>
      </form>
      {spinner && <p>Generating sentences...</p>}
    </div>
  );
};

export default App;
