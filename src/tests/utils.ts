import request from "supertest";
import { Express } from "express";

export type UserData = {
	email: string;
	password: string;
	username: string;
	_id: string;
	token: string;
	refreshToken: string;
};

export const createUserData = (): UserData => {
	const uniqueId = Math.random().toString(36).substring(2, 10);
	return {
		email: `test_${uniqueId}@test.com`,
		password: "testpass",
		username: `testuser_${uniqueId}`,
		_id: "",
		token: "",
		refreshToken: "",
	};
};

export const getLoggedInUser = async (app: Express): Promise<UserData> => {
	const userData = createUserData();
	const { email, password, username } = userData;
	let response = await request(app)
		.post("/auth/register")
		.send({ email, password, username });
	if (response.status !== 201) {
		response = await request(app)
			.post("/auth/login")
			.send({ email, password });
	}
	const loggedUser: UserData = {
		_id: response.body._id,
		token: response.body.token,
		refreshToken: response.body.refreshToken,
		email,
		password,
		username,
	};
	return loggedUser;
};

export type PostData = { content: string; createdBy: string; _id?: string };

export const postsList: PostData[] = [
	{ content: "This is my first post", createdBy: "user1" },
	{ content: "This is my second post", createdBy: "user2" },
	{ content: "This is my third post", createdBy: "user1" },
];
