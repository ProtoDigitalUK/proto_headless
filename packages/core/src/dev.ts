import express from "express";
import z from "zod";
import { log } from "console-log-colors";
import lucid, { FormBuilder, submitForm } from "./index";

const app = express();

lucid.init(app);

// ------------------------------------
// Form builder use example
export const ContactForm = new FormBuilder("contact-form", {
  title: "Contact Form",
  fields: [
    {
      name: "name",
      label: "Name",
      type: "text",
      zod: z.string().min(3),
      show_in_table: true,
    },
    {
      name: "email",
      label: "Email",
      type: "text",
      zod: z.string().email(),
      show_in_table: true,
    },
    {
      name: "message",
      label: "Message",
      type: "textarea",
    },
  ],
});

app.get("/test", async (req, res, next) => {
  try {
    const data = {
      name: "John Doe",
      email: "wyallop14@gmail.com",
      message: "Hello world!",
    };

    // validate data with form builder
    const { valid, errors } = await ContactForm.validate(data);

    if (!valid) {
      return res.json({ errors });
    }

    // save form data & send email
    const submission = await submitForm({
      environment_key: "site_prod",
      form: ContactForm,
      data,
    });
    // sendEmail("contact-form", {
    //   data: data,
    //   options: {
    //     to: "",
    //     subject: "New contact form submission",
    //   },
    // });

    res.json({ submission });
  } catch (error) {
    next(error as Error);
  }
});

app.listen(8393, () => {
  log.white("----------------------------------------------------");
  log.yellow(`CMS started at: http://localhost:8393`);
  log.yellow(`API started at: http://localhost:8393/api`);
  log.white("----------------------------------------------------");
});
