interface TranslationsObjT {
	language_id: number;
	value: string | null;
}

export const removeDuplicates = (translations: TranslationsObjT[]) =>
	translations.filter(
		(translation, index, self) =>
			index ===
			self.findIndex((t) => t.language_id === translation.language_id),
	);

export const mergeTranslationGroups = (
	items: Array<{
		translations: TranslationsObjT[];
		key: string;
	}>,
) => {
	const translations: {
		language_id: number;
		value: string | null;
		key: string;
	}[] = [];
	for (const item of items) {
		const itemTranslations = removeDuplicates(item.translations);
		for (const translation of itemTranslations) {
			translations.push({
				...translation,
				key: item.key,
			});
		}
	}
	return translations;
};

export const getUniqueLanguageIDs = (items: Array<TranslationsObjT[]>) => {
	const languageIds = items.flatMap((t) => t.map((t) => t.language_id));
	return Array.from(new Set(languageIds));
};
