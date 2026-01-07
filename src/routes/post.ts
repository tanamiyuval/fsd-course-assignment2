import express from "express";
import postController from "../controllers/postsController";

const router = express.Router();

router.post("/", postController.create.bind(postController));
router.get("/", postController.getAll.bind(postController));
router.get("/:id", postController.getById.bind(postController));
router.put("/:id", postController.update.bind(postController));

export default router;