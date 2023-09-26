import React, { useRef } from "react";
import PropTypes from 'prop-types';

const WordInput = ({ generateCard, spinner }) => {
  const textAreaRef = useRef(null);
    const handleSubmit = (e) => {
        e.preventDefault();
        const wordList = textAreaRef.current.value;
        for (const [index, word] of wordList.split(',').entries()) {
          console.log(`WordInput.handleSubmit - \${index}:\${word.trim()}: ${index}:${word.trim()}`)
          generateCard(word)
        }
    }
  return (
    <div className="word-input">
        <form onSubmit={handleSubmit}>
            <input type='text' name='card-subject' ref={textAreaRef}></input>
            {!spinner && <button>Generate Flashcards</button>}
        </form>
    </div>
  );
}

WordInput.propTypes = {
  generateCard: PropTypes.func,
  spinner: PropTypes.bool, 
  setAllCardData: PropTypes.func,
  allCardData: PropTypes.arrayOf(PropTypes.object)
}

export default WordInput;