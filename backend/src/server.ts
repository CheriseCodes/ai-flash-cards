import express, { Application } from "express";
import { Request, Response } from 'express';
import bodyParser from "body-parser";
import cors from "cors";

import { jwtCheck } from "./clients/auth0";

import flashCardsRoute from './routes/flashcards-route';
import imagesRoute from './routes/images-route';
import sentencesRoute from './routes/sentences-route';

export const app: Application = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const authMiddleware = jwtCheck;

app.use('/flashcards', authMiddleware, flashCardsRoute);
app.use('/images', authMiddleware, imagesRoute);
app.use('/sentences', authMiddleware, sentencesRoute);

app.get("/service/readyz", (req: Request, res: Response) => res.status(200).json({ readyz: {status: "ok" }}));
app.get("/service/livez", (req: Request, res: Response) => res.status(200).json({ livez: {status: "ok" }}));
app.get("/callback", async (req: Request, res: Response) => {
  res.send({"data": "callback"});
});

