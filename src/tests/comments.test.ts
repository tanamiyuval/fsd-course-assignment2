import request from "supertest";
import initApp from "../index";
import commentModel from "../models/commentModel";
import postsModel from "../models/postsModel";
import userModel from "../models/userModel";
import mongoose from "mongoose";
import { Express } from "express";
import { getLoggedInUser, UserData } from "./utils";

let app: Express;
let commentId = "";
let testPostId = "";
let loginUser: UserData;

beforeAll(async () => {
	app = await initApp();
	await commentModel.deleteMany();
	await postsModel.deleteMany();
	await userModel.deleteMany();

	// First get a logged in user
	loginUser = await getLoggedInUser(app);

	// Create a test post to attach comments to
	const testPost = await postsModel.create({
		content: "Test post for comments",
		createdBy: loginUser._id,
	});
	testPostId = testPost._id.toString();
});

afterAll((done) => {
	done();
});

describe("Comments API", () => {
	test("Initial empty comments", async () => {
		const response = await request(app).get("/comment/post/" + testPostId);
		expect(response.status).toBe(200);
		expect(response.body).toEqual([]);
	});

	test("Create Comment", async () => {
		const comment = { postId: testPostId, content: "This is my first comment", sender: loginUser._id };
		const response = await request(app)
			.post("/comment")
			.set("Authorization", "Bearer " + loginUser.token)
			.send(comment);
		expect(response.status).toBe(201);
		expect(response.body.content).toBe(comment.content);
		expect(response.body.sender).toBe(comment.sender);
		expect(response.body.postId).toBe(comment.postId);
	});

	test("Create second Comment", async () => {
		const comment = { postId: testPostId, content: "This is my second comment", sender: loginUser._id };
		const response = await request(app)
			.post("/comment")
			.set("Authorization", "Bearer " + loginUser.token)
			.send(comment);
		expect(response.status).toBe(201);
		expect(response.body.content).toBe(comment.content);
	});

	test("Get Comments by postId", async () => {
		const response = await request(app).get("/comment/post/" + testPostId);
		expect(response.status).toBe(200);
		expect(response.body.length).toBe(2);
		commentId = response.body[0]._id;
	});

	test("Get Comment by ID", async () => {
		const response = await request(app).get("/comment/" + commentId);
		expect(response.status).toBe(200);
		expect(response.body.content).toBe("This is my first comment");
		expect(response.body._id).toBe(commentId);
	});

	test("Get Comment by ID - not found", async () => {
		const response = await request(app).get("/comment/507f1f77bcf86cd799439099");
		expect(response.status).toBe(404);
	});

	test("Update Comment", async () => {
		const updatedContent = "Updated comment content";
		const response = await request(app)
			.put("/comment/" + commentId)
			.set("Authorization", "Bearer " + loginUser.token)
			.send({ content: updatedContent });
		expect(response.status).toBe(200);
		expect(response.body.content).toBe(updatedContent);
		expect(response.body._id).toBe(commentId);
	});

	test("Update Comment - not found", async () => {
		const response = await request(app)
			.put("/comment/507f1f77bcf86cd799439099")
			.set("Authorization", "Bearer " + loginUser.token)
			.send({ content: "Updated content" });
		expect(response.status).toBe(404);
	});

	test("Delete Comment", async () => {
		const response = await request(app)
			.delete("/comment/" + commentId)
			.set("Authorization", "Bearer " + loginUser.token);
		expect(response.status).toBe(200);

		const getResponse = await request(app).get("/comment/" + commentId);
		expect(getResponse.status).toBe(404);
	});

	test("Delete Comment - not found", async () => {
		const response = await request(app)
			.delete("/comment/507f1f77bcf86cd799439099")
			.set("Authorization", "Bearer " + loginUser.token);
		expect(response.status).toBe(404);
	});

	test("Get Comment by invalid ID - error", async () => {
		const response = await request(app).get("/comment/invalid-id");
		expect(response.status).toBe(400);
	});

	test("Get Comments by invalid postId - error", async () => {
		const response = await request(app).get("/comment/post/invalid-id");
		expect(response.status).toBe(400);
	});

	test("Update Comment with invalid ID - error", async () => {
		const response = await request(app)
			.put("/comment/invalid-id")
			.set("Authorization", "Bearer " + loginUser.token)
			.send({ content: "Updated content" });
		expect(response.status).toBe(400);
	});

	test("Delete Comment with invalid ID - error", async () => {
		const response = await request(app)
			.delete("/comment/invalid-id")
			.set("Authorization", "Bearer " + loginUser.token);
		expect(response.status).toBe(400);
	});

	test("Create Comment - validation error", async () => {
		const response = await request(app)
			.post("/comment")
			.set("Authorization", "Bearer " + loginUser.token)
			.send({});
		expect(response.status).toBe(400);
	});
});
