import express from "express";
import userController from "../controllers/userController";

const router = express.Router();

router.get("/", userController.getAll.bind(userController));
router.get("/:id", userController.getById.bind(userController));
router.put("/:id", userController.update.bind(userController));
router.delete("/:id", userController.delete.bind(userController));

export default router;
