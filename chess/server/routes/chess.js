import express from "express";
import { getNextMove } from "../controllers/chessController.js";

const router = express.Router();

router.post("/next-move", getNextMove);

export default router;
