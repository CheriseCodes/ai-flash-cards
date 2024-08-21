import express, { Router } from "express";
import { getSentence } from "../controllers/sentences-controller";

const router: Router = express.Router()

router.get("/", getSentence);

export default router;