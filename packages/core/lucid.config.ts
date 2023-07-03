import z from "zod";
import { ConfigT } from "./src/db/models/Config";
import BrickBuilder from "@lucid/brick-builder";
import CollectionBuilder from "@lucid/collection-builder";

// ------------------------------------
// Define Bricks
const bannerBrick = new BrickBuilder("banner")
  .addTab({
    key: "content_tab",
  })
  .addText({
    key: "title",
    description: "The title of the banner",
    default: "Banner Title",
    placeholder: "Enter a title",
    validation: {
      required: true,
      zod: z.string().min(3).max(100),
    },
  })
  .addLink({
    key: "link",
  })
  .addPageLink({
    key: "page_link",
  })
  .addColour({
    key: "colour",
  })
  .addDateTime({
    key: "date",
  })
  .addWysiwyg({
    key: "intro",
  })
  .addRepeater({
    key: "social_links",
    validation: {
      max: 5,
    },
  })
  .addText({
    key: "social_title",
  })
  .addText({
    key: "social_url",
  })
  .endRepeater()
  .addTab({
    key: "config_tab",
  })
  .addCheckbox({
    key: "fullwidth",
    description: "Make the banner fullwidth",
    default: true,
  });

const introBrick = new BrickBuilder("intro")
  .addTab({
    key: "content_tab",
  })
  .addText({
    key: "title",
  })
  .addWysiwyg({
    key: "intro",
  });

const defaultMetaBrick = new BrickBuilder("default_meta")
  .addText({
    key: "meta_title",
    title: "Meta Title",
  })
  .addText({
    key: "meta_description",
    title: "Meta Description",
  });

// ------------------------------------
// Define Collections
const pageCollection = new CollectionBuilder("page", {
  config: {
    type: "pages",
    title: "Pages",
    singular: "Page",
    description: "Pages are used to create static content on your website.",
    bricks: [
      {
        key: "banner",
        type: "builder",
      },
      {
        key: "intro",
        type: "builder",
      },
      {
        key: "default_meta",
        type: "fixed",
        position: "bottom",
      },
    ],
  },
});

const settingsCollection = new CollectionBuilder("settings", {
  config: {
    type: "singlepage",
    title: "Settings",
    singular: "Setting",
    description: "Settings are used to configure your website.",
    bricks: [
      {
        key: "default_meta",
        type: "fixed",
        position: "standard",
      },
    ],
  },
});

const config: ConfigT = {
  databaseUrl: process.env.LUCID_database_url as string,
  port: 8393,
  origin: "*",
  mode: "development",
  secretKey: process.env.LUCID_SECRET_KEY as string,
  environments: [
    {
      title: "Site Production",
      key: "site_prod",
    },
    {
      title: "Site Staging",
      key: "site_stage",
    },
  ],
  email: {
    from: {
      name: "Lucid CMS",
      email: "hello@lucidcms.com",
    },
    smtp: {
      host: "127.0.0.1",
      port: 6969,
      secure: false,
      user: process.env.LUCID_SMPT_USER as string,
      pass: process.env.LUCID_SMPT_PASS as string,
    },
  },
  media: {
    storageLimit: 5368709120,
    maxFileSize: 20777216,
    store: {
      service: "cloudflare",
      cloudflareAccountId: process.env.LUCID_CLOUDFLARE_ACCOUNT_ID as string,
      region: process.env.LUCID_S3_REGION as string,
      bucket: process.env.LUCID_S3_BUCKET as string,
      accessKeyId: process.env.LUCID_S3_ACCESS_KEY as string,
      secretAccessKey: process.env.LUCID_S3_SECRET_KEY as string,
    },
  },
  collections: [pageCollection, settingsCollection],
  bricks: [bannerBrick, introBrick, defaultMetaBrick],
};

export default config;
