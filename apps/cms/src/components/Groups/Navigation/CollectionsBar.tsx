import T from "@/translations";
import {
	Component,
	createEffect,
	createSignal,
	Show,
	For,
	createMemo,
	Switch,
	Match,
} from "solid-js";
import { useParams } from "@solidjs/router";
// Store
import { environment } from "@/store/environmentStore";
// Types
import { CollectionResT } from "@headless/types/src/collections";
// Components
import Navigation from "@/components/Groups/Navigation";

interface CollectionsBarProps {
	collections: CollectionResT[];
	state: {
		isLoading: boolean;
		isError: boolean;
	};
}

export const CollectionsBar: Component<CollectionsBarProps> = (props) => {
	// ----------------------------------
	// Hooks & States
	// const location = useLocation();
	const params = useParams();
	const [showBar, setShowBar] = createSignal(false);

	// ----------------------------------
	// Effects
	createEffect(() => {
		// Hides the bar when editing a single page of collection type pages
		if (params.id !== undefined) {
			setShowBar(false);
			return;
		}
		setShowBar(true);
		// TODO: update pathing
		// if (location.pathname.includes("/env/")) {
		// 	setShowBar(true);
		// } else {
		// 	setShowBar(false);
		// }
	});

	// ----------------------------------
	// Memos
	const pagesCollections = createMemo(() => {
		return props.collections.filter(
			(collection) => collection.type === "multiple-page",
		);
	});
	const singlePagesCollections = createMemo(() => {
		return props.collections.filter(
			(collection) => collection.type === "single-page",
		);
	});

	// ----------------------------------
	// Render
	return (
		<Show when={showBar() && environment() !== undefined}>
			<div class="w-[240px] bg-container border-r border-border h-full">
				<nav class="relative">
					<Switch>
						<Match when={props.state.isLoading}>
							<div class="px-15">
								<span class="skeleton block h-12 w-full mb-2.5" />
								<span class="skeleton block h-12 w-full mb-2.5" />
								<span class="skeleton block h-12 w-full mb-2.5" />
								<span class="skeleton block h-12 w-full mb-2.5" />
								<span class="skeleton block h-12 w-full mb-2.5" />
								<span class="skeleton block h-12 w-full mb-2.5" />
							</div>
						</Match>
						<Match when={props.state.isError}>error</Match>
						<Match when={true}>
							{/* Multi Collections */}
							<Show when={pagesCollections().length > 0}>
								<Navigation.LinkGroup
									title={T("multi_collections")}
								>
									<For each={pagesCollections()}>
										{(collection) => (
											<Navigation.Link
												title={collection.title}
												href={`/env/${environment()}/collection/${
													collection.key
												}`}
												icon="page"
											/>
										)}
									</For>
								</Navigation.LinkGroup>
							</Show>
							{/* Single Collections */}
							<Show when={singlePagesCollections().length > 0}>
								<Navigation.LinkGroup
									title={T("single_collections")}
								>
									<For each={singlePagesCollections()}>
										{(collection) => (
											<Navigation.Link
												title={collection.title}
												href={`/env/${environment()}/${
													collection.key
												}`}
												icon="page"
											/>
										)}
									</For>
								</Navigation.LinkGroup>
							</Show>
						</Match>
					</Switch>
				</nav>
			</div>
		</Show>
	);
};