import type { BooleanInt } from "../libs/db/types.js";
import type { CollectionBrickConfig } from "../libs/builders/collection-builder/types.js";
import type { ErrorResult } from "./errors.js";
import type {
	CFConfig,
	FieldTypes,
	FieldResponseMeta,
	FieldResponseValue,
} from "../libs/custom-fields/types.js";

export interface UserResponse {
	id: number;
	superAdmin?: BooleanInt;
	email: string;
	username: string;
	firstName: string | null;
	lastName: string | null;
	triggerPasswordReset?: BooleanInt;

	roles?: UserPermissionsResponse["roles"];
	permissions?: UserPermissionsResponse["permissions"];

	createdAt: string | null;
	updatedAt?: string | null;
}

export interface UserPermissionsResponse {
	roles: Array<{
		id: number;
		name: string;
	}>;
	permissions: Permission[];
}

export interface SettingsResponse {
	email: {
		enabled: boolean;
		from: {
			email: string;
			name: string;
		} | null;
	};
	media: {
		enabled: boolean;
		storage: {
			total: number;
			remaining: number | null;
			used: number | null;
			limit: number;
		};
		processed: {
			stored: boolean;
			imageLimit: number;
			total: number | null;
		};
	};
}

export interface RoleResponse {
	id: number;
	name: string;
	description: string | null;

	permissions?: {
		id: number;
		permission: Permission;
	}[];

	createdAt: string | null;
	updatedAt: string | null;
}

export type OptionName = "media_storage_used";

export interface OptionsResponse {
	name: OptionName;
	valueText: string | null;
	valueInt: number | null;
	valueBool: BooleanInt | null;
}

export type MediaType =
	| "image"
	| "video"
	| "audio"
	| "document"
	| "archive"
	| "unknown";

export interface MediaResponse {
	id: number;
	key: string;
	url: string;
	titleTranslations: {
		localeCode: string | null;
		value: string | null;
	}[];
	altTranslations: {
		localeCode: string | null;
		value: string | null;
	}[];
	type: MediaType;
	meta: {
		mimeType: string;
		fileExtension: string;
		fileSize: number;
		width: number | null;
		height: number | null;
	};
	createdAt: string | null;
	updatedAt: string | null;
}

export interface LocalesResponse {
	code: string;
	name: string | null;
	isDefault: BooleanInt;
	createdAt: string | null;
	updatedAt: string | null;
}

export interface EmailResponse {
	id: number;
	mailDetails: {
		from: {
			address: string;
			name: string;
		};
		to: string;
		subject: string;
		cc: null | string;
		bcc: null | string;
		template: string;
	};
	data: Record<string, unknown> | null;
	deliveryStatus: "sent" | "failed" | "pending";
	type: "external" | "internal";
	emailHash: string;
	sentCount: number;
	errorCount: number;
	html: string | null;
	errorMessage: string | null;

	createdAt: string | null;
	lastSuccessAt: string | null;
	lastAttemptAt: string | null;
}

export interface CollectionResponse {
	key: string;
	mode: "single" | "multiple";
	title: string;
	singular: string;
	description: string | null;
	documentId?: number | null;
	translations: boolean;
	fixedBricks: Array<CollectionBrickConfig>;
	builderBricks: Array<CollectionBrickConfig>;
	fields: CFConfig<FieldTypes>[];
	fieldIncludes: string[];
	fieldFilters: string[];
}

export interface BrickResponse {
	id: number;
	key: string;
	order: number;
	open: BooleanInt | null;
	type: "builder" | "fixed";
	fields: Array<FieldResponse>;
}

export interface FieldResponse {
	key: string;
	type: FieldTypes;
	groupId?: number;
	translations?: Record<string, FieldResponseValue>;
	value?: FieldResponseValue;
	meta?: Record<string, FieldResponseMeta> | FieldResponseMeta;
	groups?: Array<FieldGroupResponse>;
}
export interface FieldGroupResponse {
	id: number | string;
	order: number;
	open: BooleanInt | null;
	fields: Array<FieldResponse>;
}

export interface LinkValue {
	url: string | null;
	target: string | null;
	label: string | null;
}

export type MediaValue = number;

export interface MediaMeta {
	id: number | null;
	url: string | null;
	key: string | null;
	mimeType: string | null;
	fileExtension: string | null;
	fileSize: number | null;
	width: number | null;
	height: number | null;
	titleTranslations?: Array<{
		value: string | null;
		localeCode: string | null;
	}>;
	altTranslations?: Array<{
		value: string | null;
		localeCode: string | null;
	}>;
	type: MediaType | null;
}

export interface UserMeta {
	username: string | null;
	email: string | null;
	firstName: string | null;
	lastName: string | null;
}

export interface CollectionDocumentResponse {
	id: number;
	collectionKey: string | null;

	createdBy: {
		id: number;
		email: string | null;
		firstName: string | null;
		lastName: string | null;
		username: string | null;
	} | null;
	createdAt: string | null;
	updatedAt: string | null;
	updatedBy: {
		id: number;
		email: string | null;
		firstName: string | null;
		lastName: string | null;
		username: string | null;
	} | null;

	bricks?: Array<BrickResponse> | null;
	fields?: Array<FieldResponse> | null;
}

export interface ResponseBody<D = unknown> {
	data: D;
	links?: {
		first: string | null;
		last: string | null;
		next: string | null;
		prev: string | null;
	};
	meta: {
		links: Array<{
			active: boolean;
			label: string;
			url: string | null;
			page: number;
		}>;
		path: string;

		currentPage: number | null;
		lastPage: number | null;
		perPage: number | null;
		total: number | null;
	};
}

export interface ErrorResponse {
	status: number;
	code?: string;
	name: string;
	message: string;
	errors?: ErrorResult;
}

export type Permission =
	| "create_user"
	| "update_user"
	| "delete_user"
	| "create_role"
	| "update_role"
	| "delete_role"
	| "create_media"
	| "update_media"
	| "delete_media"
	| "update_settings"
	| "read_email"
	| "delete_email"
	| "send_email"
	| "create_content"
	| "update_content"
	| "delete_content"
	| "delete_collection"
	| "create_collection"
	| "update_collection"
	| "create_client_integration"
	| "update_client_integration"
	| "delete_client_integration";

export type PermissionGroup = {
	key: string;
	permissions: Permission[];
};

export type PermissionGroupKey =
	| "users"
	| "roles"
	| "media"
	| "settings"
	| "emails"
	| "content"
	| "client-integrations";

export interface ClientIntegrationResponse {
	id: number;
	key: string;
	name: string;
	description: string | null;
	enabled: BooleanInt;
	createdAt: string | null;
	updatedAt: string | null;
}
