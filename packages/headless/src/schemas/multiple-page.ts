import z from "zod";
import { BrickSchema } from "./bricks.js";
import defaultQuery from "./default-query.js";

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
	createSingle: {
		body: z.object({
			slug: slugSchema,
			collection_key: z.string(),
			homepage: z.boolean().optional(),
			published: z.boolean().optional(),
			parent_id: z.number().optional(),
			category_ids: z.array(z.number()).optional(),
			title_translations: z
				.array(
					z.object({
						language_id: z.number(),
						value: z.string().nullable(),
					}),
				)
				.min(1),
			excerpt_translations: z
				.array(
					z.object({
						language_id: z.number(),
						value: z.string().nullable(),
					}),
				)
				.optional(),
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
	updateSingle: {
		body: z.object({
			slug: slugSchema.optional(),
			homepage: z.boolean().optional(),
			published: z.boolean().optional(),
			parent_id: z.number().optional().nullable(),
			category_ids: z.array(z.number()).optional(),
			title_translations: z
				.array(
					z.object({
						language_id: z.number(),
						value: z.string().nullable(),
					}),
				)
				.optional(),
			excerpt_translations: z
				.array(
					z.object({
						language_id: z.number(),
						value: z.string().nullable(),
					}),
				)
				.optional(),
			bricks: z.array(BrickSchema).optional(),
		}),
		query: undefined,
		params: z.object({
			id: z.string(),
		}),
	},
	deleteSingle: {
		body: undefined,
		query: undefined,
		params: z.object({
			id: z.string(),
		}),
	},
	deleteMultiple: {
		body: z.object({
			ids: z.array(z.number()),
		}),
		query: undefined,
		params: undefined,
	},
	getMultiple: {
		query: z.object({
			filter: z
				.object({
					collection_key: z
						.union([z.string(), z.array(z.string())])
						.optional(),
					title: z.string().optional(),
					slug: z.string().optional(),
					full_slug: z.string().optional(),
					category_id: z
						.union([z.string(), z.array(z.string())])
						.optional(),
				})
				.optional(),
			sort: z
				.array(
					z.object({
						key: z.enum([
							"created_at",
							"updated_at",
							"title",
							"published_at",
						]),
						value: z.enum(["asc", "desc"]),
					}),
				)
				.optional(),
			include: defaultQuery.include,
			exclude: defaultQuery.exclude,
			page: defaultQuery.page,
			per_page: defaultQuery.per_page,
		}),
		params: undefined,
		body: undefined,
	},
	getMultipleValidParents: {
		query: z.object({
			filter: z
				.object({
					collection_key: z.string().optional(),
					title: z.string().optional(),
					category_id: z
						.union([z.string(), z.array(z.string())])
						.optional(),
				})
				.optional(),
			sort: z
				.array(
					z.object({
						key: z.enum(["created_at", "updated_at", "title"]),
						value: z.enum(["asc", "desc"]),
					}),
				)
				.optional(),
			include: defaultQuery.include,
			exclude: defaultQuery.exclude,
			page: defaultQuery.page,
			per_page: defaultQuery.per_page,
		}),
		params: z.object({
			id: z.string(),
		}),
		body: undefined,
	},
};