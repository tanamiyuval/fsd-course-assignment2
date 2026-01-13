import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Posts & Comments API",
			version: "1.0.0",
			description: "A REST API for managing posts and comments with user authentication",
		},
		servers: [
			{
				url: "http://localhost:3000",
				description: "Development server",
			},
		],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
					description: "Enter JWT Bearer token",
				},
			},
			schemas: {
				Post: {
					type: "object",
					required: ["content", "createdBy"],
					properties: {
						_id: {
							type: "string",
							description: "The auto-generated id of the post",
						},
						content: {
							type: "string",
							description: "The content of the post",
						},
						createdBy: {
							type: "string",
							description: "The sender/creator of the post",
						},
						comments: {
							type: "array",
							items: {
								type: "string",
							},
							description: "Array of comment IDs",
						},
					},
					example: {
						_id: "60d0fe4f5311236168a109ca",
						content: "This is a sample post",
						createdBy: "john_doe",
						comments: [],
					},
				},
				PostInput: {
					type: "object",
					required: ["content", "createdBy"],
					properties: {
						content: {
							type: "string",
							description: "The content of the post",
						},
						createdBy: {
							type: "string",
							description: "The sender/creator of the post",
						},
					},
					example: {
						content: "This is a sample post",
						createdBy: "john_doe",
					},
				},
				Comment: {
					type: "object",
					required: ["postId", "content", "sender"],
					properties: {
						_id: {
							type: "string",
							description: "The auto-generated id of the comment",
						},
						postId: {
							type: "string",
							description: "The ID of the post this comment belongs to",
						},
						content: {
							type: "string",
							description: "The content of the comment",
						},
						sender: {
							type: "string",
							description: "The sender/author of the comment",
						},
					},
					example: {
						_id: "60d0fe4f5311236168a109cb",
						postId: "60d0fe4f5311236168a109ca",
						content: "This is a sample comment",
						sender: "jane_doe",
					},
				},
				CommentInput: {
					type: "object",
					required: ["postId", "content", "sender"],
					properties: {
						postId: {
							type: "string",
							description: "The ID of the post this comment belongs to",
						},
						content: {
							type: "string",
							description: "The content of the comment",
						},
						sender: {
							type: "string",
							description: "The sender/author of the comment",
						},
					},
					example: {
						postId: "60d0fe4f5311236168a109ca",
						content: "This is a sample comment",
						sender: "jane_doe",
					},
				},
				User: {
					type: "object",
					required: ["email", "username", "password"],
					properties: {
						_id: {
							type: "string",
							description: "User ID (MongoDB ObjectId)",
							example: "507f1f77bcf86cd799439012",
						},
						email: {
							type: "string",
							format: "email",
							description: "User email address",
							example: "user@example.com",
						},
						username: {
							type: "string",
							description: "User username",
							example: "johndoe",
						},
						password: {
							type: "string",
							description: "User password (hashed)",
							example: "password123",
						},
					},
				},
				LoginRequest: {
					type: "object",
					required: ["email", "password"],
					properties: {
						email: {
							type: "string",
							format: "email",
							description: "User email",
							example: "user@example.com",
						},
						password: {
							type: "string",
							description: "User password",
							example: "password123",
						},
					},
				},
				RegisterRequest: {
					type: "object",
					required: ["email", "password", "username"],
					properties: {
						email: {
							type: "string",
							format: "email",
							description: "User email",
							example: "user@example.com",
						},
						username: {
							type: "string",
							description: "User username",
							example: "johndoe",
						},
						password: {
							type: "string",
							minLength: 6,
							description: "User password (minimum 6 characters)",
							example: "password123",
						},
					},
				},
				AuthResponse: {
					type: "object",
					properties: {
						token: {
							type: "string",
							description: "JWT access token",
							example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
						},
						refreshToken: {
							type: "string",
							description: "JWT refresh token",
							example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
						},
						_id: {
							type: "string",
							description: "User ID",
							example: "507f1f77bcf86cd799439012",
						},
					},
				},
				RefreshTokenRequest: {
					type: "object",
					required: ["refreshToken"],
					properties: {
						refreshToken: {
							type: "string",
							description: "JWT refresh token",
							example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
						},
					},
				},
				Error: {
					type: "object",
					properties: {
						message: {
							type: "string",
							description: "Error message",
							example: "An error occurred",
						},
					},
				},
			},
		},
		tags: [
			{
				name: "Authentication",
				description: "User authentication and authorization endpoints",
			},
			{
				name: "Posts",
				description: "Post management endpoints",
			},
			{
				name: "Comments",
				description: "Comment management endpoints",
			},
			{
				name: "Users",
				description: "User management endpoints",
			},
		],
	},
	apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
