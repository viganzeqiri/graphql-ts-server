import { ResolverMap } from "../../types/graphql-utils";
import * as bcrypt from "bcryptjs";
import * as yup from "yup";

import { User } from "../../entity/User";

import { formatYupError } from "../../utils/formatYupError";
import {
	duplicateEmail,
	emailNotLongEnough,
	invalidEmail,
	passwordNotLongEnough
} from "./errorMessages";
import { createConfirmEmailLink } from "../../utils/createConfirmEmailLink";

const schema = yup.object().shape({
	email: yup
		.string()
		.min(3, emailNotLongEnough)
		.max(255)
		.email(invalidEmail),
	password: yup
		.string()
		.min(3)
		.max(255, passwordNotLongEnough)
});

export const resolvers: ResolverMap = {
	Mutation: {
		register: async (
			_,
			args: GQL.IRegisterOnMutationArguments,
			{ redis, url }
		) => {
			try {
				await schema.validate(args, { abortEarly: false });
			} catch (err) {
				return formatYupError(err);
			}

			const { email, password } = args;
			const userAlreadyExists = await User.findOne({
				where: { email },
				select: ["id"]
			});

			if (userAlreadyExists) {
				return [
					{
						path: "email",
						message: duplicateEmail
					}
				];
			}

			const hashedPass = await bcrypt.hash(password, 10);
			const user = User.create({
				email,
				password: hashedPass
			});

			await user.save();

			const link = await createConfirmEmailLink(url, user.id, redis);
			return null;
		}
	}
};
