// Services
import { CollectionBuilderT } from "@builders/collection-builder/index.js";
// Types
import { CollectionResT } from "@headless/types/src/collections.js";

const formatCollection = (instance: CollectionBuilderT): CollectionResT => {
  return {
    key: instance.key,
    ...instance.config,
  };
};

export default formatCollection;
