import { Component, For } from "solid-js";
// Services
import api from "@/services/api";
// Hooks
import useSearchParams from "@/hooks/useSearchParams";
// Components
import Grid from "@/components/Groups/Grid";
import MediaCard, { MediaCardLoading } from "@/components/Cards/MediaCard";

interface MediaGridProps {
  searchParams: ReturnType<typeof useSearchParams>;
}

const MediaGrid: Component<MediaGridProps> = (props) => {
  // ----------------------------------
  // Queries
  const media = api.media.useGetMultiple({
    queryParams: {
      queryString: props.searchParams.getQueryString,
    },
    enabled: () => props.searchParams.getSettled(),
  });

  // ----------------------------------
  // Render
  return (
    <Grid.Root
      items={media.data?.data.length || 0}
      state={{
        isLoading: media.isLoading,
        isError: media.isError,
        isSuccess: media.isSuccess,
      }}
      searchParams={props.searchParams}
      meta={media.data?.meta}
      loadingCard={<MediaCardLoading />}
    >
      <For each={media.data?.data}>{(item) => <MediaCard media={item} />}</For>
    </Grid.Root>
  );
};

export default MediaGrid;
