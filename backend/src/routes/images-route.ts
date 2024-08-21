import express, { Router } from "express";
import { postImage, getImage } from "../controllers/images-controller";

const router: Router = express.Router()

router.get("/", getImage);
router.post("/", postImage);

// TODO: Delete images
// router.delete("/", deleteImage);
  
export default router;