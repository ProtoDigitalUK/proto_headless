import { type Component, createMemo, For, createSignal } from "solid-js";
import type { CollectionBrickConfig } from "@lucidcms/core/types";
import classNames from "classnames";
import brickStore, { type BrickData } from "@/store/brickStore";
import Builder from "@/components/Groups/Builder";

interface FixedBricksProps {
	brickConfig: CollectionBrickConfig[];
}

export const FixedBricks: Component<FixedBricksProps> = (props) => {
	// ------------------------------
	// Memos
	const fixedBricks = createMemo(() =>
		brickStore.get.bricks
			.filter((brick) => brick.type === "fixed")
			.sort((a, b) => a.order - b.order),
	);

	// ----------------------------------
	// Render
	return (
		<ul>
			<For each={fixedBricks()}>
				{(brick) => (
					<FixedBrickRow
						brick={brick}
						brickConfig={props.brickConfig}
					/>
				)}
			</For>
		</ul>
	);
};

interface FixedBrickRowProps {
	brick: BrickData;
	brickConfig: CollectionBrickConfig[];
}

const FixedBrickRow: Component<FixedBrickRowProps> = (props) => {
	// -------------------------------
	// State
	const [getBrickOpen, setBrickOpen] = createSignal(!!props.brick.open);

	// ------------------------------
	// Memos
	const config = createMemo(() => {
		return props.brickConfig.find((brick) => brick.key === props.brick.key);
	});
	const brickIndex = createMemo(() => {
		return brickStore.get.bricks.findIndex(
			(brick) => brick.id === props.brick.id,
		);
	});

	// -------------------------------
	// Functions
	const toggleDropdown = () => {
		setBrickOpen(!getBrickOpen());
		brickStore.get.toggleBrickOpen(brickIndex());
	};

	return (
		<li class="w-full border-b border-border p-15 md:p-30">
			<div
				class={classNames("flex justify-between cursor-pointer", {
					"mb-15": getBrickOpen(),
				})}
				onClick={toggleDropdown}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						toggleDropdown();
					}
				}}
				id={`fixed-brick-${props.brick.key}`}
				aria-expanded={getBrickOpen()}
				aria-controls={`fixed-brick-content-${props.brick.key}`}
				role="button"
				tabIndex="0"
			>
				<h2>{config()?.title}:</h2>
				<button
					type="button"
					class={classNames("text-2xl", {
						"transform rotate-180": getBrickOpen(),
					})}
				>
					^
				</button>
			</div>
			<Builder.BrickBody
				state={{
					open: getBrickOpen(),
					brick: props.brick,
					brickIndex: brickIndex(),
					configFields: config()?.fields || [],
					labelledby: `fixed-brick-${props.brick.key}`,
				}}
			/>
		</li>
	);
};
