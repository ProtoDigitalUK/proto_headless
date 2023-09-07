import z from "zod";
import sanitizeHtml from "sanitize-html";
// Types
import {
  BrickConfigOptionsT,
  CustomField,
  FieldTypes,
  TabConfig,
  TextConfig,
  RepeaterConfig,
  WysiwygConfig,
  MediaConfig,
  NumberConfig,
  CheckboxConfig,
  SelectConfig,
  CustomFieldConfig,
  TextareaConfig,
  JSONConfig,
  ColourConfig,
  DateTimeConfig,
  PageLinkConfig,
  LinkConfig,
  ValidationResponse,
  FieldConfigs,
  ValidationProps,
  MediaReferenceData,
  LinkReferenceData,
} from "./types.js";

// ------------------------------------
// Schema
const baseCustomFieldSchema = z.object({
  type: z.string(),
  key: z.string(),
  title: z.string(),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  // boolean or string
  default: z.union([z.boolean(), z.string()]).optional(),
  options: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
      })
    )
    .optional(),
  validation: z
    .object({
      zod: z.any().optional(),
      required: z.boolean().optional(),
      extensions: z.array(z.string()).optional(),
      width: z
        .object({
          min: z.number().optional(),
          max: z.number().optional(),
        })
        .optional(),
      height: z
        .object({
          min: z.number().optional(),
          max: z.number().optional(),
        })
        .optional(),
    })
    .optional(),
});
export type Fields = z.infer<typeof baseCustomFieldSchema> & {
  fields?: Fields[];
};
const customFieldSchemaObject: z.ZodType<Fields> = baseCustomFieldSchema.extend(
  {
    fields: z.lazy(() => customFieldSchemaObject.array().optional()),
  }
);

// ------------------------------------
// Validation
class ValidationError extends Error {
  constructor(public message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

// ------------------------------------
// BrickBuilder
export default class BrickBuilder {
  key: string;
  title: string;
  fields: Map<string, CustomField> = new Map();
  repeaterStack: string[] = [];
  maxRepeaterDepth: number = 5;
  config: BrickConfigOptionsT = {};
  constructor(key: string, config?: BrickConfigOptionsT) {
    this.key = key;
    this.title = this.#keyToTitle(key);
    this.config = config || {};
  }
  // ------------------------------------
  public addFields(BrickBuilder: BrickBuilder) {
    const fields = BrickBuilder.fields;
    fields.forEach((field) => {
      this.#checkKeyDuplication(field.key);
      this.fields.set(field.key, field);
    });
    return this;
  }
  public endRepeater() {
    // pop the last added repeater from the stack
    const key = this.repeaterStack.pop();

    if (!key) {
      throw new Error("No open repeater to end.");
    }

    const fields = Array.from(this.fields.values());
    let selectedRepeaterIndex = 0;
    let repeaterKey = "";

    // find the selected repeater
    for (let i = 0; i < fields.length; i++) {
      if (fields[i].type === "repeater" && fields[i].key === key) {
        selectedRepeaterIndex = i;
        repeaterKey = fields[i].key;
        break;
      }
    }

    if (!repeaterKey) {
      throw new Error(`Repeater with key "${key}" does not exist.`);
    }

    const fieldsAfterSelectedRepeater = fields.slice(selectedRepeaterIndex + 1);
    const repeater = this.fields.get(repeaterKey);
    if (repeater) {
      // filter out tab fields
      repeater.fields = fieldsAfterSelectedRepeater.filter(
        (field) => field.type !== "tab"
      );
      fieldsAfterSelectedRepeater.map((field) => {
        this.fields.delete(field.key);
      });
    }

    return this;
  }
  // ------------------------------------
  // Custom Fields
  public addTab(config: TabConfig) {
    this.#checkKeyDuplication(config.key);
    this.#addToFields("tab", config);
    return this;
  }
  public addText = (config: TextConfig) => {
    this.#checkKeyDuplication(config.key);
    this.#addToFields("text", config);
    return this;
  };
  public addWysiwyg(config: WysiwygConfig) {
    this.#checkKeyDuplication(config.key);
    this.#addToFields("wysiwyg", config);
    return this;
  }
  public addMedia(config: MediaConfig) {
    this.#checkKeyDuplication(config.key);
    this.#addToFields("media", config);
    return this;
  }
  public addRepeater(config: RepeaterConfig) {
    this.#checkKeyDuplication(config.key);
    // check the current depth of nested repeaters
    if (this.repeaterStack.length >= this.maxRepeaterDepth) {
      throw new Error(
        `Maximum repeater depth of ${this.maxRepeaterDepth} exceeded.`
      );
    }
    this.#addToFields("repeater", config);
    // whenever a new repeater is added, push it to the repeater stack
    this.repeaterStack.push(config.key);
    return this;
  }
  public addNumber(config: NumberConfig) {
    this.#checkKeyDuplication(config.key);
    this.#addToFields("number", config);
    return this;
  }
  public addCheckbox(config: CheckboxConfig) {
    this.#checkKeyDuplication(config.key);
    this.#addToFields("checkbox", config);
    return this;
  }
  public addSelect(config: SelectConfig) {
    this.#checkKeyDuplication(config.key);
    this.#addToFields("select", config);
    return this;
  }
  public addTextarea(config: TextareaConfig) {
    this.#checkKeyDuplication(config.key);
    this.#addToFields("textarea", config);
    return this;
  }
  public addJSON(config: JSONConfig) {
    this.#checkKeyDuplication(config.key);
    this.#addToFields("json", config);
    return this;
  }
  public addColour(config: ColourConfig) {
    this.#checkKeyDuplication(config.key);
    this.#addToFields("colour", config);
    return this;
  }
  public addDateTime(config: DateTimeConfig) {
    this.#checkKeyDuplication(config.key);
    this.#addToFields("datetime", config);
    return this;
  }
  public addPageLink(config: PageLinkConfig) {
    this.#checkKeyDuplication(config.key);
    this.#addToFields("pagelink", config);
    return this;
  }
  public addLink(config: LinkConfig) {
    this.#checkKeyDuplication(config.key);
    this.#addToFields("link", config);
    return this;
  }
  // ------------------------------------
  // Getters
  get fieldTree() {
    // everything between two tabs should get removed and added to the tab fields array
    const fields = Array.from(this.fields.values());

    let result: Array<CustomField> = [];
    let currentTab: CustomField | null = null;

    fields.forEach((item) => {
      if (item.type === "tab") {
        if (currentTab) {
          result.push(currentTab);
        }
        currentTab = { ...item, fields: [] };
      } else if (currentTab) {
        if (!currentTab.fields) currentTab.fields = [];
        currentTab.fields.push(item);
      } else {
        result.push(item);
      }
    });

    if (currentTab) {
      result.push(currentTab);
    }

    return result;
  }
  get basicFieldTree() {
    const fieldArray = Array.from(this.fields.values());
    // return fields minus tab
    fieldArray.forEach((field) => {
      if (field.type === "tab") {
        fieldArray.splice(fieldArray.indexOf(field), 1);
      }
    });
    return fieldArray;
  }
  get flatFields() {
    const fields: CustomField[] = [];

    const fieldArray = Array.from(this.fields.values());
    const getFields = (field: CustomField) => {
      fields.push(field);
      if (field.type === "repeater") {
        field.fields?.forEach((item) => {
          getFields(item);
        });
      }
    };

    fieldArray.forEach((field) => {
      getFields(field);
    });

    return fields;
  }
  // ------------------------------------
  // Field Type Validation
  private fieldTypeToDataType: Record<string, "string" | "number" | "boolean"> =
    {
      text: "string",
      textarea: "string",
      colour: "string",
      datetime: "string",
      link: "string",
      wysiwyg: "string",
      select: "string",
      number: "number",
      pagelink: "number",
      checkbox: "boolean",
    };
  fieldValidation({
    type,
    key,
    value,
    referenceData,
    flatFieldConfig,
  }: ValidationProps): ValidationResponse {
    try {
      // Check if field exists in config
      const field = flatFieldConfig.find((item) => item.key === key);
      if (!field) {
        throw new ValidationError(`Field with key "${key}" does not exist.`);
      }

      // Check if field type matches
      if (field.type !== type) {
        throw new ValidationError(`Field with key "${key}" is not a ${type}.`);
      }

      // Check if field is required
      if (field.validation?.required) {
        if (value === undefined || value === null || value === "") {
          throw new ValidationError(`Please enter a value.`);
        }
      }

      // run zod validation
      if (field.validation?.zod && field.type !== "wysiwyg") {
        this.#validateZodSchema(field.validation.zod, value);
      }

      // Use the map to do the data type validation
      const dataType = this.fieldTypeToDataType[field.type];
      if (dataType) {
        if (typeof value !== dataType) {
          throw new ValidationError(`The field value must be a ${dataType}.`);
        }
      }

      // Field specific validation
      switch (field.type) {
        case "select": {
          this.#validateSelectType(field, value);
          break;
        }
        case "wysiwyg": {
          this.#validateWysiwygType(field, value);
          break;
        }
        case "media": {
          this.#validateMediaType(field, referenceData as MediaReferenceData);
          break;
        }
        case "datetime": {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            throw new ValidationError("Please ensure the date is valid.");
          }
          break;
        }
        case "link": {
          this.#validateLinkTarget(referenceData as LinkReferenceData);
          break;
        }
        case "pagelink": {
          if (!referenceData) {
            throw new ValidationError(
              "We couldn't find the page you selected."
            );
          }
          this.#validateLinkTarget(referenceData as LinkReferenceData);
          break;
        }
      }
    } catch (error) {
      // Catch validation errors and return them
      if (error instanceof ValidationError) {
        return {
          valid: false,
          message: error.message,
        };
      }
      throw error;
    }

    return {
      valid: true,
    };
  }
  // ------------------------------------
  #validateSelectType(field: CustomField, value: string) {
    // Check if value is in the options
    if (field.options) {
      const optionValues = field.options.map((option) => option.value);
      if (!optionValues.includes(value)) {
        throw new ValidationError("Please ensure the value is a valid option.");
      }
    }
  }
  #validateWysiwygType(field: CustomField, value: string) {
    const sanitizedValue = sanitizeHtml(value, {
      allowedTags: [],
      allowedAttributes: {},
    });

    // run zod validation
    if (field.validation?.zod) {
      this.#validateZodSchema(field.validation.zod, sanitizedValue);
    }
  }
  #validateMediaType(field: CustomField, referenceData: MediaReferenceData) {
    if (referenceData === undefined) {
      throw new ValidationError("We couldn't find the media you selected.");
    }

    // Check if value is in the options
    if (field.validation?.extensions && field.validation.extensions.length) {
      const extension = referenceData.extension;
      if (!field.validation.extensions.includes(extension)) {
        throw new ValidationError(
          `Media must be one of the following extensions: ${field.validation.extensions.join(
            ", "
          )}`
        );
      }
    }

    // Check width
    if (field.validation?.width) {
      const width = referenceData.width;
      if (!width) {
        throw new ValidationError("This media does not have a width.");
      }

      if (field.validation.width.min && width < field.validation.width.min) {
        throw new ValidationError(
          `Media width must be greater than ${field.validation.width.min}px.`
        );
      }
      if (field.validation.width.max && width > field.validation.width.max) {
        throw new ValidationError(
          `Media width must be less than ${field.validation.width.max}px.`
        );
      }
    }

    // Check height
    if (field.validation?.height) {
      const height = referenceData.height;
      if (!height) {
        throw new ValidationError("This media does not have a height.");
      }

      if (field.validation.height.min && height < field.validation.height.min) {
        throw new ValidationError(
          `Media height must be greater than ${field.validation.height.min}px.`
        );
      }
      if (field.validation.height.max && height > field.validation.height.max) {
        throw new ValidationError(
          `Media height must be less than ${field.validation.height.max}px.`
        );
      }
    }
  }
  #validateLinkTarget(referenceData: LinkReferenceData) {
    const allowedValues = ["_self", "_blank"];
    if (!allowedValues.includes(referenceData.target)) {
      throw new ValidationError(
        `Please set the target to one of the following: ${allowedValues.join(
          ", "
        )}.`
      );
    }
  }
  // ------------------------------------
  // Validation Util
  #validateZodSchema(schema: z.ZodSchema<any>, value: any) {
    try {
      schema.parse(value);
    } catch (error) {
      const err = error as z.ZodError;
      throw new ValidationError(err.issues[0].message);
    }
  }
  // ------------------------------------
  // Private Methods
  #keyToTitle(key: string) {
    if (typeof key !== "string") return key;

    const title = key
      .split(/[-_]/g) // split on hyphen or underscore
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // capitalize each word
      .join(" "); // rejoin words with space

    return title;
  }
  #addToFields(type: FieldTypes, config: FieldConfigs) {
    const noUndefinedConfig = Object.keys(config).reduce((acc, key) => {
      // @ts-ignore
      if (config[key] !== undefined) {
        // @ts-ignore
        acc[key] = config[key];
      }
      return acc;
    }, {});

    const data = {
      type: type,
      title: config.title || this.#keyToTitle(config.key),
      ...(noUndefinedConfig as CustomFieldConfig),
    };

    const validation = baseCustomFieldSchema.safeParse(data);
    if (!validation.success) {
      throw new Error(validation.error.message);
    }

    this.fields.set(config.key, data);
  }
  #checkKeyDuplication(key: string) {
    if (this.fields.has(key)) {
      throw new Error(`Field with key "${key}" already exists.`);
    }
  }
}

export type BrickBuilderT = InstanceType<typeof BrickBuilder>;
export * from "./types.js";