import z from "zod";
import { BrickSchema, CollectionContentSchema } from "./bricks.js";

const slugRegex = /^[a-zA-Z0-9-_/]+$/;
const slugSchema = z
	.string()
	.refine(
		(slug) =>
			slug === null ||
			slug === undefined ||
			(typeof slug === "string" && slug.length === 0) ||
			(typeof slug === "string" &&
				slug.length >= 2 &&
				slugRegex.test(slug)),
		{
			message:
				"Slug must be at least 2 characters long and contain only letters, numbers, hyphens, and underscores",
		},
	);

export default {
	upsertSingle: {
		body: z.object({
			collection_key: z.string(),
			document_id: z.number().optional(),
			slug: slugSchema.optional(),
			homepage: z.boolean().optional(),
			parent_id: z.number().nullable().optional(),
			category_ids: z.array(z.number()).optional(),
			bricks: z.array(BrickSchema).optional(),
			content: CollectionContentSchema.optional(),
		}),
		query: undefined,
		params: undefined,
	},
	getSingle: {
		query: z.object({
			include: z.array(z.enum(["bricks"])).optional(),
		}),
		params: z.object({
			id: z.string(),
		}),
		body: undefined,
	},
};
