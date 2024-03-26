import type { FieldSchemaT } from "../schemas/collection-fields.js";
import type {
	PageLinkValueT,
	LinkValueT,
	FieldResMetaT,
} from "@headless/types/src/bricks.js";
import type { MediaTypeT } from "@headless/types/src/media.js";
import type { RequestQueryParsedT } from "../middleware/validate-query.js";
import type { FieldTypesT, CustomFieldT } from "../libs/field-builder/types.js";
import type { FieldQueryDataT } from "../format/format-collection-fields.js";
import type { FieldResValueT } from "@headless/types/src/bricks.js";
import { createURL } from "../format/format-media.js";
import { formatDocumentFullSlug } from "../format/format-collection-document.js";

export const fieldTypeValueKey = (type: FieldTypesT) => {
	switch (type) {
		case "text":
			return "text_value";
		case "wysiwyg":
			return "text_value";
		case "media":
			return "media_id";
		case "number":
			return "int_value";
		case "checkbox":
			return "bool_value";
		case "select":
			return "text_value";
		case "textarea":
			return "text_value";
		case "json":
			return "json_value";
		case "pagelink":
			return "page_link_id";
		case "link":
			return "text_value";
		case "datetime":
			return "text_value";
		case "colour":
			return "text_value";
		default:
			return "text_value";
	}
};

export const fieldColumnValueMap = (field: FieldSchemaT) => {
	switch (field.type) {
		case "link": {
			const value = field.value as LinkValueT | undefined;
			if (!value) {
				return {
					text_value: null,
					json_value: null,
				};
			}
			return {
				text_value: value.url,
				json_value: {
					target: value.target,
					label: value.label,
				},
			};
		}
		case "pagelink": {
			const value = field.value as PageLinkValueT | undefined;
			if (!value) {
				return {
					page_link_id: null,
					json_value: null,
				};
			}
			return {
				page_link_id: value.id,
				json_value: {
					target: value.target,
					label: value.label,
				},
			};
		}
		default: {
			return {
				[fieldTypeValueKey(field.type)]: field.value,
			};
		}
	}
};

export interface CollectionFiltersResT {
	key: string;
	value: string | string[];
	column: string;
}
export const collectionFilters = (
	allowed_filters: {
		key: string;
		type: FieldTypesT;
	}[],
	filter: RequestQueryParsedT["filter"],
): Array<CollectionFiltersResT> => {
	const values = typeof filter?.cf === "string" ? [filter?.cf] : filter?.cf;
	if (!values) return [];

	const filterKeyValues: Array<CollectionFiltersResT> = [];

	for (const field of allowed_filters) {
		const filterValue = values.filter((filter) =>
			filter.startsWith(`${field.key}=`),
		);

		if (filterValue) {
			const keyValues = filterValue
				.map((filter) => filter.split("=")[1])
				.filter((v) => v !== "");

			if (keyValues.length === 0) continue;

			filterKeyValues.push({
				key: field.key,
				value: keyValues.length > 1 ? keyValues : keyValues[0],
				column: fieldTypeValueKey(field.type),
			});
		}
	}

	return filterKeyValues;
};

interface FieldResponseValueFormatT {
	type: FieldTypesT;
	builder_field: CustomFieldT;
	field: FieldQueryDataT;
	collection_slug: string | null | undefined;
	host: string;
}
export const fieldResponseValueFormat = (props: FieldResponseValueFormatT) => {
	let value: FieldResValueT = null;
	let meta: FieldResMetaT = null;

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
				url: createURL(props.host, props.field?.media_key ?? ""),
				key: props.field?.media_key ?? undefined,
				mime_type: props.field?.media_mime_type ?? undefined,
				file_extension: props.field?.media_file_extension ?? undefined,
				file_size: props.field?.media_file_size ?? undefined,
				width: props.field?.media_width ?? undefined,
				height: props.field?.media_height ?? undefined,
				title_translations: props.field?.media_title_translations,
				alt_translations: props.field?.media_alt_translations,
				type: (props.field?.media_type as MediaTypeT) ?? undefined,
			};
			break;
		}
		case "number": {
			value = props.field?.int_value ?? props.builder_field?.default;
			break;
		}
		case "checkbox": {
			value = props.field?.bool_value ?? props.builder_field?.default;
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
				(props.field?.json_value as Record<string, unknown>) ??
				props.builder_field?.default;
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
			const jsonVal = props.field?.json_value as Record<
				string,
				unknown
			> | null;
			value = {
				id: props.field?.page_link_id ?? undefined,
				target: jsonVal?.target || "_self",
				label: jsonVal?.label || "",
			};
			meta = {
				slug: props.field?.page_slug ?? undefined,
				full_slug:
					formatDocumentFullSlug(
						props.field?.page_full_slug ?? null,
						props.collection_slug,
					) ?? undefined,
				collection_slug: props.collection_slug ?? undefined,
			};
			break;
		}
		case "link": {
			const jsonVal = props.field?.json_value as Record<
				string,
				unknown
			> | null;
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
