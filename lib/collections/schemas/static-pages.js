import { SimpleSchema } from "meteor/aldeed:simple-schema";

export const StaticPages = new SimpleSchema({
  shopId: {
    type: String,
    label: "Shop Id",
    optional: false
  },
  pageTitle: {
    type: String,
    label: "Page Title",
    optional: false
  },
  content: {
    label: "Shop Address",
    type: String,
    optional: false
  },
  slug: {
    label: "slug",
    type: String,
    unique: true,
    optional: false
  },
  status: {
    label: "status",
    type: String,
    defaultValue: "draft",
    optional: false
  },
  createdby: {
    label: "Creator",
    type: String,
    optional: false
  },
  createdAt: {
    label: "Created at",
    type: Date
  },
  updatedAt: {
    label: "Updated at",
    type: Date
  }
});
