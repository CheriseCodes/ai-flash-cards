import React, { useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";
import generateCard from "../utils.js";

const WordInput = ({ setSpinner, spinner }) => {
  const languageLevel = useSelector((state) => state.languageLevel);
  const languageMode = useSelector((state) => state.languageMode);
  const dispatch = useDispatch();
  const textAreaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const wordList = textAreaRef.current.value;
    for (const [index, word] of wordList.split(",").entries()) {
      console.log(
        `WordInput.handleSubmit - \${index}:\${word.trim()}: ${index}:${word.trim()}`,
      );
      generateCard(
        dispatch,
        setSpinner,
        true,
        word,
        languageMode,
        languageLevel,
      );
    }
  };
  return (
    <div className="word-input">
      <form onSubmit={handleSubmit}>
        <input type="text" name="card-subject" ref={textAreaRef}></input>
        {!spinner && <button>Generate Flashcards</button>}
      </form>
    </div>
  );
};

WordInput.propTypes = {
  setSpinner: PropTypes.func,
  spinner: PropTypes.bool,
};

export default WordInput;
