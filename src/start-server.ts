import { GraphQLServer } from "graphql-yoga";
import { genSchema } from "./utils/genSchema";
import * as Redis from "ioredis";

import { createTypeOrmConn } from "./utils/createTypeORMconnection";
import { User } from "./entity/User";

export const startServer = async () => {
	const redis = new Redis();

	const server = new GraphQLServer({
		schema: genSchema(),
		context: ({ request }) => ({
			redis,
			url: request.protocol + "://" + request.get("host")
		})
	});

	server.express.get("/confirm/:id", async (req, res) => {
		const { id } = req.params;
		const userId = await redis.get(id);
		if (userId) {
			await User.update({ id: userId }, { confirmed: true });
			res.send("ok");
		} else {
			res.send("invalid");
		}
	});

	await createTypeOrmConn();

	const app = await server.start({
		port: process.env.NODE_ENV === "test" ? 0 : 4000
	});
	console.log("Server is running on localhost:4000");

	return app;
};
