import { Meteor } from "meteor/meteor";

import { StaticPages } from "/lib/collections";

Meteor.publish("StaticPages", () => {
  if (this.userId === null) {
    return this.ready();
  }
  return StaticPages.find();
});

