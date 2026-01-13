import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Posts & Comments API",
			version: "1.0.0",
			description: "A REST API for managing posts and comments",
		},
		servers: [
			{
				url: "http://localhost:3000",
				description: "Development server",
			},
		],
		components: {
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
			},
		},
	},
	apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
