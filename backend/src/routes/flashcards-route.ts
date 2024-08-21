import express, { Router } from "express";
import { deleteFlashcard, getFlashcardsByUser } from "../controllers/flashcards-controller";

const router: Router = express.Router()

router.get("/", getFlashcardsByUser);
router.delete("/", deleteFlashcard);

// TODO: update the flashcard
// router.put("/flashcards", updateFlashcard);

export default router;