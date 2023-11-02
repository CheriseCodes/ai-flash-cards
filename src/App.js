import React, { useState } from "react";
import { useSelector } from "react-redux";
import WordInput from "./components/WordInput.js";
import FlashCard from "./components/FlashCard.js";
import LanguageModeForm from "./components/LanguageModeForm.js";
import LanguageLevelForm from "./components/LanguageLevelForm.js";
import ErrorBanner from "./components/ErrorBanner.js";

const App = () => {
  const cards = useSelector((state) => state.cards);
  const [errors, setErrors] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log();
  };

  console.log("errors:", errors);
  return (
    <div className="App">
      <div className="header">
        <h1 className="title">AI Generated Flashcards</h1>
      </div>
      <WordInput setErrors={setErrors} />
      <LanguageModeForm />
      <LanguageLevelForm />
      {errors.map((e) => (
        <ErrorBanner key={e.id} e={e} setErrors={setErrors} />
      ))}
      {/* TODO: use loading button boostrap component */}
      <form className="flash-card-form" onSubmit={handleSubmit}>
        {cards.length == 0 && (
          <div className="instructions-container">
            <h4>Welcome to AI Generated Flashcards app!</h4>
            <p>
              To get started enter a{" "}
              <a href="https://en.wikipedia.org/wiki/Comma-separated_values">
                comma separated list
              </a>{" "}
              of the words you&apos;d like to generate flashcards for, then
              click <strong>Generate</strong>. When you&apos;re satisfied with
              the results, click <strong>Download</strong> to recieve a Anki
              formated file that you can import into Anki by using the following
              instructions:{" "}
              <a href="https://docs.ankiweb.net/importing/intro.html">
                Anki Manual - Importing
              </a>
            </p>
            <p>
              <strong>Example input: </strong>환자,명운
            </p>
          </div>
        )}
        <div className="flash-card-container">
          {cards.map((cardData) => (
            <FlashCard
              key={JSON.parse(cardData).id}
              cardData={JSON.parse(cardData)}
              setErrors={setErrors}
            />
          ))}
        </div>
      </form>
    </div>
  );
};

export default App;
