import T from "../../translations/index.js";
import { APIError } from "../../utils/app/error-handler.js";
import { type MultipartFile } from "@fastify/multipart";
import languagesServices from "../languages/index.js";
import serviceWrapper from "../../utils/app/service-wrapper.js";
import mediaServices from "./index.js";
import translationsServices from "../translations/index.js";
import s3Services from "../s3/index.js";
import {
	mergeTranslationGroups,
	getUniqueLanguageIDs,
} from "../../utils/translations/helpers.js";

export interface ServiceData {
	fileData: MultipartFile | undefined;
	title_translations?: {
		language_id: number;
		value: string | null;
	}[];
	alt_translations?: {
		language_id: number;
		value: string | null;
	}[];
	visible?: boolean;
}

const uploadSingle = async (
	serviceConfig: ServiceConfigT,
	data: ServiceData,
) => {
	let objectStored = false;
	let objectKey = undefined;

	try {
		await serviceWrapper(
			languagesServices.checks.checkLanguagesExist,
			false,
		)(serviceConfig, {
			languageIds: getUniqueLanguageIDs([
				data.title_translations || [],
				data.alt_translations || [],
			]),
		});

		const translationKeyIdPromise = serviceWrapper(
			translationsServices.createMultiple,
			false,
		)(serviceConfig, {
			keys: ["title", "alt"],
			translations: mergeTranslationGroups([
				{
					translations: data.title_translations || [],
					key: "title",
				},
				{
					translations: data.alt_translations || [],
					key: "alt",
				},
			]),
		});
		const uploadObjectPromise = serviceWrapper(
			mediaServices.storage.uploadObject,
			false,
		)(serviceConfig, {
			fileData: data.fileData,
		});

		const [translationKeyIds, uploadObjectRes] = await Promise.all([
			translationKeyIdPromise,
			uploadObjectPromise,
		]);

		objectStored = true;
		objectKey = uploadObjectRes.key;

		const mediaRes = await serviceConfig.db
			.insertInto("headless_media")
			.values({
				key: uploadObjectRes.key,
				e_tag: uploadObjectRes.etag,
				visible: data.visible ?? true,
				type: uploadObjectRes.type,
				mime_type: uploadObjectRes.mimeType,
				file_extension: uploadObjectRes.fileExtension,
				file_size: uploadObjectRes.size,
				width: uploadObjectRes.width,
				height: uploadObjectRes.height,
				title_translation_key_id: translationKeyIds.title,
				alt_translation_key_id: translationKeyIds.alt,
			})
			.returning("id")
			.executeTakeFirst();

		if (mediaRes === undefined) {
			throw new APIError({
				type: "basic",
				name: T("error_not_created_name", {
					name: T("media"),
				}),
				message: T("error_not_created_message", {
					name: T("media"),
				}),
				status: 500,
			});
		}

		return mediaRes.id;
	} catch (e) {
		if (objectStored && objectKey !== undefined) {
			s3Services.deleteObject({
				key: objectKey,
			});
		}
		throw e;
	}
};

export default uploadSingle;
