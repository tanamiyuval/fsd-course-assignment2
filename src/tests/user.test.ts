import request from "supertest";
import initApp from "../index";
import userModel from "../models/userModel";
import mongoose from "mongoose";
import { Express } from "express";
import { getLoggedInUser, UserData } from "./utils";

let app: Express;
let loginUser: UserData;
let userId: string;

beforeAll(async () => {
	app = await initApp();
	await userModel.deleteMany();
	loginUser = await getLoggedInUser(app);
	userId = loginUser._id;
});

afterAll((done) => {
	done();
});

describe("User API", () => {
	test("Get all users", async () => {
		const response = await request(app)
			.get("/user")
			.set("Authorization", "Bearer " + loginUser.token);
		expect(response.status).toBe(200);
		expect(response.body.length).toBeGreaterThan(0);
		// Password should not be returned
		expect(response.body[0]).not.toHaveProperty("password");
	});

	test("Get user by ID", async () => {
		const response = await request(app)
			.get("/user/" + userId)
			.set("Authorization", "Bearer " + loginUser.token);
		expect(response.status).toBe(200);
		expect(response.body._id).toBe(userId);
		expect(response.body.username).toBe(loginUser.username);
		// Password should not be returned
		expect(response.body).not.toHaveProperty("password");
	});

	test("Get user by ID - not found", async () => {
		const response = await request(app)
			.get("/user/507f1f77bcf86cd799439099")
			.set("Authorization", "Bearer " + loginUser.token);
		expect(response.status).toBe(404);
	});

	test("Get user by invalid ID - error", async () => {
		const response = await request(app)
			.get("/user/invalid-id")
			.set("Authorization", "Bearer " + loginUser.token);
		expect(response.status).toBe(500);
	});

	test("Update user", async () => {
		const updatedUsername = "updateduser";
		const response = await request(app)
			.put("/user/" + userId)
			.set("Authorization", "Bearer " + loginUser.token)
			.send({ username: updatedUsername });
		expect(response.status).toBe(200);
		expect(response.body.username).toBe(updatedUsername);
		// Update back for other tests
		loginUser.username = updatedUsername;
	});

	test("Update user - not found", async () => {
		const response = await request(app)
			.put("/user/507f1f77bcf86cd799439099")
			.set("Authorization", "Bearer " + loginUser.token)
			.send({ username: "newname" });
		expect(response.status).toBe(404);
	});

	test("Update user with invalid ID - error", async () => {
		const response = await request(app)
			.put("/user/invalid-id")
			.set("Authorization", "Bearer " + loginUser.token)
			.send({ username: "newname" });
		expect(response.status).toBe(500);
	});

	test("Delete user - not found", async () => {
		const response = await request(app)
			.delete("/user/507f1f77bcf86cd799439099")
			.set("Authorization", "Bearer " + loginUser.token);
		expect(response.status).toBe(404);
	});

	test("Delete user with invalid ID - error", async () => {
		const response = await request(app)
			.delete("/user/invalid-id")
			.set("Authorization", "Bearer " + loginUser.token);
		expect(response.status).toBe(500);
	});

	test("Delete user", async () => {
		// Create a user to delete
		const registerResponse = await request(app).post("/auth/register").send({
			email: "deleteuser@test.com",
			password: "testpass",
			username: "userToDelete",
		});
		expect(registerResponse.status).toBe(201);
		const deleteUserId = registerResponse.body._id;
		const deleteUserToken = registerResponse.body.token;

		const response = await request(app)
			.delete("/user/" + deleteUserId)
			.set("Authorization", "Bearer " + deleteUserToken);
		expect(response.status).toBe(200);

		// Verify user is deleted
		const getResponse = await request(app)
			.get("/user/" + deleteUserId)
			.set("Authorization", "Bearer " + loginUser.token);
		expect(getResponse.status).toBe(404);
	});
});
