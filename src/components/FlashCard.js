import React, { useRef, useState } from "react";
import PropTypes from 'prop-types';


const FlashCard = ({cardData, setAllCardData, allCardData, replaceCard, languageLevel, languageMode }) => {
 const wordRef = useRef(null)
 const originalRef = useRef(null)
 const translationRef = useRef(null)
 const [ regenerateCardSpinner, setRegenerateCardSpinner ] = useState(false)
 const [ enableEdit, setEnableEdit ] = useState(false)

 const [ generateCardCount, setGenerateCardCount ] = useState(0)

 const cardDataJSON = JSON.parse(cardData)
 const [ selected, setSelected ] = useState(false)

  const handleDeletion = () => {
    setAllCardData(prev => prev.filter((prevSingleCardData) => {
        return prevSingleCardData !== cardData
    }))
  }

  const handleEdit = (e) => {
    if (enableEdit) {
        e.target.innerText = 'Edit'
    } else {
        e.target.innerText = 'Save Edit'
    }
    setEnableEdit(curr => !curr)
    console.log(e)
    
  }


  const handleRegenerateCard = async () => {
    try {
        setRegenerateCardSpinner(true)
        const textGenUrl = `http://localhost:8000/openai/test/text?word=${cardDataJSON.word}&lang_mode=${languageMode}&lang_level=${languageLevel}`;
        
        console.log(`FlashCard.handleRegenerateCard - ${textGenUrl}`)
        const response = await fetch(textGenUrl)
        const json = await response.json()
        console.log(`generateCards response:${JSON.stringify(json)}`)
        let newCardData = json.choices[0].message.content; // stringified JSON
        setGenerateCardCount(curr => curr+1); // TODO: Remove when done testing
        newCardData = JSON.parse(newCardData)
        const imageGenUrl = `http://localhost:8000/openai/test/imagine?sentence=${newCardData.tr}`
        const imageResponse = await fetch(imageGenUrl)
        const imageJson = await imageResponse.json()
        console.log(`newCardData JSON - ${newCardData}`)
        newCardData.id = cardDataJSON.id
        newCardData.img = imageJson.data[0].url
        newCardData.or = String(generateCardCount) + newCardData.or
        newCardData.tr = String(generateCardCount) + newCardData.tr 
        newCardData = JSON.stringify(newCardData)
        console.log(`FlashCard.js - newCardData : ${newCardData}`);
        replaceCard(cardData, newCardData)
        console.log(`FlashCard.js - allCardData: ${allCardData}`)
        setRegenerateCardSpinner(false)
    } catch (e) {
        console.error(e)
    }
  }

  return (
    <>
        {!regenerateCardSpinner && <div className={`flash-card ${selected ? 'selected-flashcard' : 'unselected-flashcard'}`}>
                <input ref={wordRef} defaultValue={cardDataJSON.word} disabled='disabled'></input>
                <input ref={originalRef} defaultValue={cardDataJSON.or} disabled={enableEdit ? '' : 'disabled'}></input>
                <img src={cardDataJSON.img}></img>
                <input ref={translationRef} defaultValue={cardDataJSON.tr} disabled={enableEdit ? '' : 'disabled'}></input>
                <input type="checkbox" onChange={() => setSelected(curr => !curr)}></input>
                <div className="controls">
                    <div onClick={handleDeletion}>X</div>
                    <p onClick={handleRegenerateCard}>Regenerate</p>
                    <p onClick={handleEdit}>Edit</p>
                </div>
            </div>}
            {regenerateCardSpinner && <p>Generating...</p>}
    </>
    );
}

FlashCard.propTypes = {
    cardData: PropTypes.string, 
    setAllCardData: PropTypes.func,
    allCardData: PropTypes.arrayOf(PropTypes.string),
    replaceCard: PropTypes.func,
    languageLevel: PropTypes.string,
    languageMode: PropTypes.string
  }

export default FlashCard;