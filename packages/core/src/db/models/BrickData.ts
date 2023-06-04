import client from "@db/db";
import { LucidError } from "@utils/error-handler";
import BrickBuilder, { FieldTypes } from "@lucid/brick-builder";

// -------------------------------------------
// Types

interface BrickFieldCreateData {
  id?: number;
  parent_repeater?: number;
  group_position?: number;
  key: string;
  type: FieldTypes;
  value: any;
  items?: Array<BrickFieldCreateData>;
}

export interface BrickDataCreateData {
  id?: number;
  key: string;
  order: number;
  fields?: Array<BrickFieldCreateData>;
}

// Methods
type BrickDataCreateOrUpdate = (
  type: "page" | "group",
  referenceId: number,
  data: BrickDataCreateData
) => Promise<void>;

type BrickDataDeleteUnused = (
  type: "page" | "group",
  referenceId: number,
  brickIds: Array<number | undefined>
) => Promise<void>;

// -------------------------------------------
// Page Brick
export type BrickDataT = {
  id: number;
  brick_key: string;
  page_id?: number;
  group_id?: number;
  brick_order: number;
  fields?: Array<{
    id: number;
    page_brick_id: number;
    parent_repeater: number | null;

    key: string;
    type: FieldTypes;
    group_position?: number;

    text_value?: string;
    int_value?: number;
    bool_value?: boolean;
    datetime_value?: string;
    json_value?: any;
    image_value?: string;
    file_value?: string;

    items?: Array<BrickDataT["fields"]>;
  }>;
};

export default class BrickData {
  // -------------------------------------------
  // Methods
  static createOrUpdate: BrickDataCreateOrUpdate = async (
    type,
    referenceId,
    data
  ) => {
    // Using the brickbuilder, validate the data type against the custom field type, along with the key to see if it exists
    // BrickBuilder.validateBrickData(data);
    // TODO: implement this

    // Create or update the page brick record
    const promises = [];

    // Create the page brick record
    const brickId = data.id
      ? await BrickData.#updateSinglePageBrick(data)
      : await BrickData.#createSinglePageBrick(type, referenceId, data);

    // for each field, create or update the field, if its a repeater, create or update the repeater and items
    if (!data.fields) return;

    for (const field of data.fields) {
      if (field.type === "tab") continue;

      if (field.type === "repeater")
        promises.push(BrickData.#createOrUpdateRepeater(brickId, field));
      else promises.push(BrickData.#createOrUpdateField(brickId, field));
    }

    await Promise.all(promises);
  };
  static deleteUnused: BrickDataDeleteUnused = async (
    type,
    referenceId,
    brickIds
  ) => {
    const referenceKey = type === "page" ? "page_id" : "group_id";

    // Fetch all bricks for the page
    const pageBrickIds = await client.query<{ id: number }>({
      text: `SELECT id FROM lucid_page_bricks WHERE ${referenceKey} = $1`,
      values: [referenceId],
    });

    // Filter out the bricks that are still in use
    const bricksToDelete = pageBrickIds.rows.filter(
      (brick) => !brickIds.includes(brick.id)
    );

    // Delete the bricks
    const promises = bricksToDelete.map((brick) =>
      client.query({
        text: `DELETE FROM lucid_page_bricks WHERE id = $1`,
        values: [brick.id],
      })
    );

    try {
      await Promise.all(promises);
    } catch (err) {
      throw new LucidError({
        type: "basic",
        name: "Brick Delete Error",
        message: `There was an error deleting bricks for "${type}" of ID "${referenceId}"!`,
        status: 500,
      });
    }
  };
  // -------------------------------------------
  // Page Brick
  static #createSinglePageBrick = async (
    type: "page" | "group",
    referenceId: number,
    data: BrickDataCreateData
  ) => {
    const referenceKey = type === "page" ? "page_id" : "group_id";

    const brickRes = await client.query(
      `INSERT INTO 
        lucid_page_bricks (brick_key, ${referenceKey}, brick_order) 
      VALUES 
        ($1, $2, $3)
      RETURNING id`,
      [data.key, referenceId, data.order]
    );

    if (!brickRes.rows[0]) {
      throw new LucidError({
        type: "basic",
        name: "Page Brick Create Error",
        message: "Could not create page brick",
        status: 500,
      });
    }

    return brickRes.rows[0].id;
  };
  static #updateSinglePageBrick = async (data: BrickDataCreateData) => {
    const brickRes = await client.query(
      `UPDATE 
        lucid_page_bricks 
      SET 
        brick_order = $1
      WHERE 
        id = $2
      RETURNING id`,
      [data.order, data.id]
    );

    if (!brickRes.rows[0]) {
      throw new LucidError({
        type: "basic",
        name: "Page Brick Update Error",
        message: "Could not update page brick",
        status: 500,
      });
    }

    return brickRes.rows[0].id;
  };
  // -------------------------------------------
  // Fields
  static #createOrUpdateField = async (
    brickId: number,
    data: {
      id?: BrickFieldCreateData["id"];
      key: BrickFieldCreateData["key"];
      type: BrickFieldCreateData["type"];
      value: BrickFieldCreateData["value"];
      parent_repeater?: BrickFieldCreateData["parent_repeater"];
      group_position?: BrickFieldCreateData["group_position"];
    }
  ) => {
    let fieldId;

    // Check if id exists. If it does, update, else create.
    if (data.id) {
      const { columns, aliases, values } = BrickData.#generateFieldData(
        [BrickData.#valueKey(data.type), "group_position"],
        [data.value, data.group_position]
      );

      // Generate the SET part of the update statement
      const setStatements = columns
        .map((column, i) => `${column} = ${aliases[i]}`)
        .join(", ");

      const fieldRes = await client.query({
        text: `UPDATE lucid_fields SET ${setStatements} WHERE id = $${
          aliases.length + 1
        } RETURNING id`,
        values: [...values, data.id],
      });

      fieldId = fieldRes.rows[0].id;
    } else {
      // Check if the field already exists
      const fieldExists = await BrickData.#checkFieldExists(
        brickId,
        data.key,
        data.type,
        data.parent_repeater,
        data.group_position
      );
      if (fieldExists) {
        throw new LucidError({
          type: "basic",
          name: "Field Create Error",
          message: `Could not create field "${data.key}" for page brick "${brickId}". Field already exists.`,
          status: 409,
        });
      }

      // Create the field
      const { columns, aliases, values } = BrickData.#generateFieldData(
        [
          "page_brick_id",
          "key",
          "type",
          BrickData.#valueKey(data.type),
          "parent_repeater",
          "group_position",
        ],
        [
          brickId,
          data.key,
          data.type,
          data.value,
          data.parent_repeater,
          data.group_position,
        ]
      );

      const fieldRes = await client.query({
        text: `INSERT INTO lucid_fields (${columns.join(
          ", "
        )}) VALUES (${aliases.join(", ")}) RETURNING id`,
        values: values,
      });

      if (!fieldRes.rows[0]) {
        throw new LucidError({
          type: "basic",
          name: "Field Create Error",
          message: `Could not create field "${data.key}" for brick "${brickId}".`,
          status: 500,
        });
      }

      fieldId = fieldRes.rows[0].id;
    }

    return fieldId;
  };
  static #checkFieldExists = async (
    brickId: number,
    key: string,
    type: string,
    parent_repeater?: number,
    group_position?: number
  ) => {
    let queryText =
      "SELECT EXISTS(SELECT 1 FROM lucid_fields WHERE page_brick_id = $1 AND key = $2 AND type = $3";
    let queryValues = [brickId, key, type];

    // If parent repeater is provided, add it to the query
    if (parent_repeater !== undefined) {
      queryText += " AND parent_repeater = $4";
      queryValues.push(parent_repeater);
    }

    // If group_position is provided, add it to the query
    if (group_position !== undefined) {
      queryText += " AND group_position = $5";
      queryValues.push(group_position);
    }

    queryText += ")";

    const res = await client.query<{ exists: boolean }>({
      text: queryText,
      values: queryValues,
    });

    return res.rows[0].exists;
  };
  // -------------------------------------------
  // Repeater Field
  static #createOrUpdateRepeater = async (
    brickId: number,
    data: BrickFieldCreateData
  ) => {
    let repeaterId;

    // Check if id exists. If it does, update, else create.
    if (data.id && data.group_position !== undefined) {
      const repeaterRes = await client.query<{ id: number }>({
        text: `UPDATE lucid_fields SET group_position = $1 WHERE id = $2 RETURNING id`,
        values: [data.group_position, data.id],
      });

      repeaterId = repeaterRes.rows[0].id;
    } else {
      const repeaterExists = await BrickData.#checkFieldExists(
        brickId,
        data.key,
        data.type,
        data.parent_repeater,
        data.group_position
      );

      if (repeaterExists) {
        throw new LucidError({
          type: "basic",
          name: "Repeater Create Error",
          message: `A repeater with the same page_brick_id, key, and parent_repeater already exists.`,
          status: 409,
        });
      }

      const { columns, aliases, values } = BrickData.#generateFieldData(
        ["page_brick_id", "key", "type", "parent_repeater", "group_position"],
        [
          brickId,
          data.key,
          data.type,
          data.parent_repeater,
          data.group_position,
        ]
      );

      const repeaterRes = await client.query<{ id: number }>({
        text: `INSERT INTO lucid_fields (${columns.join(
          ", "
        )}) VALUES (${aliases.join(", ")}) RETURNING id`,
        values: values,
      });

      repeaterId = repeaterRes.rows[0].id;
    }

    // If it has no items, return
    if (!data.items) return;

    // For each item, create or update the repeater item and then create or update the fields for that item
    const promises = [];

    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];
      if (item.type === "tab") continue;

      // Update item data
      item.parent_repeater = repeaterId;

      // If its a repeater, recursively call this function
      if (item.type === "repeater") {
        promises.push(BrickData.#createOrUpdateRepeater(brickId, item));
        continue;
      }

      // Update the field
      promises.push(BrickData.#createOrUpdateField(brickId, item));
    }

    await Promise.all(promises);
  };
  // -------------------------------------------
  // Utils
  static #valueKey = (type: BrickFieldCreateData["type"]) => {
    switch (type) {
      case "text":
        return "text_value";
      case "wysiwyg":
        return "text_value";
      case "image":
        return "image_value";
      case "file":
        return "file_value";
      case "number":
        return "int_value";
      case "checkbox":
        return "bool_value";
      case "select":
        return "text_value";
      case "textarea":
        return "text_value";
      case "json":
        return "json_value";
      default:
        return "text_value";
    }
  };
  static #generateFieldData = (
    columns: string[],
    values: (any | undefined)[]
  ) => {
    // Ensure columns and values have the same length
    if (columns.length !== values.length) {
      throw new Error("Columns and values arrays must have the same length");
    }

    // Filter out undefined values and their corresponding columns
    const filteredData = columns
      .map((col, i) => ({ col, val: values[i] }))
      .filter((data) => data.val !== undefined);

    const keys = filteredData.map((data) => data.col);
    const realValues = filteredData.map((data) => data.val);
    const aliases = realValues.map((_, i) => `$${i + 1}`);

    return {
      columns: keys,
      aliases: aliases,
      values: realValues,
    };
  };
}
