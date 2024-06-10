import CustomField from "../custom-field.js";
import Formatter from "../../formatters/index.js";
import type { CFConfig, CFProps, CFResponse, CFInsertItem } from "../types.js";
import type { FieldProp } from "../../formatters/collection-document-fields.js";
import type { FieldInsertItem } from "../../../services/collection-document-bricks/helpers/flatten-fields.js";

class JsonCustomField extends CustomField<"json"> {
	type = "json" as const;
	column = "json_value" as const;
	config;
	key;
	props;
	constructor(key: string, props?: CFProps<"json">) {
		super();
		this.key = key;
		this.props = props;
		this.config = {
			key: this.key,
			type: this.type,
			labels: {
				title: this.props?.labels?.title ?? super.keyToTitle(this.key),
				description: this.props?.labels?.description,
				placeholder: this.props?.labels?.placeholder,
			},
			translations: this.props?.translations ?? false,
			default: this.props?.default,
			hidden: this.props?.hidden,
			disabled: this.props?.disabled,
			validation: this.props?.validation,
		} satisfies CFConfig<"json">;
	}
	// Methods
	responseValueFormat(props: {
		data: FieldProp;
	}) {
		return {
			value:
				Formatter.parseJSON<Record<string, unknown>>(
					props.data.json_value,
				) ??
				this.config.default ??
				null,
			meta: null,
		} satisfies CFResponse<"json">;
	}
	getInsertField(props: {
		item: FieldInsertItem;
		brickId: number;
		groupId: number | null;
	}) {
		return {
			key: this.config.key,
			type: this.config.type,
			localeCode: props.item.localeCode,
			collectionBrickId: props.brickId,
			groupId: props.groupId,
			textValue: null,
			intValue: null,
			boolValue: null,
			jsonValue: Formatter.stringifyJSON(props.item.value),
			mediaId: null,
			userId: null,
		} satisfies CFInsertItem<"json">;
	}
	typeValidation() {
		return {
			valid: true,
		};
	}
}

export default JsonCustomField;
