import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend the Request interface to include user property
export type AuthRequest = Request & { user?: { _id: string } };

export const authenticate = (
	req: AuthRequest,
	res: Response,
	next: NextFunction
) => {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({ message: "Access token required" });
	}
	const token = authHeader.split(" ")[1];
	if (!token) {
		return res.status(401).json({ message: "Access token required" });
	}
	const secret = process.env.JWT_SECRET || "default_secret";
	try {
		const decoded = jwt.verify(token, secret) as { _id: string };
		req.user = { _id: decoded._id };
		next();
	} catch (err) {
		return res.status(401).json({ message: "Invalid or expired token" });
	}
};
