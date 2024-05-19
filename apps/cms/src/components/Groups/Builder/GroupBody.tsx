import T from "@/translations/index";
import classNames from "classnames";
import { type Component, For, createMemo, createSignal } from "solid-js";
import type { DragDropCBT } from "@/components/Partials/DragDrop";
import type { CustomField, FieldResponse } from "@lucidcms/core/types";
import { FaSolidGripLines, FaSolidCircleChevronUp } from "solid-icons/fa";
import brickStore from "@/store/brickStore";
import CustomFields from "@/components/Groups/Builder/CustomFields";
import DeleteDebounceButton from "@/components/Partials/DeleteDebounceButton";

interface GroupBodyProps {
	state: {
		brickIndex: number;
		fields: FieldResponse[];
		fieldConfig: CustomField;
		groupId: number | string;
		groupOpen: 1 | 0 | null;
		dragDrop: DragDropCBT;
		repeaterKey: string;
		dragDropKey: string;
		groupIndex: number;
		repeaterDepth: number;
	};
}

export const GroupBody: Component<GroupBodyProps> = (props) => {
	// -------------------------------
	// State
	const [getGroupOpen, setGroupOpen] = createSignal(!!props.state.groupOpen);

	// -------------------------------
	// Memos
	const groupId = createMemo(() => props.state.groupId);
	const brickIndex = createMemo(() => props.state.brickIndex);
	const configChildrenFields = createMemo(
		() => props.state.fieldConfig.fields,
	);
	const nextRepeaterDepth = createMemo(() => props.state.repeaterDepth + 1);
	const groupFields = createMemo(() => {
		return props.state.fields;
	});

	// -------------------------------
	// Functions
	const toggleDropdown = () => {
		setGroupOpen(!getGroupOpen());
		brickStore.get.toggleGroupOpen(
			props.state.brickIndex,
			props.state.repeaterKey,
			groupId(),
		);
	};

	// -------------------------------
	// Render
	return (
		<div
			data-dragkey={props.state.dragDropKey}
			class={classNames("w-full mb-2.5", {
				"opacity-60":
					props.state.dragDrop.getDragging()?.index === groupId(),
			})}
			onDragStart={(e) =>
				props.state.dragDrop.onDragStart(e, {
					index: groupId(),
					key: props.state.dragDropKey,
				})
			}
			onDragEnd={(e) => props.state.dragDrop.onDragEnd(e)}
			onDragEnter={(e) =>
				props.state.dragDrop.onDragEnter(e, {
					index: groupId(),
					key: props.state.dragDropKey,
				})
			}
			onDragOver={(e) => props.state.dragDrop.onDragOver(e)}
		>
			{/* Group Header */}
			<div
				class={classNames(
					"w-full bg-container-4 focus:outline-none focus:ring-1 ring-inset ring-primary-base cursor-pointer p-2.5 rounded-md border border-border flex justify-between items-center",
					{
						"border-b-0 rounded-b-none": getGroupOpen(),
					},
				)}
				onClick={toggleDropdown}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						toggleDropdown();
					}
				}}
				id={`accordion-header-${groupId()}`}
				aria-expanded={getGroupOpen()}
				aria-controls={`accordion-content-${groupId()}`}
				role="button"
				tabIndex="0"
			>
				<div class="flex items-center">
					<button
						type="button"
						class="text-icon-base mr-2 hover:text-primary-hover transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-1 ring-primary-base"
						onDragStart={(e) =>
							props.state.dragDrop.onDragStart(e, {
								index: groupId(),
								key: props.state.dragDropKey,
							})
						}
						onDragEnd={(e) => props.state.dragDrop.onDragEnd(e)}
						onDragEnter={(e) =>
							props.state.dragDrop.onDragEnter(e, {
								index: groupId(),
								key: props.state.dragDropKey,
							})
						}
						onDragOver={(e) => props.state.dragDrop.onDragOver(e)}
						draggable={true}
						aria-label={T()("change_order")}
					>
						<FaSolidGripLines class="w-4" />
					</button>
					<h3 class="text-sm text-body">
						{props.state.fieldConfig.title}-
						{props.state.groupIndex + 1}
					</h3>
				</div>
				<div class="flex gap-2">
					<DeleteDebounceButton
						callback={() => {
							brickStore.get.removeRepeaterGroup({
								brickIndex: brickIndex(),
								repeaterKey: props.state.repeaterKey,
								groupId: groupId(),
							});
						}}
					/>
					<button
						type="button"
						class={classNames(
							"text-2xl text-icon-base hover:text-icon-hover transition-all duration-200",
							{
								"transform rotate-180": getGroupOpen(),
							},
						)}
						tabIndex="-1"
					>
						<FaSolidCircleChevronUp size={16} />
					</button>
				</div>
			</div>
			{/* Group Body */}
			<div
				class={classNames(
					"border-border transform-gpu origin-top border-x border-b mb-2.5 last:mb-0 rounded-b-md overflow-hidden w-full duration-200 transition-all",
					{
						"bg-container-3": props.state.repeaterDepth % 2 !== 0,
						"scale-y-100 h-auto opacity-100 visible":
							getGroupOpen(),
						"scale-y-0 h-0 opacity-0 invisible": !getGroupOpen(),
					},
				)}
				role="region"
				aria-labelledby={`accordion-header-${groupId()}`}
			>
				<div class="p-15">
					<For each={configChildrenFields()}>
						{(config) => (
							<CustomFields.DynamicField
								state={{
									brickIndex: brickIndex(),
									fieldConfig: config,
									fields: groupFields(),
									groupId: groupId(),
									repeaterKey: props.state.repeaterKey,
									repeaterDepth: nextRepeaterDepth(),
								}}
							/>
						)}
					</For>
				</div>
			</div>
		</div>
	);
};
