// Models
import { EnvironmentT } from "@db/models/Environment.js";
// Internal packages
import { CollectionBrickConfigT } from "@builders/collection-builder/index.js";
// Services
import brickConfigService from "@services/brick-config/index.js";
// Types
import { CollectionResT } from "@headless/types/src/collections.js";
import { BrickConfigT } from "@headless/types/src/bricks.js";

export interface ServiceData {
  key: string;
  collection: CollectionResT;
  environment: EnvironmentT;
  type?: CollectionBrickConfigT["type"];
}

const isBrickAllowed = (data: ServiceData) => {
  // checks if the brick is allowed in the collection and environment and that there is config for it
  let allowed = false;
  const builderInstances = brickConfigService.getBrickConfig();

  const instance = builderInstances.find((b) => b.key === data.key);
  const envAssigned = (data.environment.assigned_bricks || [])?.includes(
    data.key
  );

  let builderBrick: CollectionBrickConfigT | undefined;
  let fixedBrick: CollectionBrickConfigT | undefined;

  if (!data.type) {
    builderBrick = data.collection.bricks?.find(
      (b) => b.key === data.key && b.type === "builder"
    ) as CollectionBrickConfigT | undefined;

    fixedBrick = data.collection.bricks?.find(
      (b) => b.key === data.key && b.type === "fixed"
    ) as CollectionBrickConfigT | undefined;
  } else {
    const brickF = data.collection.bricks?.find(
      (b) => b.key === data.key && b.type === data.type
    ) as CollectionBrickConfigT | undefined;
    if (data.type === "builder") builderBrick = brickF;
    if (data.type === "fixed") fixedBrick = brickF;
  }

  // Set response data
  if (instance && envAssigned && (builderBrick || fixedBrick)) allowed = true;

  let brick: BrickConfigT | undefined;
  if (instance) {
    brick = brickConfigService.getBrickData(instance, {
      include: ["fields"],
    });
  }

  return {
    allowed: allowed,
    brick: brick,
    collectionBrick: {
      builder: builderBrick,
      fixed: fixedBrick,
    },
  };
};

export default isBrickAllowed;
