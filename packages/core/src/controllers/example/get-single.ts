import z from "zod";
// Data
import sampleData from "@data/sample.json";

// --------------------------------------------------
// Schema
const body = z.object({});
const query = z.object({
  include: z.string().optional(),
  exclude: z.string().optional(),
  filter: z
    .object({
      id: z.string().optional(),
      active: z.enum(["1", "-1"]).optional(),
    })
    .optional(),
  sort: z.string().optional(),
});
const params = z.object({
  id: z.string(),
});

// --------------------------------------------------
// Controller
const getSingle: Controller<typeof params, typeof body, typeof query> = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;
    const data = sampleData.find((item) => item.id.toString() === id);

    res.status(200).json({
      data: data,
      query: req.query,
    });
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
  controller: getSingle,
};
