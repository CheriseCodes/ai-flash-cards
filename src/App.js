import React, { useState } from "react";
import { useSelector } from "react-redux";
import WordInput from "./components/WordInput.js";
import FlashCard from "./components/FlashCard.js";
import LanguageModeForm from "./components/LanguageModeForm.js";
import LanguageLevelForm from "./components/LanguageLevelForm.js";
import LoadingSpinner from "./components/LoadingSpinner.js";

// TODO: Allow select different OpenAI versions
// TODO: Persist different OpenAI version settings

const App = () => {
  const [spinner, setSpinner] = useState(false);
  const cards = useSelector((state) => state.cards);
  const selectedCards = useSelector((state) => state.selectedCards);

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
      <WordInput setSpinner={setSpinner} spinner={spinner} />
      {/* TODO: use loading button boostrap component */}
      <button onClick={handleDownload}>Download</button>
      <form className="flash-card-form" onSubmit={handleSubmit}>
        <div className="flash-card-container">
          {cards.map((cardData) => (
            <FlashCard
              key={JSON.parse(cardData).id}
              cardData={JSON.parse(cardData)}
            />
          ))}
        </div>
      </form>
      {spinner && <LoadingSpinner purpose={"Generating cards"} />}
    </div>
  );
};

export default App;
