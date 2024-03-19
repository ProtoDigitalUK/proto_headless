import fs from "fs-extra";
import type { Readable } from "stream";
import { pipeline } from "stream/promises";
import { join } from "path";
import mime from "mime-types";
import sharp from "sharp";
import { type MediaResT } from "@headless/types/src/media.js";
import slug from "slug";

export interface MediaMetaDataT {
	mimeType: string;
	fileExtension: string;
	size: number;
	width: number | null;
	height: number | null;
	type: MediaResT["type"];
	key: string;
	etag?: string;
}

// Get meta data from file
const getMetaData = async (data: {
	filePath: string;
	mimeType: string;
	fileName: string;
}): Promise<MediaMetaDataT> => {
	const file = streamTempFile(data.filePath);

	const fileExtension = mime.extension(data.mimeType);
	const mimeType = data.mimeType;
	let size = 0;
	let width = null;
	let height = null;

	try {
		const transform = sharp();
		file.pipe(transform);
		const metaData = await transform.metadata();
		width = metaData.width;
		height = metaData.height;
		size = metaData.size || 0;
	} catch (error) {}

	return {
		mimeType: mimeType,
		fileExtension: fileExtension || "",
		size: size,
		width: width || null,
		height: height || null,
		type: getMediaType(mimeType),
		key: uniqueKey(data.fileName),
	};
};

// Workout media type
const getMediaType = (mimeType: string): MediaResT["type"] => {
	const normalizedMimeType = mimeType.toLowerCase();

	if (normalizedMimeType.includes("image")) return "image";
	if (normalizedMimeType.includes("video")) return "video";
	if (normalizedMimeType.includes("audio")) return "audio";
	if (
		normalizedMimeType.includes("pdf") ||
		normalizedMimeType.startsWith("application/vnd")
	)
		return "document";
	if (
		normalizedMimeType.includes("zip") ||
		normalizedMimeType.includes("tar")
	)
		return "archive";

	return "unknown";
};

// Generate unique key
const uniqueKey = (name: string) => {
	const slugVal = slug(name.split(".")[0], {
		lower: true,
	});
	return `${slugVal}-${new Date().getTime()}`;
};

// Save stream to a temporary file
const saveStreamToTempFile = async (stream: Readable, name: string) => {
	const tempDir = "./tmp";
	await fs.ensureDir(tempDir);

	const tempFilePath = join(tempDir, name);

	await pipeline(stream, fs.createWriteStream(tempFilePath));

	return tempFilePath;
};

// Stream temp file
const streamTempFile = (filePath: string): Readable => {
	return fs.createReadStream(filePath);
};

// Remove temp file
const deleteTempFile = async (filePath?: string) => {
	if (!filePath) return;
	await fs.remove(filePath);
};

// Choose format based on accept header and query
const chooseFormat = (
	accept: string | undefined,
	queryFormat?: "avif" | "webp" | "jpeg" | "png" | undefined,
) => {
	if (queryFormat) return queryFormat;

	if (accept) {
		if (accept.includes("image/avif")) return "avif";
		if (accept.includes("image/webp")) return "webp";
	}

	return undefined;
};

// Create process key
const createProcessKey = (data: {
	key: string;
	options: {
		format?: string;
		quality?: string;
		width?: string;
		height?: string;
	};
}) => {
	let key = `processed/${data.key}`;
	if (data.options.format) key = key.concat(`.${data.options.format}`);
	if (data.options.quality) key = key.concat(`.${data.options.quality}`);
	if (data.options.width) key = key.concat(`.${data.options.width}`);
	if (data.options.height) key = key.concat(`.${data.options.height}`);

	return key;
};

// Steam to buffer
const streamToBuffer = (readable: Readable): Promise<Buffer> => {
	return new Promise((resolve, reject) => {
		const chunks: Buffer[] = [];
		readable.on("data", (chunk) => chunks.push(chunk));
		readable.on("end", () => resolve(Buffer.concat(chunks)));
		readable.on("error", reject);
	});
};

const mediaHelpers = {
	getMediaType,
	uniqueKey,
	streamTempFile,
	saveStreamToTempFile,
	getMetaData,
	deleteTempFile,
	chooseFormat,
	createProcessKey,
	streamToBuffer,
};

export default mediaHelpers;