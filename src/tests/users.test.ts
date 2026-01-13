import request from "supertest";
import initApp from "../index";
import userModel from "../models/userModel";
import mongoose, { ObjectId } from "mongoose";
import { Express } from "express";

let app: Express;
let userId = "";

type UserData = { username: string; email: string; password: string; _id?: ObjectId };

const usersList: UserData[] = [
	{ username: "user1", email: "user1@example.com", password: "password1" },
	{ username: "user2", email: "user2@example.com", password: "password2" },
	{ username: "user3", email: "user3@example.com", password: "password3" },
];

beforeAll(async () => {
	app = await initApp();
	await userModel.deleteMany();
});

afterAll(async () => {
	await mongoose.connection.close();
});

describe("Users API", () => {
	test("Initial empty users", async () => {
		const response = await request(app).get("/user");
		expect(response.status).toBe(200);
		expect(response.body).toEqual([]);
	});

	test("Create User", async () => {
		for (const user of usersList) {
			const response = await request(app).post("/user").send(user);
			expect(response.status).toBe(201);
			expect(response.body.username).toBe(user.username);
			expect(response.body.email).toBe(user.email);
		}
	});

	test("Get All Users", async () => {
		const response = await request(app).get("/user");
		expect(response.status).toBe(200);
		expect(response.body.length).toBe(usersList.length);
		userId = response.body[0]._id;
	});

	test("Get User by ID", async () => {
		const response = await request(app).get("/user/" + userId);
		expect(response.status).toBe(200);
		expect(response.body.username).toBe(usersList[0].username);
		expect(response.body.email).toBe(usersList[0].email);
		expect(response.body._id).toBe(userId);
	});

	test("Get User by ID - not found", async () => {
		const response = await request(app).get("/user/507f1f77bcf86cd799439099");
		expect(response.status).toBe(404);
	});

	test("Update User", async () => {
		const updatedEmail = "updated@example.com";
		const response = await request(app)
			.put("/user/" + userId)
			.send({ email: updatedEmail });
		expect(response.status).toBe(200);
		expect(response.body.email).toBe(updatedEmail);
		expect(response.body._id).toBe(userId);
	});

	test("Update User - not found", async () => {
		const response = await request(app)
			.put("/user/507f1f77bcf86cd799439099")
			.send({ email: "updated@example.com" });
		expect(response.status).toBe(404);
	});

	test("Delete User", async () => {
		const response = await request(app).delete("/user/" + userId);
		expect(response.status).toBe(200);

		const getResponse = await request(app).get("/user/" + userId);
		expect(getResponse.status).toBe(404);
	});

	test("Delete User - not found", async () => {
		const response = await request(app).delete("/user/507f1f77bcf86cd799439099");
		expect(response.status).toBe(404);
	});

	test("Get User by invalid ID - error", async () => {
		const response = await request(app).get("/user/invalid-id");
		expect(response.status).toBe(500);
	});

	test("Update User with invalid ID - error", async () => {
		const response = await request(app)
			.put("/user/invalid-id")
			.send({ email: "updated@example.com" });
		expect(response.status).toBe(500);
	});

	test("Delete User with invalid ID - error", async () => {
		const response = await request(app).delete("/user/invalid-id");
		expect(response.status).toBe(500);
	});

	test("Create User - validation error", async () => {
		const response = await request(app).post("/user").send({});
		expect(response.status).toBe(500);
	});
});