import { PoolClient } from "pg";
import z from "zod";
// Schema
import languagesSchema from "@schemas/languages.js";
// Utils
import {
  queryDataFormat,
  SelectQueryBuilder,
} from "@utils/app/query-helpers.js";

// -------------------------------------------
// Role
export type LanguageT = {
  id: number;
  code: string;
  is_default: boolean;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export default class Language {
  static createSingle: LanguageCreateSingle = async (client, data) => {
    const { columns, aliases, values } = queryDataFormat({
      columns: ["code", "is_default", "is_enabled"],
      values: [data.code, data.is_default, data.is_enabled],
    });

    const roleRes = await client.query<{
      id: LanguageT["id"];
    }>({
      text: `INSERT INTO lucid_languages (${columns.formatted.insert}) VALUES (${aliases.formatted.insert}) RETURNING id`,
      values: values.value,
    });

    return roleRes.rows[0];
  };
  static getMultiple: LanguageGetMultiple = async (client, query_instance) => {
    const languages = client.query<LanguageT>({
      text: `SELECT ${query_instance.query.select} FROM lucid_languages ${query_instance.query.where} ${query_instance.query.order} ${query_instance.query.pagination}`,
      values: query_instance.values,
    });

    const count = client.query<{ count: string }>({
      text: `SELECT COUNT(DISTINCT lucid_languages.id) FROM lucid_languages ${query_instance.query.where}`,
      values: query_instance.countValues,
    });

    const data = await Promise.all([languages, count]);

    return {
      data: data[0].rows,
      count: Number(data[1].rows[0].count),
    };
  };
  static getSingleByCode: LanguageGetSingleByCode = async (client, data) => {
    const roleRes = await client.query<LanguageT>({
      text: `SELECT * FROM lucid_languages WHERE code = $1`,
      values: [data.code],
    });

    return roleRes.rows[0];
  };
}

// -------------------------------------------
// Types
type LanguageCreateSingle = (
  client: PoolClient,
  data: z.infer<typeof languagesSchema.createSingle.body>
) => Promise<{
  id: LanguageT["id"];
}>;

type LanguageGetMultiple = (
  client: PoolClient,
  query_instance: SelectQueryBuilder
) => Promise<{
  data: LanguageT[];
  count: number;
}>;

type LanguageGetSingleByCode = (
  client: PoolClient,
  data: {
    code: LanguageT["code"];
  }
) => Promise<LanguageT>;
