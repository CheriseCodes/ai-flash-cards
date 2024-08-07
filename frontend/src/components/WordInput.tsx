import React, { useRef, useState, Dispatch, SetStateAction } from "react";
import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";
import { generateNewCard } from "../utils";
import { Button } from "react-bootstrap";
import { useAuth0 } from "@auth0/auth0-react";

const WordInput = ({ setErrors, userId }: { setErrors: Dispatch<SetStateAction<Array<ErrorMessage>>>, userId: string }) => {
  const languageLevel = useSelector((state: LanguageState) => state.languageLevel);
  const languageMode = useSelector((state: LanguageState) => state.languageMode);
  const [spinner, setSpinner] = useState(false);
  const cards = useSelector((state: CardState) => state.cards);
  const selectedCards = useSelector((state: CardState) => state.selectedCards);
  const dispatch = useDispatch();
  const textAreaRef = useRef<HTMLInputElement>(null);
  const {  isAuthenticated, getAccessTokenSilently } = useAuth0();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (textAreaRef.current != null) {
      const wordList = textAreaRef.current.value;
    for (const [index, word] of wordList.split(",").entries()) {
      console.log(
        `WordInput.handleSubmit - \${index}:\${word.trim()}: ${index}:${word.trim()}`,
      );
      setSpinner(true)
      try {
        let accessToken = "";
        if (isAuthenticated) {
          try {
            accessToken = await getAccessTokenSilently();
          } catch {
            console.log("getAccessTokenSilently failed")
          }
        }
        generateNewCard(
          dispatch,
          word,
          languageMode,
          languageLevel,
          setErrors,
          userId,
          accessToken
        );
      } catch (e) {
        console.error(e)
      }
      setSpinner(false)
      }
    }
  };

  const handleDownload = (e: any) => {
    e.preventDefault()
    // TODO: upgrade download file
    let fileContents = "#separator:tab\n#html:true\n";
    const parsedCards = cards.map((card) => JSON.parse(card));
    const cardsToDownload = parsedCards.filter((card) => {
      return selectedCards.includes(card.id);
    });
    for (const card of cardsToDownload) {
      fileContents = fileContents.concat(
        `${card.word}<br>${card.sampleSentence}    <img src="${card.img}"><br>${card.translatedSampleSentence}`,
      );
    }
    console.log(fileContents);
  };

  return (
    <div className="word-input">
      <form className="word-input-form">
        <input type="text" name="card-subject" ref={textAreaRef}></input>
        <Button variant="primary" disabled={spinner} onClick={handleSubmit}>
          {" "}
          {spinner ? "Generating..." : "Generate"}
        </Button>
        <Button variant="primary" onClick={handleDownload}>
          Download
        </Button>
      </form>
    </div>
  );
};

WordInput.propTypes = {
  setErrors: PropTypes.func,
  userId: PropTypes.string,
};

export default WordInput;