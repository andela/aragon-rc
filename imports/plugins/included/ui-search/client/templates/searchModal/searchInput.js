import { Template } from "meteor/templating";
import { ProductSearch } from "/lib/collections";

Template.searchInput.helpers({
  settings: function () {
    return {
      position: "bottom",
      limit: 8,
      rules: [
        {
          token: "",
          collection: ProductSearch,
          field: "title",
          options: "i",
          matchAll: false,
          template: Template.resultPill,
          noMatchTemplate: Template.noResult
        }
      ]
    };
  }
});
