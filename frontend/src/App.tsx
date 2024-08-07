import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import WordInput from "./components/WordInput";
import FlashCard from "./components/FlashCard";
import LanguageModeForm from "./components/LanguageModeForm";
import LanguageLevelForm from "./components/LanguageLevelForm";
import ErrorBanner from "./components/ErrorBanner";

import { v4 as uuidv4 } from "uuid";
import LoginButton from "./components/LoginButton";
import Profile from "./components/Profile";
import { useAuth0 } from "@auth0/auth0-react";

import serviceConfig from '../config/service.json';

console.log(`Backend set to ${serviceConfig.BACKEND_ENDPOINT}${serviceConfig.BACKEND_PATH}`)

const App = () => {
  const cards = useSelector((state: CardState) => state.cards);
  const [errors, setErrors] = useState<ErrorMessage[]>([]);
  const {  getAccessTokenSilently, isAuthenticated } = useAuth0();
  const userId = "default";

  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log();
  };

  const fetchAllFlashcards = async () => {
    try {
      let accessToken = ""
      if (isAuthenticated) {
        accessToken = await getAccessTokenSilently();
      }
      if (accessToken) {
        const response = await fetch(
          `${serviceConfig.BACKEND_ENDPOINT}${serviceConfig.BACKEND_PATH}/flashcards?userId=${userId}`,
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`
            },
          },
        );
        if (!(response.ok)) {
          return
        }
        const json = await response.json()
        console.log("/flashcards", JSON.stringify(json))
      }
    } catch (e: any) {
      const errItem = { id: uuidv4(), message: e.message };
      setErrors((errs) => [...errs, errItem]);
    }
  }

  // fetch flashcards for current user on first load
  useEffect(() => {
    fetchAllFlashcards()
  },[])

  return (
    <div className="App">
      <div className="header">
        <h1 className="title">AI Generated Flashcards</h1>
      </div>
      <WordInput setErrors={setErrors} userId={userId} />
      {!isAuthenticated && <LoginButton />}
      <Profile />
      <LanguageModeForm />
      <LanguageLevelForm />
      {errors.map((e) => (
        <ErrorBanner key={uuidv4()} e={e} setErrors={setErrors} />
      ))}
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
              key={uuidv4()}
              cardData={JSON.parse(cardData)}
              setErrors={setErrors}
              userId={userId}
            />
          ))}
        </div>
      </form>
    </div>
  );
};

export default App;