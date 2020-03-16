import { ResolverMap } from "../../types/graphql-utils";
import * as bcrypt from "bcryptjs";

import { User } from "../../entity/User";

export const resolvers: ResolverMap = {
	Mutation: {
		register: async (
			_,
			{ email, password }: GQL.IRegisterOnMutationArguments
		) => {
			const hashedPass = await bcrypt.hash(password, 10);
			const user = User.create({
				email,
				password: hashedPass
			});
			await user.save();
			return true;
		}
	}
};
