import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Reaction } from "/server/api";

import { StaticPages } from "/lib/collections";
import * as Schemas from "/lib/collections/schemas";

/**
* Static Pages Methods
*/
Meteor.methods({
/**
 * pages/createPage
 * @param {Object} pageDetails - page details
 * @return {Object} page - new page object
 */
  "pages/createPage": function (pageDetails) {
    if (!Object.keys(pageDetails).length) return Meteor.Error("error", "Cannot create empty page");
    check(pageDetails, Object);
    check(pageDetails.shopId, String);
    check(pageDetails.title, String);
    check(pageDetails.content, String);
    check(pageDetails.slug, String);
    check(pageDetails.status, String);
    check(pageDetails.createdby, String);

    if (!Reaction.hasAdminAccess()) {
      throw new Meteor.Error(403, "Access denied");
    }

    this.unblock();

    const page = {
      shopId: pageDetails.shopId,
      pageTitle: pageDetails.title,
      content: pageDetails.content,
      slug: pageDetails.slug,
      status: pageDetails.status,
      createdby: pageDetails.createdby,
      createdAt: new Date,
      updatedAt: new Date
    };

    if (StaticPages.find({ slug: page.slug }).count()) {
      return false;
    }
    // return console.log(page);

    check(page, Schemas.StaticPages);
    StaticPages.insert(page);
  },

  /**
 * pages/togglePublish
  * @param {String} status - page status
  * @param {String} pageId - page id
  * @return {Null} no return value
  */
  "pages/togglePublish": function (status, pageId) {
    check(status, String);
    check(pageId, String);

    this.unblock();

    return StaticPages.update(
      { _id: pageId },
      { $set: {
        status: status
      }
      }
    );
  },

  /**
 * pages/update
  * @param {Object} pageDetails - fields to be updated
  * @return {Object} updatedPage
  */
  "pages/update": function (pageDetails) {
    check(pageDetails, Object);
    check(pageDetails.title, String);
    check(pageDetails.content, String);
    check(pageDetails.slug, String);
    check(pageDetails.status, String);
    check(pageDetails.pageId, String);

    this.unblock();

    return StaticPages.update(
      { _id: pageDetails.pageId },
      { $set: {
        pageTitle: pageDetails.title,
        slug: pageDetails.slug,
        content: pageDetails.content,
        status: pageDetails.status,
        updatedAt: new Date
      }
      }
    );
  },

  /**
  * pages/delete
  * @param {String} pageId - page id
  * @return {Null} - no return value
  */
  "pages/delete": function (pageId) {
    check(pageId, String);

    this.unblock();

    return StaticPages.remove({ _id: pageId });
  }
});
