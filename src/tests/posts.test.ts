import request from "supertest";
import initApp from "../index";
import postsModel from "../models/postsModel";
import mongoose, { ObjectId } from "mongoose";
import { Express } from "express";

let app: Express;
let postId = "";

type PostData = { content: string; createdBy: string; _id?: ObjectId };

const postsList: PostData[] = [
	{ content: "This is my first post", createdBy: "user1" },
	{ content: "This is my second post", createdBy: "user2" },
	{ content: "This is my third post", createdBy: "user1" },
];

beforeAll(async () => {
	app = await initApp();
	await postsModel.deleteMany();
});

afterAll(async () => {
	await mongoose.connection.close();
});

describe("Posts API", () => {
	test("Initial empty posts", async () => {
		const response = await request(app).get("/post");
		expect(response.status).toBe(200);
		expect(response.body).toEqual([]);
	});

	test("Create Post", async () => {
		for (const post of postsList) {
			const response = await request(app).post("/post").send(post);
			expect(response.status).toBe(201);
			expect(response.body.content).toBe(post.content);
			expect(response.body.createdBy).toBe(post.createdBy);
		}
	});

	test("Get All Posts", async () => {
		const response = await request(app).get("/post");
		expect(response.status).toBe(200);
		expect(response.body.length).toBe(postsList.length);
	});

	test("Get Posts by sender", async () => {
		const response = await request(app).get("/post?sender=" + postsList[0].createdBy);
		expect(response.status).toBe(200);
		expect(response.body.length).toBe(2);
		expect(response.body[0].createdBy).toBe(postsList[0].createdBy);
		postId = response.body[0]._id;
	});

	test("Get Post by ID", async () => {
		const response = await request(app).get("/post/" + postId);
		expect(response.status).toBe(200);
		expect(response.body.content).toBe(postsList[0].content);
		expect(response.body.createdBy).toBe(postsList[0].createdBy);
		expect(response.body._id).toBe(postId);
	});

	test("Get Post by ID - not found", async () => {
		const response = await request(app).get("/post/507f1f77bcf86cd799439099");
		expect(response.status).toBe(404);
	});

	test("Update Post", async () => {
		const updatedContent = "Updated post content";
		const response = await request(app)
			.put("/post/" + postId)
			.send({ content: updatedContent });
		expect(response.status).toBe(200);
		expect(response.body.content).toBe(updatedContent);
		expect(response.body._id).toBe(postId);
	});

	test("Get Post by invalid ID - error", async () => {
		const response = await request(app).get("/post/invalid-id");
		expect(response.status).toBe(500);
	});

	test("Update Post with invalid ID - error", async () => {
		const response = await request(app)
			.put("/post/invalid-id")
			.send({ content: "Updated content" });
		expect(response.status).toBe(500);
	});

	test("Create Post - validation error", async () => {
		const response = await request(app).post("/post").send({});
		expect(response.status).toBe(500);
	});
});
