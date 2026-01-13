import request from "supertest";
import initApp from "../index";
import postsModel from "../models/postsModel";
import userModel from "../models/userModel";
import mongoose from "mongoose";
import { Express } from "express";
import { getLoggedInUser, UserData } from "./utils";

let app: Express;
let postId = "";
let loginUser: UserData;

beforeAll(async () => {
	app = await initApp();
	await postsModel.deleteMany();
	await userModel.deleteMany();
	loginUser = await getLoggedInUser(app);
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

	test("Create Post without token fails", async () => {
		const post = { content: "This is my first post", createdBy: loginUser._id };
		const response = await request(app).post("/post").send(post);
		expect(response.status).toBe(401);
	});

	test("Create Post with invalid token fails", async () => {
		const post = { content: "This is my first post", createdBy: loginUser._id };
		const response = await request(app)
			.post("/post")
			.set("Authorization", "Bearer invalid-token")
			.send(post);
		expect(response.status).toBe(401);
	});

	test("Create Post with token", async () => {
		const post = { content: "This is my first post", createdBy: loginUser._id };
		const response = await request(app)
			.post("/post")
			.set("Authorization", "Bearer " + loginUser.token)
			.send(post);
		expect(response.status).toBe(201);
		expect(response.body.content).toBe(post.content);
		expect(response.body.createdBy).toBe(post.createdBy);
		postId = response.body._id;
	});

	test("Create second Post", async () => {
		const post = { content: "This is my second post", createdBy: loginUser._id };
		const response = await request(app)
			.post("/post")
			.set("Authorization", "Bearer " + loginUser.token)
			.send(post);
		expect(response.status).toBe(201);
		expect(response.body.content).toBe(post.content);
	});

	test("Get All Posts", async () => {
		const response = await request(app).get("/post");
		expect(response.status).toBe(200);
		expect(response.body.length).toBe(2);
	});

	test("Get Posts by sender", async () => {
		const response = await request(app).get("/post?sender=" + loginUser._id);
		expect(response.status).toBe(200);
		expect(response.body.length).toBe(2);
		expect(response.body[0].createdBy).toBe(loginUser._id);
	});

	test("Get Post by ID", async () => {
		const response = await request(app).get("/post/" + postId);
		expect(response.status).toBe(200);
		expect(response.body.content).toBe("This is my first post");
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
			.set("Authorization", "Bearer " + loginUser.token)
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
			.set("Authorization", "Bearer " + loginUser.token)
			.send({ content: "Updated content" });
		expect(response.status).toBe(500);
	});

	test("Create Post - validation error", async () => {
		const response = await request(app)
			.post("/post")
			.set("Authorization", "Bearer " + loginUser.token)
			.send({});
		expect(response.status).toBe(500);
	});
});
