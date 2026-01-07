
import postsModel from '../models/postsModel';
import { Request, Response } from "express";

class PostsController {
	model: typeof postsModel;

	constructor() {
		this.model = postsModel;
	}

	async getAll(req: Request, res: Response) {
		if (req.query.sender) {
			return this.getAllBySender(req, res);
		}

		try {
			const data = await this.model.find();
			res.json(data);
		} catch (err) {
			console.error(err);
			res.status(500).send("Error retrieving posts");
		}
	};

	async getAllBySender(req: Request, res: Response) {
		const sender = req.query.sender as string;

		try {
			const filterData = await this.model.find({ createdBy: sender });
			return res.json(filterData);
		} catch (err) {
			console.error(err);
			res.status(500).send("Error retrieving posts");
		}
	}

	async getById(req: Request, res: Response) {
		const id = req.params.id;
		try {
			const data = await this.model.findById(id);
			if (!data) {
				return res.status(404).send("Post not found");
			} else {
				res.json(data);
			}
		} catch (err) {
			console.error(err);
			res.status(500).send("Error retrieving post by ID");
		}
	};

	async create(req: Request, res: Response) {
		const postData = req.body;

		try {
			const data = await this.model.create(postData);
			res.status(201).json(data);
		} catch (err) {
			console.error(err);
			res.status(500).send("Error creating post");
		}
	};

	async update(req: Request, res: Response) {
		const id = req.params.id;
		const updatedData = req.body;
		try {
			const data = await this.model.findByIdAndUpdate(id, updatedData, {
				new: true,
			});
			res.json(data);
		} catch (err) {
			console.error(err);
			res.status(500).send("Error updating post");
		}
	};
}

export default new PostsController();