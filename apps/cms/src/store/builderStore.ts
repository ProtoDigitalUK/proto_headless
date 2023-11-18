import { createStore, produce } from "solid-js/store";
import shortUUID from "short-uuid";
// Utils
import brickHelpers from "@/utils/brick-helpers";
// Types
import type { FieldTypes } from "@lucid/types/src/pages";
import type { BrickFieldValueT, CustomFieldT } from "@lucid/types/src/bricks";

export interface BrickStoreFieldT {
  fields_id?: number;
  key: string;
  type: FieldTypes;
  value?: BrickFieldValueT;
  group_id?: string | number;
}

export interface BrickStoreGroupT {
  group_id: string | number;
  parent_group_id: null | string | number;
  repeater_key: string;
  group_order: number;
}

export interface BrickDataT {
  id: number | string;
  key: string;
  fields: Array<BrickStoreFieldT>;
  groups: Array<BrickStoreGroupT>;
  order: number;
  type: "builder" | "fixed";
  position?: "top" | "bottom" | "sidebar";
}

type BuilderStoreT = {
  bricks: Array<BrickDataT>;
  // functions
  reset: () => void;
  addBrick: (_props: {
    brick: {
      key: BrickDataT["key"];
      fields: BrickDataT["fields"];
      groups: BrickDataT["groups"];
      order?: BrickDataT["order"];
      type: BrickDataT["type"];
      position?: BrickDataT["position"];
    };
  }) => void;
  removeBrick: (_props: { index: number }) => void;
  sortOrder: (_props: { from: number | string; to: number | string }) => void;
  findFieldIndex: (_props: {
    fields: BrickStoreFieldT[];
    key: string;
    groupId?: BrickStoreFieldT["group_id"];
  }) => number;
  addField: (_props: {
    brickIndex: number;
    field: CustomFieldT;
    groupId?: BrickStoreFieldT["group_id"];
  }) => void;
  updateFieldValue: (_props: {
    brickIndex: number;
    key: string;
    value: BrickFieldValueT;
    groupId?: BrickStoreFieldT["group_id"];
  }) => void;
  addGroup: (_props: {
    brickIndex: number;
    fields: CustomFieldT[];
    repeaterKey: string;
    parentGroupId: BrickStoreGroupT["parent_group_id"];
    order: number;
  }) => void;
  removeGroup: (_props: {
    brickIndex: number;
    groupId: BrickStoreGroupT["group_id"];
  }) => void;
  swapGroupOrder: (_props: {
    brickIndex: number;

    groupId: BrickStoreGroupT["group_id"];
    targetGroupId: BrickStoreGroupT["group_id"];
  }) => void;
};

const [get, set] = createStore<BuilderStoreT>({
  bricks: [],

  reset() {
    set("bricks", []);
  },

  // --------------------------------------------
  // Bricks
  addBrick({ brick }) {
    set(
      "bricks",
      produce((draft) => {
        const targetOrder =
          brick.order || brickHelpers.getNextBrickOrder(brick.type);

        draft.push({
          id: `temp-${shortUUID.generate()}`, // strip from update
          key: brick.key,
          fields: brick.fields,
          groups: brick.groups,
          order: targetOrder,
          type: brick.type,
          position: brick.position,
        });
      })
    );
  },
  removeBrick({ index }) {
    set(
      "bricks",
      produce((draft) => {
        draft.splice(index, 1);
      })
    );
  },
  sortOrder({ from, to }) {
    set(
      "bricks",
      produce((draft) => {
        const fromBrick = draft.find((brick) => brick.id === from);
        const toBrick = draft.find((brick) => brick.id === to);

        if (!fromBrick || !toBrick) return;

        const fromOrder = fromBrick.order;
        fromBrick.order = toBrick.order;
        toBrick.order = fromOrder;
      })
    );
  },

  // --------------------------------------------
  // Fields
  findFieldIndex(params) {
    const fieldIndex = params.fields.findIndex(
      (f) => f.key === params.key && f.group_id === params.groupId
    );
    return fieldIndex;
  },
  addField(params) {
    builderStore.set(
      "bricks",
      produce((draft) => {
        const brick = draft[params.brickIndex];
        if (!brick) return;

        const newField: BrickStoreFieldT = {
          key: params.field.key,
          type: params.field.type,
          value: params.field.default,
          group_id: params.groupId,
        };

        brick.fields.push(newField);
      })
    );
  },
  updateFieldValue(params) {
    builderStore.set(
      "bricks",
      produce((draft) => {
        const brick = draft[params.brickIndex];
        if (!brick) return;

        const fieldIndex = get.findFieldIndex({
          fields: brick.fields,
          key: params.key,
          groupId: params.groupId,
        });

        if (fieldIndex !== -1) {
          brick.fields[fieldIndex].value = params.value;
        }
      })
    );
  },
  // --------------------------------------------
  // Groups
  addGroup(params) {
    builderStore.set(
      "bricks",
      produce((draft) => {
        const brick = draft[params.brickIndex];
        if (!brick) return;
        const newGroup: BrickStoreGroupT = {
          group_id: `ref-${shortUUID.generate()}`,
          repeater_key: params.repeaterKey,
          parent_group_id: params.parentGroupId,
          group_order: params.order,
        };

        params.fields.forEach((field) => {
          const newField: BrickStoreFieldT = {
            key: field.key,
            type: field.type,
            value: field.default,
            group_id: newGroup.group_id,
          };
          brick.fields.push(newField);
        });

        brick.groups.push(newGroup);
      })
    );
  },
  removeGroup(params) {
    builderStore.set(
      "bricks",
      produce((draft) => {
        const brick = draft[params.brickIndex];
        if (!brick) return;

        const removeGroupIds = [params.groupId];

        const findChildGroups = (group_id: BrickStoreGroupT["group_id"]) => {
          brick.groups.forEach((group) => {
            if (group.parent_group_id === group_id) {
              removeGroupIds.push(group.group_id);
              findChildGroups(group.group_id);
            }
          });
        };
        findChildGroups(params.groupId);

        brick.groups = brick.groups.filter(
          (group) => !removeGroupIds.includes(group.group_id)
        );
        brick.fields = brick.fields.filter((field) => {
          if (field.group_id) {
            return !removeGroupIds.includes(field.group_id);
          }
        });
      })
    );
  },
  swapGroupOrder(params) {
    builderStore.set(
      "bricks",
      produce((draft) => {
        const brick = draft[params.brickIndex];
        if (!brick) return;

        const groupIndex = brick.groups.findIndex(
          (group) => group.group_id === params.groupId
        );
        const targetGroupIndex = brick.groups.findIndex(
          (group) => group.group_id === params.targetGroupId
        );

        if (groupIndex === -1 || targetGroupIndex === -1) return;

        const groupOrder = brick.groups[groupIndex].group_order;
        brick.groups[groupIndex].group_order =
          brick.groups[targetGroupIndex].group_order;
        brick.groups[targetGroupIndex].group_order = groupOrder;
      })
    );
  },
});

const builderStore = {
  get,
  set,
};

export default builderStore;
