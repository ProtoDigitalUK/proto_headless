import T from "@/translations";
import {
	type Component,
	Show,
	createSignal,
	For,
	Switch,
	Match,
} from "solid-js";
import classnames from "classnames";
// Types
import type { ErrorResult } from "@lucidcms/core/types";
// Components
import { FaSolidCheck, FaSolidXmark, FaSolidSort } from "solid-icons/fa";
import { DropdownMenu } from "@kobalte/core";
import DropdownContent from "@/components/Partials/DropdownContent";
// Components
import Form from "@/components/Groups/Form";

export type SelectMultipleValueT = {
	value: string | number;
	label: string;
};

interface SelectMultipleProps {
	id: string;
	values: SelectMultipleValueT[];
	onChange: (_value: SelectMultipleValueT[]) => void;
	options: SelectMultipleValueT[];
	name: string;
	copy?: {
		label?: string;
		placeholder?: string;
		describedBy?: string;
	};
	required?: boolean;
	disabled?: boolean;
	errors?: ErrorResult;
	noMargin?: boolean;
	theme?: "basic";
}

export const SelectMultiple: Component<SelectMultipleProps> = (props) => {
	const [open, setOpen] = createSignal(false);
	const [inputFocus, setInputFocus] = createSignal(false);

	// ----------------------------------------
	// Functions
	const setValues = (value: SelectMultipleValueT[]) => {
		props.onChange(value);
	};
	const toggleValue = (value: SelectMultipleValueT) => {
		const exists = props.values.find((v) => v.value === value.value);
		if (!exists) {
			setValues([...props.values, value]);
		} else {
			setValues(props.values.filter((v) => v.value !== value.value));
		}
	};

	// ----------------------------------------
	// Render
	return (
		<div
			class={classnames("w-full", {
				"mb-0": props.noMargin,
				"mb-15 last:mb-0": !props.noMargin,
				"mb-2.5 last:mb-0": !props.noMargin && props.theme === "basic",
			})}
		>
			{/* Select */}
			<DropdownMenu.Root
				sameWidth={true}
				open={open()}
				onOpenChange={setOpen}
				flip={true}
				gutter={5}
			>
				<div
					class={classnames(
						"flex flex-col transition-colors duration-200 ease-in-out relative",
						{
							"border-primary-base bg-container-3":
								inputFocus() && props.theme !== "basic",
							"border-error-base":
								props.errors?.message !== undefined,
							"bg-container-4 rounded-md border border-border":
								props.theme !== "basic",
						},
					)}
				>
					{/* Label */}
					<Form.Label
						id={props.id}
						label={props.copy?.label}
						required={props.required}
						theme={props.theme}
					/>
					{/* Select */}
					<div
						class={classnames(
							"w-full pointer-events-none z-10 focus:outline-none px-2.5 text-sm text-title font-medium justify-between flex ",
							{
								"pt-2 min-h-[40px]":
									props.copy?.label === undefined,
								"min-h-[32px] mt-1":
									props.copy?.label !== undefined,
								"bg-container-1 border border-border flex items-center min-h-[40px] rounded-md mt-1 focus:border-primary-base duration-200 transition-colors":
									props.theme === "basic",
								"bg-transparent pb-2 rounded-b-md":
									props.theme !== "basic",
							},
						)}
					>
						{/* Selected Items */}
						<div class="flex flex-wrap gap-1">
							<For each={props.values}>
								{(value) => (
									<span class="bg-primary-base hover:bg-primary-hover duration-200 transition-colors rounded-md text-primary-contrast hover:text-error-base px-2 py-0.5 flex items-center text-sm focus:outline-none">
										{value.label}
										<button
											type="button"
											class="ml-1 pointer-events-auto duration-200 transition-colors rounded-full focus:outline-none focus:ring-1 ring-error-base focus:fill-error-base"
											onClick={(e) => {
												e.stopPropagation();
												e.preventDefault();
												setValues(
													props.values.filter(
														(v) =>
															v.value !==
															value.value,
													),
												);
											}}
										>
											<FaSolidXmark size={16} class="" />
											<span class="sr-only">
												{T("remove")}
											</span>
										</button>
									</span>
								)}
							</For>
						</div>
						{/* Icons */}
						<div class="flex items-center ml-2.5">
							<Show when={props.values.length > 0}>
								<button
									type="button"
									class="bg-primary-base pointer-events-auto h-5 w-5 flex items-center justify-center rounded-full mr-1 text-primary-contrast hover:bg-error-base hover:text-white duration-200 transition-colors focus:outline-none focus:ring-1 ring-error-base focus:text-error-base"
									onClick={() => {
										setValues([]);
									}}
									onKeyDown={(e) => {
										if (
											e.key === "Backspace" ||
											e.key === "Delete" ||
											e.key === "Enter" ||
											e.key === " "
										) {
											setValues([]);
										}
									}}
								>
									<FaSolidXmark size={14} />
									<span class="sr-only">
										{T("remove_all")}
									</span>
								</button>
							</Show>
							<FaSolidSort size={16} class="text-title ml-1" />
						</div>
					</div>
					{/* Trigger */}
					<DropdownMenu.Trigger
						class="absolute inset-0 w-full left-0 rounded-md focus:outline-none"
						onFocus={() => setInputFocus(true)}
						onBlur={() => setInputFocus(false)}
					/>
				</div>
				<DropdownContent
					options={{
						anchorWidth: true,
						rounded: true,
						class: "max-h-36 overflow-y-auto z-[70] !p-1.5",
					}}
				>
					<Switch>
						<Match when={props.options.length > 0}>
							<ul class="flex flex-col">
								<For each={props.options}>
									{(option) => (
										<DropdownMenu.Item
											class="flex items-center justify-between text-sm text-body hover:bg-primary-hover hover:text-primary-contrast px-2.5 py-1 rounded-md cursor-pointer focus:outline-none focus:bg-primary-hover focus:text-primary-contrast"
											onSelect={() => {
												toggleValue(option);
											}}
											closeOnSelect={false}
										>
											<span>{option.label}</span>
											<Show
												when={props.values.find(
													(v) =>
														v.value ===
														option.value,
												)}
											>
												<FaSolidCheck
													size={14}
													class="text-primary-contrast mr-2"
												/>
											</Show>
										</DropdownMenu.Item>
									)}
								</For>
							</ul>
						</Match>
						<Match when={props.options.length === 0}>
							<span class="text-primary-contrast w-full block px-2.5 py-1 text-sm">
								{T("no_options_available")}
							</span>
						</Match>
					</Switch>
				</DropdownContent>
			</DropdownMenu.Root>

			<Form.DescribedBy
				id={props.id}
				describedBy={props.copy?.describedBy}
			/>
			<Form.ErrorMessage id={props.id} errors={props.errors} />
		</div>
	);
};
