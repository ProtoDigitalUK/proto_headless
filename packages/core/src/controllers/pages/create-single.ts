import z from "zod";
// Services
import buildResponse from "@services/controllers/build-response";
// Models
import Page from "@db/models/Page";

// --------------------------------------------------
// Schema
const body = z.object({
  title: z.string().min(2),
  slug: z.string().min(2).toLowerCase(),
  collection_key: z.string(),
  homepage: z.boolean().optional(),
  excerpt: z.string().optional(),
  published: z.boolean().optional(),
  parent_id: z.number().optional(),
  category_ids: z.array(z.number()).optional(),
});
const query = z.object({});
const params = z.object({});

// --------------------------------------------------
// Controller
const createSingle: Controller<
  typeof params,
  typeof body,
  typeof query
> = async (req, res, next) => {
  try {
    const page = await Page.create(
      {
        title: req.body.title,
        slug: req.body.slug,
        collection_key: req.body.collection_key,
        homepage: req.body.homepage,
        excerpt: req.body.excerpt,
        published: req.body.published,
        parent_id: req.body.parent_id,
        category_ids: req.body.category_ids,
      },
      req
    );

    res.status(200).json(
      buildResponse(req, {
        data: page,
      })
    );
  } catch (error) {
    next(error as Error);
  }
};

// --------------------------------------------------
// Export
export default {
  schema: {
    body,
    query,
    params,
  },
  controller: createSingle,
};
