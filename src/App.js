import React from "react";
import { useSelector } from "react-redux";
import WordInput from "./components/WordInput.js";
import FlashCard from "./components/FlashCard.js";
import LanguageModeForm from "./components/LanguageModeForm.js";
import LanguageLevelForm from "./components/LanguageLevelForm.js";

// TODO: Allow select different OpenAI versions
// TODO: Persist different OpenAI version settings

const App = () => {
  const cards = useSelector((state) => state.cards);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log();
  };

  // TODO: Add tool tip for each button
  // TODO: Convert buttons into svgs
  return (
    <div className="App">
      <div className="header">
        <h1 className="title">AI Generated Flashcards</h1>
      </div>
      <WordInput />
      <LanguageModeForm />
      <LanguageLevelForm />
      {/* TODO: use loading button boostrap component */}
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
    </div>
  );
};

export default App;
