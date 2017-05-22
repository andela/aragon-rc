import { Reaction } from "/client/api";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { StaticPages } from "/lib/collections";

import "./static-pages.html";

/**
* validate
* @param {string} field - field to be checked
* @param {string} value - string value from the field
* @return {boolean} returnVal - true/false
*/
function validate(field, value) {
  const val = String.raw`${value}`;
  let returnVal;

  function validateTitle(title) {
    if (!title || !/\w/i.test(title)) return false;
    return true;
  }

  function validateSlug(slug) {
    if (!slug || !/[a-z](\/[a-z])*/g.test(slug)) return false;
    return true;
  }

  function validateContent(content) {
    if (!content || !/\w/i.test(content)) return false;
    return true;
  }

  switch (field) {
    case "title": returnVal = validateTitle(val); break;
    case "slug": returnVal = validateSlug(val); break;
    case "content": returnVal = validateContent(val); break;
    default: null;
  }
  return returnVal;
}

/**
* reset
* @return {null} no return value
*/
function reset() {
  $("#title").val("");
  $("#slug").val("");
  CKEDITOR.instances.contentEditor.setData("<h2>Page header</h2><hr><p>Page content</p>");
}

Template.staticPageLayout.onCreated(function () {
  Meteor.subscribe("StaticPages");
  const template = Template.instance();
});

Template.staticPageLayout.onRendered(function () {
  CKEDITOR.replace("contentEditor");
});

Template.staticPageLayout.helpers({
  // create a new page
  getUrl() {
    return window.location.host;
  },

  // file stats
  fileStats() {
    const drafts = StaticPages.find({
      $and: [{
        shopId: Reaction.getShopId(),
        status: "draft"
      }]
    }).count();
    const published = StaticPages.find({
      $and: [{
        shopId: Reaction.getShopId(),
        status: "publish"
      }]
    }).count();

    return {
      drafts,
      published
    };
  },

  // fetch all pages
  getAllPages() {
    const pages = StaticPages.find({}).fetch();
    // pages.forEach(page => {
    //   Session.set(page.pageTitle, page.status);
    // });
    console.log(pages, "pages");
    return pages;
  }
});

Template.staticPageLayout.events({
  /**
  * createPage
  * creates a new page
  * @param {object} event - event object
  * @param {object} template - template object
  * @return {null} - no return value - no return value
  */
  "click [data-event-action=createPage]": function (event, template) {
    event.preventDefault();
    template.pageDetails = {};
    template.errors = {};

    const title = template.$("#title").val().trim();
    const slug = template.$("#slug").val().trim();
    const content = CKEDITOR.instances.contentEditor.getData();
    const shopId = Reaction.getShopId();
    const createdby = Meteor.userId();

    if (validate("title", title)) {
      template.pageDetails.title = title[0].toUpperCase() + title.slice(1);
    } else {
      template.errors.title = "Invalid title";
    }

    if (validate("slug", slug)) {
      template.pageDetails.slug = slug.toLowerCase();
    } else {
      template.errors.slug = "Invalid slug";
    }

    if (validate("content", content)) {
      template.pageDetails.content = content;
    } else {
      template.errors.content = "Invalid content";
    }

    if (template.$("#publish").prop("checked")) {
      template.pageDetails.status = "publish";
    } else {
      template.pageDetails.status = "draft";
    }

    if (!Object.keys(template.errors).length) {
      if (template.$("#submitBtn").text().toLowerCase() === "save") {
        // append additional details to create new page
        template.pageDetails.shopId = shopId;
        template.pageDetails.createdby = createdby;

        Meteor.call("pages/createPage", template.pageDetails, (error, page) => {
            return console.log(page, template.pageDetails);
          if (!error && page) {
            // run a page reset
            reset();
            return Alerts.toast("Page successfully created.");
          }
          return Alerts.toast("Process failed! Unable to create page.");
        });
      } else {
        // append additional details to update page
        template.pageDetails.pageId = Session.get("pageId");

        Meteor.call("pages/update", template.pageDetails, (error, page) => {
          if (!error) {
            // run a page reset
            reset();
            $(".submit-btn").html("save");
            $("h2").text("Create a new page");
            return Alerts.toast("Page successfully updated.");
          }
          return Alerts.toast("Process failed! Unable to update.");
        });
      }
    } else {
      $("#titleErr").text(template.errors.title);
      $("#slugErr").text(template.errors.slug);
      $("#contentErr").text(template.errors.content);
    }
  },

  /**
  * togglePublish
  * changes the status of a page to publish if
  * the current state is draft and vice-versa
  * @param {object} event - event object
  * @return {null} - no return value
  */
  "change [data-event-action=togglePublish]": function (event) {
    const pageId = this._id;
    const status = event.target.checked ? "publish" : "draft";

    Meteor.call("pages/togglePublish", status, pageId);
  },

  /**
  * edit
  * edits an existing page
  * @return {null} - no return value
  */
  "click [data-event-action=edit]": function () {
    const pageId = this._id;
    const currentPage = StaticPages.findOne({ _id: this._id });

    Session.set("pageId", pageId);
    if (!currentPage) return Alerts.toast("This page was not found");

    $("#title").val(currentPage.pageTitle);
    $("#slug").val(currentPage.slug);
    CKEDITOR.instances.contentEditor.setData(currentPage.content);
    $(".submit-btn").html("update");
    $("h2").text(`Edit ${currentPage.pageTitle}`);
  },

  /**
  * delete
  * deletes a single page
  * @return {null} - no return value
  */
  "click [data-event-action=delete]": function () {
    const pageId = this._id;

    Alerts.alert({
      title: "Are you sure you want to delete this page?",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes"
    }, (confirmed) => {
      if (confirmed) {
        Meteor.call("pages/delete", pageId);
      }
    });
  },

  /**
  * formReset
  * sets the form to default
  * @param {object} event - event object
  * @param {object} template - template object
  * @return {null} - no return value
  */
  "click [data-event-action=formReset]": function (event, template) {
    reset();
    $("#titleErr").text(template.errors.title);
    $("#slugErr").text(template.errors.slug);
    $("#contentErr").text(template.errors.content);
  }
});

Template.pageRow.helpers({
  inputSliderChecked(status) {
    if (status === "publish") {
      return "checked";
    }
  }
});