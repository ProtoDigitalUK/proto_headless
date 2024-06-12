import type {
	FieldResponse,
	FieldGroupResponse,
} from "../../types/response.js";
import type { JSONString } from "../db/types.js";
import type CollectionBuilder from "../builders/collection-builder/index.js";
import type BrickBuilder from "../builders/brick-builder/index.js";
import type { BrickPropT } from "./collection-document-bricks.js";
import type {
	CFConfig,
	FieldTypes,
	FieldResponseMeta,
	FieldResponseValue,
	RepeaterFieldConfig,
	TabFieldConfig,
} from "../custom-fields/types.js";

export interface FieldProp {
	fields_id: number;
	collection_brick_id: number | null;
	collection_document_id: number;
	group_id?: number | null;
	locale_code: string;
	key: string;
	type: string;
	text_value: string | null;
	int_value: number | null;
	bool_value: 1 | 0 | null;
	json_value?: JSONString | null;
	user_id?: number | null;
	user_email?: string | null;
	user_first_name?: string | null;
	user_last_name?: string | null;
	user_username?: string | null;
	media_id?: number | null;
	media_key?: string | null;
	media_mime_type?: string | null;
	media_file_extension?: string | null;
	media_file_size?: number | null;
	media_width?: number | null;
	media_height?: number | null;
	media_type?: string | null;
	media_title_translations?: Array<{
		value: string | null;
		locale_code: string | null;
	}>;
	media_alt_translations?: Array<{
		value: string | null;
		locale_code: string | null;
	}>;
}

export default class CollectionDocumentFieldsFormatter {
	formatMultiple = (
		data: {
			fields: FieldProp[];
			groups: BrickPropT["groups"];
		},
		meta: {
			builder: BrickBuilder | CollectionBuilder;
			host: string;
			collectionTranslations: boolean;
			localisation: {
				locales: string[];
				default: string;
			};
		},
	): FieldResponse[] => {
		const fieldConfigTree = meta.builder.fieldTreeNoTab;
		const sortedGroups = data.groups.sort(
			(a, b) => a.group_order - b.group_order,
		);

		return this.buildFieldTree(
			{
				fields: data.fields,
				groups: sortedGroups,
			},
			{
				builder: meta.builder,
				fieldConfig: fieldConfigTree,
				host: meta.host,
				localisation: meta.localisation,
				collectionTranslations: meta.collectionTranslations,
				groupId: null,
				parentGroupId: null,
			},
		);
	};
	formatMultipleFlat = (
		data: {
			fields: FieldProp[];
		},
		meta: {
			builder: BrickBuilder | CollectionBuilder;
			host: string;
			collectionTranslations: boolean;
			localisation: {
				locales: string[];
				default: string;
			};
		},
	): FieldResponse[] => {
		if (data.fields.length === 0) return [];
		const fieldsRes: FieldResponse[] = [];
		const flatFields = meta.builder.flatFields;

		for (const fieldConfig of flatFields) {
			const fieldData = data.fields
				.filter((f) => f.key === fieldConfig.key)
				.filter((f) => {
					if (f.type === "repeater") return false;
					if (f.type === "tab") return false;
					return true;
				});

			if (fieldData.length === 0) continue;

			const field = this.buildField(
				{
					fields: fieldData,
				},
				{
					builder: meta.builder,
					fieldConfig: fieldConfig,
					host: meta.host,
					includeGroupId: true,
					collectionTranslations: meta.collectionTranslations,
					localisation: meta.localisation,
				},
			);
			if (field) fieldsRes.push(field);
		}

		return fieldsRes;
	};

	// Private methods
	private buildFieldTree = (
		data: {
			fields: FieldProp[];
			groups: BrickPropT["groups"];
		},
		meta: {
			builder: BrickBuilder | CollectionBuilder;
			fieldConfig: CFConfig<FieldTypes>[];
			host: string;
			groupId: number | null;
			parentGroupId: number | null;
			collectionTranslations: boolean;
			localisation: {
				locales: string[];
				default: string;
			};
		},
	): FieldResponse[] => {
		const fieldsRes: FieldResponse[] = [];

		for (const config of meta.fieldConfig) {
			// recursively build repeater groups
			if (config.type === "repeater") {
				fieldsRes.push({
					key: config.key,
					type: config.type,
					groups: this.buildGroups(
						{
							fields: data.fields,
							groups: data.groups,
						},
						{
							builder: meta.builder,
							repeaterConfig: config,
							host: meta.host,
							parentGroupId: meta.groupId,
							localisation: meta.localisation,
							collectionTranslations: meta.collectionTranslations,
						},
					),
				});
				continue;
			}

			// get all fields of that exist in config and the current group level
			const fields = data.fields.filter(
				(f) => f.key === config.key && f.group_id === meta.groupId,
			);
			if (!fields) continue;
			if (fields.length === 0) continue;

			const field = this.buildField(
				{
					fields: fields,
				},
				{
					builder: meta.builder,
					fieldConfig: config,
					host: meta.host,
					includeGroupId: true,
					localisation: meta.localisation,
					collectionTranslations: meta.collectionTranslations,
				},
			);
			if (field) fieldsRes.push(field);
		}

		return fieldsRes;
	};
	private buildField = (
		data: {
			fields: FieldProp[];
		},
		meta: {
			builder: BrickBuilder | CollectionBuilder;
			fieldConfig: CFConfig<FieldTypes>;
			host: string;
			includeGroupId: boolean;
			collectionTranslations: boolean;
			localisation: {
				locales: string[];
				default: string;
			};
		},
	): FieldResponse | null => {
		if (
			meta.fieldConfig.type !== "repeater" &&
			meta.fieldConfig.type !== "tab" &&
			meta.fieldConfig.translations === true &&
			meta.collectionTranslations === true
		) {
			// reduce same fields with different languages into 1 field
			// add missing locales with default value to it
			return this.addEmptyLocales(
				{ field: this.reduceFieldLocales(data, meta) },
				{
					fieldConfig: meta.fieldConfig,
					host: meta.host,
					localisation: meta.localisation,
				},
			);
		}

		// get the default locale for that field
		// - if a field doesnt support translations we always use the default locale
		const defaultField = data.fields.find(
			(f) => f.locale_code === meta.localisation.default,
		);
		if (!defaultField) return null;

		const cfInstance = meta.builder.fields.get(meta.fieldConfig.key);
		if (!cfInstance) return null;

		return {
			key: meta.fieldConfig.key,
			type: meta.fieldConfig.type as FieldTypes,
			groupId: meta.includeGroupId
				? defaultField.group_id ?? undefined
				: undefined,
			...cfInstance.responseValueFormat({
				data: defaultField,
				host: meta.host,
			}),
		};
	};
	private buildGroups = (
		data: {
			fields: FieldProp[];
			groups: BrickPropT["groups"];
		},
		meta: {
			builder: BrickBuilder | CollectionBuilder;
			repeaterConfig: CFConfig<"repeater">;
			host: string;
			parentGroupId: number | null;
			collectionTranslations: boolean;
			localisation: {
				locales: string[];
				default: string;
			};
		},
	): FieldGroupResponse[] => {
		const groups: FieldGroupResponse[] = [];

		const repeaterFields = meta.repeaterConfig.fields;
		if (!repeaterFields) return groups;

		const repeaterGroups = data.groups.filter(
			(g) =>
				g.repeater_key === meta.repeaterConfig.key &&
				g.parent_group_id === meta.parentGroupId,
		);

		for (const group of repeaterGroups) {
			groups.push({
				id: group.group_id,
				order: group.group_order,
				open: group.group_open,
				fields: this.buildFieldTree(
					{
						fields: data.fields,
						groups: data.groups,
					},
					{
						builder: meta.builder,
						fieldConfig: repeaterFields,
						host: meta.host,
						groupId: group.group_id,
						parentGroupId: group.parent_group_id,
						collectionTranslations: meta.collectionTranslations,
						localisation: meta.localisation,
					},
				),
			});
		}

		return groups;
	};
	private reduceFieldLocales = (
		data: {
			fields: FieldProp[];
		},
		meta: {
			builder: BrickBuilder | CollectionBuilder;
			fieldConfig: CFConfig<FieldTypes>;
			host: string;
			includeGroupId?: boolean;
		},
	): FieldResponse => {
		return data.fields.reduce<FieldResponse>(
			(acc, field) => {
				const cfInstance = meta.builder.fields.get(
					meta.fieldConfig.key,
				);
				if (!cfInstance) return acc;

				if (acc.translations === undefined) acc.translations = {};
				if (acc.meta === undefined || acc.meta === null) acc.meta = {};

				if (meta.includeGroupId)
					acc.groupId = field.group_id ?? undefined;

				const fieldRes = cfInstance.responseValueFormat({
					data: field,
					host: meta.host,
				});

				acc.translations[field.locale_code] = fieldRes.value;
				(acc.meta as Record<string, FieldResponseMeta>)[
					field.locale_code
				] = fieldRes.meta;

				return acc;
			},
			{
				key: meta.fieldConfig.key,
				type: meta.fieldConfig.type,
			},
		);
	};
	private addEmptyLocales = (
		data: {
			field: FieldResponse;
		},
		meta: {
			fieldConfig: Exclude<
				CFConfig<FieldTypes>,
				RepeaterFieldConfig | TabFieldConfig
			>;
			host: string;
			localisation: {
				locales: string[];
				default: string;
			};
		},
	): FieldResponse => {
		if (data.field.translations === undefined) data.field.translations = {};
		if (data.field.meta === undefined) data.field.meta = {};

		const emptyLocales = meta.localisation.locales.filter(
			(l) =>
				!(
					data.field.translations as Record<
						string,
						FieldResponseValue
					>
				)[l],
		);
		for (const locale of emptyLocales) {
			(data.field.translations as Record<string, FieldResponseValue>)[
				locale
			] = meta.fieldConfig.default ?? null;
			(data.field.meta as Record<string, FieldResponseMeta>)[locale] =
				null;
		}
		return data.field;
	};
	static swagger = {
		type: "object",
		additionalProperties: true,
		properties: {
			key: {
				type: "string",
			},
			type: {
				type: "string",
				enum: [
					"tab",
					"text",
					"wysiwyg",
					"media",
					"number",
					"checkbox",
					"select",
					"textarea",
					"json",
					"colour",
					"datetime",
					"link",
					"repeater",
					"user",
				],
			},
			groupId: {
				type: "number",
				nullable: true,
			},
			collectionDocumentId: {
				type: "number",
			},
			translations: {
				type: "object",
				additionalProperties: true,
			},
			value: {},
			meta: {
				type: "object",
				additionalProperties: true,
				nullable: true,
				properties: {
					id: {
						type: "number",
						nullable: true,
					},
					url: {
						type: "string",
						nullable: true,
					},
					key: {
						type: "string",
						nullable: true,
					},
					mimeType: {
						type: "string",
						nullable: true,
					},
					fileExtension: {
						type: "string",
						nullable: true,
					},
					fileSize: {
						type: "number",
						nullable: true,
					},
					width: {
						type: "number",
						nullable: true,
					},
					height: {
						type: "number",
						nullable: true,
					},
					titleTranslations: {
						type: "array",
						items: {
							type: "object",
							additionalProperties: true,
							properties: {
								value: {
									type: "string",
									nullable: true,
								},
								localeCode: {
									type: "string",
									nullable: true,
								},
							},
						},
					},
					altTranslations: {
						type: "array",
						items: {
							type: "object",
							additionalProperties: true,
							properties: {
								value: {
									type: "string",
									nullable: true,
								},
								localeCode: {
									type: "string",
									nullable: true,
								},
							},
						},
					},
					type: {
						type: "string",
						nullable: true,
						enum: ["image", "video", "audio", "document"],
					},
					email: {
						type: "string",
						nullable: true,
					},
					username: {
						type: "string",
						nullable: true,
					},
					firstName: {
						type: "string",
						nullable: true,
					},
					lastName: {
						type: "string",
						nullable: true,
					},
				},
			},
			groups: {
				type: "array",
				items: {
					type: "object",
					additionalProperties: true,
					properties: {
						id: {
							type: "number",
						},
						order: {
							type: "number",
						},
						open: {
							type: "number",
							nullable: true,
						},
						fields: {
							type: "array",
							items: {
								type: "object",
								additionalProperties: true,
							},
						},
					},
				},
			},
		},
	};
}
