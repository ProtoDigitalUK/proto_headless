import type z from "zod";
import type { FieldSchema } from "../schemas/collection-fields.js";
import type {
	MediaType,
	FieldResponseValue,
	PageLinkValue,
	LinkValue,
	FieldResponseMeta,
} from "../types/response.js";
import type { RequestQueryParsed } from "../middleware/validate-query.js";
import type {
	FieldTypes,
	CustomField,
} from "../libs/builders/field-builder/types.js";
import type { FieldProp } from "../libs/formatters/collection-document-fields.js";
import type { FieldFilters } from "../libs/builders/collection-builder/index.js";
import type { BrickSchema } from "../schemas/collection-bricks.js";
import type { GroupsResponse } from "../services/collection-document-bricks/upsert-multiple-groups.js";
import Formatter from "../libs/formatters/index.js";
import mediaHelpers from "./media-helpers.js";

export const fieldTypeValueKey = (type: FieldTypes) => {
	switch (type) {
		case "text":
			return "textValue";
		case "wysiwyg":
			return "textValue";
		case "media":
			return "mediaId";
		case "number":
			return "intValue";
		case "checkbox":
			return "boolValue";
		case "select":
			return "textValue";
		case "textarea":
			return "textValue";
		case "json":
			return "jsonValue";
		case "pagelink":
			return "pageLinkId";
		case "link":
			return "textValue";
		case "datetime":
			return "textValue";
		case "colour":
			return "textValue";
		default:
			return "textValue";
	}
};

export const fieldColumnValueMap = (field: z.infer<typeof FieldSchema>) => {
	switch (field.type) {
		case "link": {
			const value = field.value as LinkValue | undefined;
			if (!value) {
				return {
					textValue: null,
					jsonValue: null,
				};
			}
			return {
				textValue: value.url,
				jsonValue: Formatter.stringifyJSON({
					target: value.target,
					label: value.label,
				}),
			};
		}
		case "pagelink": {
			const value = field.value as PageLinkValue | undefined;
			if (!value) {
				return {
					pageLinkId: null,
					jsonValue: null,
				};
			}
			return {
				pageLinkId: value.id,
				jsonValue: Formatter.stringifyJSON({
					target: value.target,
					label: value.label,
				}),
			};
		}
		default: {
			return {
				[fieldTypeValueKey(field.type)]: field.value,
			};
		}
	}
};

export interface CollectionFiltersResponse {
	key: string;
	value: string | string[];
	column: string;
}
export const collectionFilters = (
	allowed_filters: FieldFilters,
	filter: RequestQueryParsed["filter"],
): Array<CollectionFiltersResponse> => {
	const values = typeof filter?.cf === "string" ? [filter?.cf] : filter?.cf;
	if (!values) return [];

	const filterKeyValues: Array<CollectionFiltersResponse> = [];

	for (const field of allowed_filters) {
		const filterValue = values.filter((filter) =>
			filter.startsWith(`${field.key}=`),
		);

		if (filterValue) {
			const keyValues = filterValue
				.map((filter) => filter.split("=")[1])
				.filter((v) => v !== "")
				.filter((v) => v !== undefined) as string[];

			if (keyValues.length === 0) continue;

			if (keyValues.length > 1) {
				filterKeyValues.push({
					key: field.key,
					value: keyValues,
					column: fieldTypeValueKey(field.type),
				});
			} else {
				const firstValue = keyValues[0];
				if (!firstValue) continue;
				filterKeyValues.push({
					key: field.key,
					value: firstValue,
					column: fieldTypeValueKey(field.type),
				});
			}
		}
	}

	return filterKeyValues;
};

interface FieldResponseValueFormat {
	type: FieldTypes;
	builder_field: CustomField;
	field: FieldProp;
	host: string;
}
export const fieldResponseValueFormat = (props: FieldResponseValueFormat) => {
	let value: FieldResponseValue = null;
	let meta: FieldResponseMeta = null;

	switch (props.type) {
		case "tab": {
			break;
		}
		case "text": {
			value = props.field?.text_value ?? props.builder_field?.default;
			break;
		}
		case "wysiwyg": {
			value = props.field?.text_value ?? props.builder_field?.default;
			break;
		}
		case "media": {
			value = props.field?.media_id ?? undefined;
			meta = {
				id: props.field?.media_id ?? undefined,
				url: mediaHelpers.createURL(
					props.host,
					props.field?.media_key ?? "",
				),
				key: props.field?.media_key ?? undefined,
				mimeType: props.field?.media_mime_type ?? undefined,
				fileExtension: props.field?.media_file_extension ?? undefined,
				fileSize: props.field?.media_file_size ?? undefined,
				width: props.field?.media_width ?? undefined,
				height: props.field?.media_height ?? undefined,
				titleTranslations: props.field?.media_title_translations?.map(
					(t) => ({
						value: t.value,
						languageId: t.language_id,
					}),
				),
				altTranslations: props.field?.media_alt_translations?.map(
					(t) => ({
						value: t.value,
						languageId: t.language_id,
					}),
				),
				type: (props.field?.media_type as MediaType) ?? undefined,
			};
			break;
		}
		case "number": {
			value = props.field?.int_value ?? props.builder_field?.default;
			break;
		}
		case "checkbox": {
			value =
				props.field?.bool_value ?? props.builder_field?.default ? 1 : 0;
			break;
		}
		case "select": {
			value = props.field?.text_value ?? props.builder_field?.default;
			break;
		}
		case "textarea": {
			value = props.field?.text_value ?? props.builder_field?.default;
			break;
		}
		case "json": {
			value =
				Formatter.parseJSON<Record<string, unknown>>(
					props.field?.json_value,
				) ?? props.builder_field?.default;
			break;
		}
		case "colour": {
			value = props.field?.text_value ?? props.builder_field?.default;
			break;
		}
		case "datetime": {
			value = props.field?.text_value ?? props.builder_field?.default;
			break;
		}
		case "pagelink": {
			const jsonVal = Formatter.parseJSON<PageLinkValue>(
				props.field?.json_value,
			);
			value = {
				id: props.field?.page_link_id ?? undefined,
				target: jsonVal?.target || "_self",
				label: jsonVal?.label || "",
			};
			// meta = {};
			break;
		}
		case "link": {
			const jsonVal = Formatter.parseJSON<LinkValue>(
				props.field?.json_value,
			);
			value = {
				url:
					props.field?.text_value ??
					props.builder_field?.default ??
					"",
				target: jsonVal?.target ?? "_self",
				label: jsonVal?.label ?? undefined,
			};
			break;
		}
	}

	return { value, meta };
};

interface FieldUpsertObjectResponse {
	fieldsId?: number | undefined;
	collectionBrickId: number;
	key: string;
	type: FieldTypes;
	groupId?: number | null;
	textValue: string | null;
	intValue: number | null;
	boolValue: 1 | 0 | null;
	jsonValue: string | null;
	pageLinkId: number | null;
	mediaId: number | null;
	languageId: number;
}

interface FormatUpsertFields {
	brick: BrickSchema;
	groups: Array<GroupsResponse>;
}

export const fieldUpsertPrep = (
	props: FormatUpsertFields,
): Array<FieldUpsertObjectResponse> => {
	return (
		props.brick.fields?.map((field) => {
			let groupId = null;
			const findGroup = props.groups.find(
				(group) => group.ref === field.groupId,
			);
			if (findGroup === undefined) {
				const findGroupBrick = props.groups.find(
					(group) => group.groupId === field.groupId,
				);
				groupId = findGroupBrick?.groupId ?? null;
			} else groupId = findGroup.groupId;

			return {
				languageId: field.languageId,
				fieldsId: field.fieldsId,
				collectionBrickId: props.brick.id as number,
				key: field.key,
				type: field.type,
				groupId: groupId,
				textValue: null,
				intValue: null,
				boolValue: null,
				jsonValue: null,
				pageLinkId: null,
				mediaId: null,
				...fieldColumnValueMap(field),
			};
		}) || []
	);
};