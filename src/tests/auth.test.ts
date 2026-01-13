import request from "supertest";
import initApp from "../index";
import userModel from "../models/userModel";
import postsModel from "../models/postsModel";
import mongoose from "mongoose";
import { Express } from "express";
import { createUserData, UserData } from "./utils";

let app: Express;
let userData: UserData;

beforeAll(async () => {
	app = await initApp();
	await userModel.deleteMany();
	await postsModel.deleteMany();
	userData = createUserData();
});

afterAll((done) => {
	done();
});

describe("Auth API", () => {
	test("Test Registration", async () => {
		const { email, password, username } = userData;
		const response = await request(app)
			.post("/auth/register")
			.send({ email, password, username });
		expect(response.status).toBe(201);
		expect(response.body).toHaveProperty("token");
		expect(response.body).toHaveProperty("refreshToken");
		expect(response.body).toHaveProperty("_id");
		userData.token = response.body.token;
		userData.refreshToken = response.body.refreshToken;
		userData._id = response.body._id;
	});

	test("Test Registration - missing fields", async () => {
		const response = await request(app)
			.post("/auth/register")
			.send({ email: "incomplete@test.com" });
		expect(response.status).toBe(400);
		expect(response.body.message).toBe(
			"Email, password and username are required"
		);
	});

	test("Test Registration - duplicate user", async () => {
		const { email, password, username } = userData;
		const response = await request(app)
			.post("/auth/register")
			.send({ email, password, username });
		expect(response.status).toBe(409);
		expect(response.body.message).toBe("User already exists");
	});

	test("Test Login", async () => {
		const { email, password } = userData;
		const response = await request(app)
			.post("/auth/login")
			.send({ email, password });
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty("token");
		expect(response.body).toHaveProperty("refreshToken");
		userData.token = response.body.token;
		userData.refreshToken = response.body.refreshToken;
	});

	test("Test Login - missing fields", async () => {
		const response = await request(app)
			.post("/auth/login")
			.send({ email: "test@test.com" });
		expect(response.status).toBe(400);
		expect(response.body.message).toBe("Email and password are required");
	});

	test("Test Login - invalid email", async () => {
		const response = await request(app)
			.post("/auth/login")
			.send({ email: "wrong@test.com", password: "testpass" });
		expect(response.status).toBe(401);
		expect(response.body.message).toBe("Invalid email or password");
	});

	test("Test Login - invalid password", async () => {
		const { email } = userData;
		const response = await request(app)
			.post("/auth/login")
			.send({ email, password: "wrongpassword" });
		expect(response.status).toBe(401);
		expect(response.body.message).toBe("Invalid email or password");
	});

	test("Test Refresh Token", async () => {
		const response = await request(app)
			.post("/auth/refresh")
			.send({ refreshToken: userData.refreshToken });
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty("token");
		expect(response.body).toHaveProperty("refreshToken");
		userData.token = response.body.token;
		userData.refreshToken = response.body.refreshToken;
	});

	test("Test Refresh Token - missing token", async () => {
		const response = await request(app).post("/auth/refresh").send({});
		expect(response.status).toBe(400);
		expect(response.body.message).toBe("Refresh token is required");
	});

	test("Test Refresh Token - invalid token", async () => {
		const response = await request(app)
			.post("/auth/refresh")
			.send({ refreshToken: "invalid-token" });
		expect(response.status).toBe(401);
		expect(response.body.message).toBe("Invalid refresh token");
	});

	test("Test double use of refresh token fails", async () => {
		// Get current refresh token
		const oldRefreshToken = userData.refreshToken;

		// Use the refresh token to get new tokens
		const refreshResponse1 = await request(app)
			.post("/auth/refresh")
			.send({ refreshToken: oldRefreshToken });
		expect(refreshResponse1.status).toBe(200);
		expect(refreshResponse1.body).toHaveProperty("token");
		const newRefreshToken = refreshResponse1.body.refreshToken;
		userData.refreshToken = newRefreshToken;

		// Try to use the same (old) refresh token again - should fail
		const refreshResponse2 = await request(app)
			.post("/auth/refresh")
			.send({ refreshToken: oldRefreshToken });
		expect(refreshResponse2.status).toBe(401);

		// After token theft detection, the new refresh token should also be invalidated
		const refreshResponse3 = await request(app)
			.post("/auth/refresh")
			.send({ refreshToken: newRefreshToken });
		expect(refreshResponse3.status).toBe(401);
	});

	test("Test Logout", async () => {
		// First login to get fresh tokens
		const loginResponse = await request(app)
			.post("/auth/login")
			.send({ email: userData.email, password: userData.password });
		expect(loginResponse.status).toBe(200);
		userData.token = loginResponse.body.token;
		userData.refreshToken = loginResponse.body.refreshToken;

		// Logout
		const logoutResponse = await request(app)
			.post("/auth/logout")
			.send({ refreshToken: userData.refreshToken });
		expect(logoutResponse.status).toBe(200);
		expect(logoutResponse.body.message).toBe("Logged out successfully");

		// Try to use the refresh token after logout - should fail
		const refreshResponse = await request(app)
			.post("/auth/refresh")
			.send({ refreshToken: userData.refreshToken });
		expect(refreshResponse.status).toBe(401);
	});

	test("Test Logout - missing token", async () => {
		const response = await request(app).post("/auth/logout").send({});
		expect(response.status).toBe(400);
		expect(response.body.message).toBe("Refresh token is required");
	});

	test("Test Logout - invalid token", async () => {
		const response = await request(app)
			.post("/auth/logout")
			.send({ refreshToken: "invalid-token" });
		expect(response.status).toBe(401);
		expect(response.body.message).toBe("Invalid refresh token");
	});
});
