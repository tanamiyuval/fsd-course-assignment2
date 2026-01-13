import express from "express";
import userController from "../controllers/userController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", authenticate, userController.getAll.bind(userController));
router.get("/:id", authenticate, userController.getById.bind(userController));
router.put("/:id", authenticate, userController.update.bind(userController));
router.delete("/:id", authenticate, userController.delete.bind(userController));

export default router;
