import { GraphQLServer } from "graphql-yoga";
import { genSchema } from "./utils/genSchema";

import { createTypeOrmConn } from "./utils/createTypeORMconnection";

export const startServer = async () => {
	const server = new GraphQLServer({
		schema: genSchema()
	});

	await createTypeOrmConn();

	const app = await server.start({
		port: process.env.NODE_ENV === "test" ? 0 : 4000
	});
	console.log("Server is running on localhost:4000");

	return app;
};
