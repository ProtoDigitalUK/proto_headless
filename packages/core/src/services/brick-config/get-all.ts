import z from "zod";
// Schema
import bricksSchema from "@schemas/bricks";
// Services
import brickConfig from "@services/brick-config";
import collections from "@services/collections";
import environments from "@services/environments";

export interface ServiceData {
  query: z.infer<typeof bricksSchema.config.getAll.query>;
  collection_key: string;
  environment_key: string;
}

const getAll = async (data: ServiceData) => {
  const environment = await environments.getSingle({
    key: data.environment_key,
  });
  const collection = await collections.getSingle({
    collection_key: data.collection_key,
    environment_key: data.environment_key,
    environment: environment,
  });

  const allowedBricks = brickConfig.getAllAllowedBricks({
    collection: collection,
    environment: environment,
  });

  if (!data.query.include?.includes("fields")) {
    allowedBricks.bricks.forEach((brick) => {
      delete brick.fields;
    });
  }

  return allowedBricks.bricks;
};

export default getAll;
