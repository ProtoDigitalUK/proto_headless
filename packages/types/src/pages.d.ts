import type { BrickFieldT } from "../../headless/src/schemas/bricks.js";
import type { FieldTypes } from "../../headless/src/builders/brick-builder/types.js";

export interface PagesResT {
	id: number;
	environment_key: string;
	parent_id: number | null;
	collection_key: string;

	translations: {
		title: string | null;
		slug: string | null;
		excerpt: string | null;
		language_id: number;
	}[];
	homepage: boolean;

	default_title: string | null;
	default_slug: string | null;
	default_excerpt: string | null;

	created_by: number | null;
	created_at: string;
	updated_at: string;

	published: boolean;
	published_at: string | null;

	author: {
		id: number | null;
		email: string | null;
		first_name: string | null;
		last_name: string | null;
		username: string | null;
	} | null;

	categories?: Array<number> | null;
	bricks?: Array<BrickResT> | null;
}

export interface SinglePagesResT {
	id: number;
	bricks: Array<BrickResT>;
}

export type FieldTypes = FieldTypes;
