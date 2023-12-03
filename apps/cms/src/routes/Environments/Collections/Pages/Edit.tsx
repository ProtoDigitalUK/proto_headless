import T from "@/translations/index";
import {
  Component,
  createSignal,
  createMemo,
  createEffect,
  Show,
  Switch,
  Match,
  onCleanup,
} from "solid-js";
import { useParams, useNavigate } from "@solidjs/router";
import { parseTranslationBody } from "@/components/FieldGroups/Page";
import { FaSolidRobot, FaSolidTrash } from "solid-icons/fa";
import { setDefualtTranslations } from "@/components/FieldGroups/Page";
// Services
import api from "@/services/api";
// Utils
import helpers from "@/utils/helpers";
// Stores
import { environment } from "@/store/environmentStore";
import builderStore from "@/store/builderStore";
import contentLanguageStore from "@/store/contentLanguageStore";
// Types
import type { SelectMultipleValueT } from "@/components/Groups/Form/SelectMultiple";
import type { CollectionResT } from "@headless/types/src/collections";
import type { PagesResT } from "@headless/types/src/pages";
// Components
import PageBuilder from "@/components/Groups/PageBuilder";
import AddBrick from "@/components/Modals/Bricks/AddBrick";
import Button from "@/components/Partials/Button";
import DeletePage from "@/components/Modals/Pages/DeletePage";
import ContentLanguageSelect from "@/components/Partials/ContentLanguageSelect";
import NavigationGuard, {
  navGuardHook,
} from "@/components/Modals/NavigationGuard";
import SelectMediaModal from "@/components/Modals/Media/SelectMedia";
import LinkSelect from "@/components/Modals/CustomField/LinkSelect";

const EnvCollectionsPagesEditRoute: Component = () => {
  // ------------------------------
  // Hooks
  const params = useParams();
  const navigate = useNavigate();
  const navGuard = navGuardHook();

  // ------------------------------
  // State
  const [getTranslations, setTranslations] = createSignal<
    PagesResT["translations"]
  >([]);
  const [getParentId, setParentId] = createSignal<number | undefined>(
    undefined
  );
  const [getIsHomepage, setIsHomepage] = createSignal<boolean>(false);
  const [getSelectedCategories, setSelectedCategories] = createSignal<
    SelectMultipleValueT[]
  >([]);
  const [getSelectedAuthor, setSelectedAuthor] = createSignal<
    number | undefined
  >(undefined);

  // Modals
  const [getSelectBrickOpen, setSelectBrickOpen] = createSignal(false);
  const [getDeleteOpen, setDeleteOpen] = createSignal(false);

  // ----------------------------------
  // Params
  const pageId = createMemo(() => Number(params.id));
  const collectionKey = createMemo(() => params.collectionKey);

  // ----------------------------------
  // Queries
  const categories = api.environment.collections.categories.useGetMultiple({
    queryParams: {
      filters: {
        collection_key: collectionKey,
      },
      headers: {
        "headless-environment": environment,
      },
      perPage: -1,
    },
    enabled: () => !!collectionKey(),
  });
  const collection = api.environment.collections.useGetSingle({
    queryParams: {
      location: {
        collection_key: collectionKey,
      },
      headers: {
        "headless-environment": environment,
      },
    },
    enabled: () => !!collectionKey(),
  });
  const page = api.environment.collections.pages.useGetSingle({
    queryParams: {
      location: {
        id: pageId(),
      },
      include: {
        bricks: true,
      },
      headers: {
        "headless-environment": environment,
      },
    },
    enabled: () => !!pageId(),
    refetchOnWindowFocus: false,
  });
  const brickConfig = api.brickConfig.useGetAll({
    queryParams: {
      include: {
        fields: true,
      },
      filters: {
        collection_key: collectionKey,
        environment_key: environment,
      },
    },
  });

  // ----------------------------------
  // Mutations
  const updatePage = api.environment.collections.pages.useUpdateSingle({
    onSuccess: () => {
      builderStore.set("fieldsErrors", []);
    },
    onError: (errors) => {
      builderStore.set("fieldsErrors", errors?.errors?.body?.fields || []);
    },
    collectionName: collection.data?.data.singular || "",
  });

  // ----------------------------------
  // Memos
  const languages = createMemo(() => contentLanguageStore.get.languages);
  const contentLanguage = createMemo(
    () => contentLanguageStore.get.contentLanguage
  );

  const updateData = createMemo(() => {
    return helpers.updateData(
      {
        homepage: page.data?.data.homepage,
        parent_id: page.data?.data.parent_id || null,
        category_ids: page.data?.data.categories || [],
        author_id: page.data?.data.author?.id || null,
        translations: page.data?.data.translations || [],
      },
      {
        homepage: getIsHomepage(),
        parent_id: getParentId() || null,
        category_ids: getSelectedCategories().map(
          (cat) => cat.value
        ) as number[],
        author_id: getSelectedAuthor() || null,
        translations: getTranslations(),
      }
    );
  });

  const isLoading = createMemo(() => {
    return (
      categories.isLoading ||
      collection.isLoading ||
      page.isLoading ||
      brickConfig.isLoading
    );
  });
  const isSuccess = createMemo(() => {
    return (
      categories.isSuccess &&
      collection.isSuccess &&
      page.isSuccess &&
      brickConfig.isSuccess
    );
  });
  const isSaving = createMemo(() => {
    return updatePage.action.isPending;
  });
  const mutateErrors = createMemo(() => {
    return updatePage.errors();
  });

  const brickTranslationErrors = createMemo(() => {
    const errors = mutateErrors()?.errors?.body?.fields;
    if (errors === undefined) return false;
    return (
      errors.filter((field) => field.language_id !== contentLanguage()).length >
      0
    );
  });
  const pageTranslationErrors = createMemo(() => {
    const errors = mutateErrors()?.errors?.body?.translations?.children;
    if (errors) {
      return errors.length > 0;
    }
    return false;
  });

  // ---------------------------------
  // Functions
  const savePage = async () => {
    console.log(builderStore.get.bricks);

    const body = updateData().data;
    updatePage.action.mutate({
      id: pageId(),
      body: {
        homepage: body.homepage,
        parent_id: body.parent_id,
        category_ids: body.category_ids,
        author_id: body.author_id,
        translations: parseTranslationBody({
          translations: body.translations,
          isHomepage: getIsHomepage(),
          mode: "update",
        }),
        bricks: builderStore.get.bricks,
      },
      headers: {
        "headless-environment": environment() || "",
      },
    });
  };

  // ---------------------------------
  // Effects
  createEffect(() => {
    if (page.isSuccess && categories.isSuccess && collection.isSuccess) {
      builderStore.get.reset();
      setTranslations(
        setDefualtTranslations({
          translations: page.data?.data.translations || [],
          languages: languages(),
        })
      );
      setParentId(page.data?.data.parent_id || undefined);
      setIsHomepage(page.data?.data.homepage || false);
      setSelectedCategories(
        categories.data?.data
          .filter((cat) => {
            return page.data?.data.categories?.includes(cat.id);
          })
          ?.map((cat) => {
            return {
              value: cat.id,
              label: cat.title,
            };
          }) || []
      );
      setSelectedAuthor(page.data?.data.author?.id || undefined);

      builderStore.set("bricks", page.data.data.bricks || []);
      builderStore.get.addMissingFixedBricks(collection.data.data.bricks || []);
    }
  });

  onCleanup(() => {
    builderStore.get.reset();
  });

  // ----------------------------------
  // Render
  return (
    <>
      <header class="h-[60px] w-full bg-container border-b border-border px-15 flex items-center justify-between">
        <h1 class="text-xl">
          {T("edit_page_route_title")}
          <span class="text-unfocused ml-2.5">#{page.data?.data.id}</span>
        </h1>
        <div class="flex items-center gap-2.5">
          <div class="min-w-[250px]">
            <ContentLanguageSelect
              hasError={brickTranslationErrors() || pageTranslationErrors()}
            />
          </div>
          <Button type="button" theme="primary" size="small" onClick={savePage}>
            {T("save", {
              singular: collection.data?.data.singular || "",
            })}
          </Button>
          <Button
            theme="danger"
            size="icon"
            type="button"
            onClick={() => setDeleteOpen(true)}
          >
            <span class="sr-only">{T("delete")}</span>
            <FaSolidTrash />
          </Button>
        </div>
      </header>
      <Switch>
        <Match when={isLoading()}>
          <div class="fixed top-[60px] left-[70px] bottom-0 right-0 bg-black text-white flex items-center justify-center">
            temp loading
          </div>
        </Match>
        <Match when={isSuccess()}>
          <div class="relative h-[calc(100vh-60px)] w-full flex">
            {/* Sidebar Bricks & page fields */}
            <div class="w-[500px] max-h-screen overflow-y-auto p-15 hide-scrollbar">
              <PageBuilder.Sidebar
                state={{
                  brickConfig: brickConfig.data?.data || [],
                  pageId: pageId(),
                  collection: collection.data?.data as CollectionResT,
                  categories: categories.data?.data || [],
                  mutateErrors: mutateErrors,
                  getTranslations,
                  getParentId,
                  getIsHomepage,
                  getSelectedCategories,
                  getSelectedAuthor,
                }}
                setState={{
                  setTranslations,
                  setParentId,
                  setIsHomepage,
                  setSelectedCategories,
                  setSelectedAuthor,
                }}
              />
            </div>
            {/* Build */}
            <div class="h-full w-full p-15 pl-0">
              <div class="h-[40px] w-full mb-15 flex items-center">
                <Button
                  type="button"
                  theme="primary"
                  size="small"
                  onClick={() => {
                    setSelectBrickOpen(true);
                  }}
                >
                  {T("add_brick")}
                </Button>
                <button
                  class="h-10 w-10 rounded-full ml-2.5 bg-secondary flex items-center justify-center fill-white text-xl hover:bg-secondaryH duration-200 transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                  disabled
                >
                  <FaSolidRobot />
                </button>
              </div>
              <div class="w-full h-[calc(100%-55px)] bg-primary rounded-md brick-pattern relative">
                <div class="absolute inset-0 overflow-y-scroll z-10 right-[175px] p-15 hide-scrollbar">
                  <PageBuilder.Builder
                    state={{
                      brickConfig: brickConfig.data?.data || [],
                    }}
                  />
                </div>
                <div class="absolute top-15 right-15 bottom-15 w-[160px] z-20 overflow-y-scroll hide-scrollbar">
                  <PageBuilder.PreviewBar
                    data={{
                      brickConfig: brickConfig.data?.data || [],
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Modals */}
          <AddBrick
            state={{
              open: getSelectBrickOpen(),
              setOpen: setSelectBrickOpen,
            }}
            data={{
              collection: collection.data?.data,
              brickConfig: brickConfig.data?.data || [],
            }}
          />
          <DeletePage
            id={page.data?.data.id}
            state={{
              open: getDeleteOpen(),
              setOpen: setDeleteOpen,
            }}
            collection={collection.data?.data as CollectionResT}
            callbacks={{
              onSuccess: () => {
                navigate(
                  `/env/${environment()}/collection/${collection.data?.data
                    .key}`
                );
              },
            }}
          />
          <NavigationGuard
            state={{
              open: navGuard.getModalOpen(),
              setOpen: navGuard.setModalOpen,
              targetElement: navGuard.getTargetElement(),
            }}
          />
          <SelectMediaModal />
          <LinkSelect />
          <Show when={isSaving()}>
            <div class="fixed inset-0 bg-black bg-opacity-50 z-50" />
          </Show>
        </Match>
      </Switch>
    </>
  );
};

export default EnvCollectionsPagesEditRoute;
