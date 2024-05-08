import {
	type Component,
	createSignal,
	createMemo,
	batch,
	createEffect,
} from "solid-js";
import type {
	CustomField,
	MediaMeta,
	FieldResponse,
	FieldErrors,
} from "@lucidcms/core/types";
import brickStore from "@/store/brickStore";
import Form from "@/components/Groups/Form";

interface MediaFieldProps {
	state: {
		brickIndex: number;
		fieldConfig: CustomField;
		fieldData?: FieldResponse;
		groupId?: number | string;
		repeaterKey?: string;
		contentLanguage?: number;
		fieldError: FieldErrors | undefined;
	};
}

export const MediaField: Component<MediaFieldProps> = (props) => {
	// -------------------------------
	// State
	const [getValue, setValue] = createSignal<number | undefined>();
	const [getMeta, setMeta] = createSignal<MediaMeta | undefined>();

	// -------------------------------
	// Memos
	const fieldData = createMemo(() => {
		return props.state.fieldData;
	});

	// -------------------------------
	// Effects
	createEffect(() => {
		const value = fieldData()?.value as number | undefined;
		const meta = fieldData()?.meta as MediaMeta | undefined;
		setValue(value);
		setMeta(meta);
	});

	// -------------------------------
	// Render
	return (
		<>
			<Form.MediaSelect
				id={`field-${props.state.fieldConfig.key}-${props.state.brickIndex}-${props.state.groupId}`}
				value={getValue()}
				meta={getMeta()}
				onChange={(value, meta) => {
					batch(() => {
						brickStore.get.setFieldValue({
							brickIndex: props.state.brickIndex,
							key: props.state.fieldConfig.key,
							groupId: props.state.groupId,
							repeaterKey: props.state.repeaterKey,
							value: value,
							meta: meta,
						});
						setValue(value ?? undefined);
						setMeta(meta ?? undefined);
					});
				}}
				copy={{
					label: props.state.fieldConfig.title,
					describedBy: props.state.fieldConfig.description,
				}}
				disabled={props.state.fieldConfig.disabled}
				extensions={props.state.fieldConfig.validation?.extensions}
				type={props.state.fieldConfig.validation?.type}
				errors={props.state.fieldError}
				required={props.state.fieldConfig.validation?.required || false}
			/>
		</>
	);
};