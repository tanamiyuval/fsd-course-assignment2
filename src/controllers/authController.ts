import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel";

const sendError = (code: number, message: string, res: Response) => {
	res.status(code).json({ message });
};

type GeneratedTokens = {
	token: string;
	refreshToken: string;
	_id?: string;
};

const generateTokens = (userId: string): GeneratedTokens => {
	const secret = process.env.JWT_SECRET || "default_secret";
	const expiresIn = parseInt(process.env.JWT_EXPIRES_IN || "3600");
	const token = jwt.sign({ _id: userId }, secret, { expiresIn: expiresIn });

	const refreshExpiresIn = parseInt(
		process.env.REFRESH_TOKEN_EXPIRES_IN || "604800"
	); // 7 days default
	const rand = Math.floor(Math.random() * 1000);
	const refreshToken = jwt.sign({ _id: userId, rand: rand }, secret, {
		expiresIn: refreshExpiresIn,
	});
	return { token, refreshToken };
};

const register = async (req: Request, res: Response) => {
	const { email, password, username } = req.body;
	if (!email || !password || !username) {
		return sendError(400, "Email, password and username are required", res);
	}
	try {
		const existingUser = await userModel.findOne({
			$or: [{ email }, { username }],
		});
		if (existingUser) {
			return sendError(409, "User already exists", res);
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		const user = await userModel.create({
			email,
			password: hashedPassword,
			username,
		});

		const tokens = generateTokens(user._id.toString());
		user.refreshTokens.push(tokens.refreshToken);
		await user.save();

		res.status(201).json({
			token: tokens.token,
			refreshToken: tokens.refreshToken,
			_id: user._id,
		});
	} catch (err) {
		console.error(err);
		return sendError(500, "Internal server error", res);
	}
};

const login = async (req: Request, res: Response) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return sendError(400, "Email and password are required", res);
	}
	try {
		const user = await userModel.findOne({ email });
		if (!user) {
			return sendError(401, "Invalid email or password", res);
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return sendError(401, "Invalid email or password", res);
		}

		const tokens = generateTokens(user._id.toString());
		user.refreshTokens.push(tokens.refreshToken);
		await user.save();

		res.status(200).json({
			token: tokens.token,
			refreshToken: tokens.refreshToken,
			_id: user._id,
		});
	} catch (err) {
		console.error(err);
		return sendError(500, "Internal server error", res);
	}
};

const refreshToken = async (req: Request, res: Response) => {
	const { refreshToken } = req.body;
	if (!refreshToken) {
		return sendError(400, "Refresh token is required", res);
	}

	const secret = process.env.JWT_SECRET || "default_secret";
	try {
		const decoded = jwt.verify(refreshToken, secret) as { _id: string };
		const user = await userModel.findById(decoded._id);
		if (!user) {
			return sendError(401, "Invalid refresh token", res);
		}

		if (!user.refreshTokens.includes(refreshToken)) {
			user.refreshTokens = [];
			await user.save();
			console.log("**** Possible token theft for user:", user._id);
			return sendError(401, "Invalid refresh token", res);
		}

		const tokens = generateTokens(decoded._id);
		user.refreshTokens = user.refreshTokens.filter(
			(token) => token !== refreshToken
		);
		user.refreshTokens.push(tokens.refreshToken);
		await user.save();

		res.status(200).json({
			token: tokens.token,
			refreshToken: tokens.refreshToken,
			_id: user._id,
		});
	} catch (err) {
		return sendError(401, "Invalid refresh token", res);
	}
};

const logout = async (req: Request, res: Response) => {
	const { refreshToken } = req.body;
	if (!refreshToken) {
		return sendError(400, "Refresh token is required", res);
	}

	const secret = process.env.JWT_SECRET || "default_secret";
	try {
		const decoded = jwt.verify(refreshToken, secret) as { _id: string };
		const user = await userModel.findById(decoded._id);
		if (!user) {
			return sendError(401, "Invalid refresh token", res);
		}

		// Remove the refresh token from user's tokens
		user.refreshTokens = user.refreshTokens.filter(
			(token) => token !== refreshToken
		);
		await user.save();

		res.status(200).json({ message: "Logged out successfully" });
	} catch (err) {
		return sendError(401, "Invalid refresh token", res);
	}
};

export default {
	register,
	login,
	refreshToken,
	logout,
};
