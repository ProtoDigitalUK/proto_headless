import T from "@/translations";
import { Component, createMemo } from "solid-js";
import classNames from "classnames";
// Stores
import userStore from "@/store/userStore";
// Types
import { MediaResT } from "@headless/types/src/media";
// Hooks
import useRowTarget from "@/hooks/useRowTarget";
// Utils
import helpers from "@/utils/helpers";
// Components
import AspectRatio from "@/components/Partials/AspectRatio";
import Pill from "@/components/Partials/Pill";
import ClickToCopy from "@/components/Partials/ClickToCopy";
import ActionDropdown from "@/components/Partials/ActionDropdown";
import MediaPreview from "@/components/Partials/MediaPreview";

interface MediaCardProps {
	media: MediaResT;
	rowTarget: ReturnType<typeof useRowTarget<"clear" | "delete" | "update">>;
	contentLanguage?: number;
}

export const MediaCardLoading: Component = () => {
	// ----------------------------------
	// Return
	return (
		<li class={"bg-container border-border border rounded-md"}>
			<AspectRatio ratio="16:9">
				<span class="skeleton block w-full h-full rounded-b-none" />
			</AspectRatio>
			<div class="p-15">
				<span class="skeleton block h-5 w-1/2 mb-2" />
				<span class="skeleton block h-5 w-full" />
			</div>
		</li>
	);
};

const MediaCard: Component<MediaCardProps> = (props) => {
	// ----------------------------------
	// Memos
	const hasUpdatePermission = createMemo(() => {
		return userStore.get.hasPermission(["update_media"]).all;
	});

	const titleTranslation = createMemo(() => {
		return props.media.title_translations.find(
			(translation) => translation.language_id === props.contentLanguage,
		);
	});
	const altTranslation = createMemo(() => {
		return props.media.alt_translations.find(
			(translation) => translation.language_id === props.contentLanguage,
		);
	});

	// ----------------------------------
	// Return
	return (
		<li
			class={classNames(
				"bg-container border-border border rounded-md group overflow-hidden relative",
				{
					"cursor-pointer": hasUpdatePermission(),
				},
			)}
			onClick={() => {
				if (hasUpdatePermission()) {
					props.rowTarget.setTargetId(props.media.id);
					props.rowTarget.setTrigger("update", true);
				}
			}}
			onKeyUp={() => {}}
			onKeyDown={() => {}}
			onKeyPress={() => {}}
		>
			<div class="absolute top-15 right-15 z-10">
				<ActionDropdown
					actions={[
						{
							label: T("edit"),
							type: "button",
							onClick: () => {
								props.rowTarget.setTargetId(props.media.id);
								props.rowTarget.setTrigger("update", true);
							},
							permission: hasUpdatePermission(),
						},
						{
							label: T("clear_processed"),
							type: "button",
							onClick: () => {
								props.rowTarget.setTargetId(props.media.id);
								props.rowTarget.setTrigger("clear", true);
							},
							hide: props.media.type !== "image",
							permission: hasUpdatePermission(),
						},
						{
							label: T("delete"),
							type: "button",
							onClick: () => {
								props.rowTarget.setTargetId(props.media.id);
								props.rowTarget.setTrigger("delete", true);
							},
							permission: userStore.get.hasPermission([
								"delete_media",
							]).all,
						},
					]}
					options={{
						border: true,
					}}
				/>
			</div>
			{/* Image */}
			<AspectRatio ratio="16:9" innerClass={"overflow-hidden"}>
				<MediaPreview
					media={props.media}
					alt={
						altTranslation()?.value ||
						titleTranslation()?.value ||
						""
					}
				/>
				<span class="inset-0 top-auto absolute flex gap-1 p-15">
					<Pill theme="primary">
						{helpers.bytesToSize(props.media.meta.file_size)}
					</Pill>
					<Pill theme="primary">
						{props.media.meta.file_extension}
					</Pill>
				</span>
			</AspectRatio>
			{/* Content */}
			<div class="p-15 border-t border-border">
				<h3 class="mb-0.5 line-clamp-1">
					{titleTranslation()?.value || T("no_translation")}
				</h3>
				<ClickToCopy
					type="simple"
					text={props.media.key}
					value={props.media.url}
				/>
			</div>
		</li>
	);
};

export default MediaCard;
