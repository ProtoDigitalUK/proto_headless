import T from "@/translations";
import { Component, createMemo, createSignal } from "solid-js";
// Services
import api from "@/services/api";
// Stores
import { environment } from "@/store/environmentStore";
import contentLanguage from "@/store/contentLanguageStore";
// Types
import type { ValueT, SelectProps } from "@/components/Groups/Form/Select";
import type { ErrorResult } from "@/types/api";
// Components
import Form from "@/components/Groups/Form";

interface PageSearchSelectProps {
  value: ValueT;
  setValue: (_value: ValueT) => void;
  collectionKey: string;
  name: string;
  id: string;
  copy?: SelectProps["copy"];
  errors?: ErrorResult;
}

const PageSearchSelect: Component<PageSearchSelectProps> = (props) => {
  const [getSearchQuery, setSearchQuery] = createSignal<string>("");
  const language = createMemo(() => contentLanguage.get.contentLanguage);

  // ----------------------------------
  // Queries
  const pages = api.environment.collections.pages.useGetMultiple({
    queryParams: {
      filters: {
        collection_key: props.collectionKey,
        title: getSearchQuery,
      },
      headers: {
        "lucid-environment": environment,
        "lucid-content-lang": language,
      },
      perPage: 10,
    },
  });

  // ----------------------------------
  // Render
  return (
    <Form.Select
      id={props.id}
      value={props.value}
      onChange={props.setValue}
      copy={props.copy}
      name={props.name}
      search={{
        value: getSearchQuery(),
        onChange: setSearchQuery,
        isLoading: pages.isLoading,
      }}
      options={
        pages.data?.data
          .filter((page) => page.homepage !== true)
          .map((page) => ({
            value: page.id,
            label: page.translations.length
              ? page.translations[0].title ?? T("no_translation")
              : T("no_translation"),
          })) || []
      }
      errors={props.errors}
    />
  );
};

export default PageSearchSelect;
