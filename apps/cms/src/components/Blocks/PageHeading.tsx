import { Component, onMount, Switch, Match, Show } from "solid-js";

interface PageHeadingProps {
  title: string;
  description?: string;
  state?: {
    isLoading?: boolean;
  };
}

const PageHeading: Component<PageHeadingProps> = (props) => {
  let headerEle: HTMLElement | undefined;

  // ----------------------------------------
  // Functions
  function setHeaderHeight() {
    if (headerEle) {
      document.documentElement.style.setProperty(
        "--lucid_page-layout-header-height",
        `${headerEle.offsetHeight}px`
      );
    }
  }

  // ----------------------------------------
  // Mount
  onMount(() => {
    setHeaderHeight();
    window.addEventListener("resize", setHeaderHeight);
    return () => {
      window.removeEventListener("resize", setHeaderHeight);
    };
  });

  // ----------------------------------------
  // Render
  return (
    <header ref={headerEle} class="p-30 border-b border-border">
      <div class="max-w-3xl">
        <Switch>
          <Match when={props.state?.isLoading}>
            <div class="animate-pulse">
              <div class="h-10 bg-backgroundAccent rounded-md w-1/4"></div>
              <div class="h-4 bg-backgroundAccent rounded-md w-full mt-2"></div>
              <div class="h-4 bg-backgroundAccent rounded-md w-full mt-2"></div>
            </div>
          </Match>
          <Match when={!props.state?.isLoading}>
            <h1>{props.title}</h1>
            <Show when={props.description}>
              <p class="mt-2">{props.description}</p>
            </Show>
          </Match>
        </Switch>
      </div>
    </header>
  );
};

export default PageHeading;
