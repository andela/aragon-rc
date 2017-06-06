/* eslint-disable no-undef */

 import { Meteor } from "meteor/meteor";
 import { Template } from "meteor/templating";
 import { Reaction } from "/client/api";

 const validateComment = (comment) => {
   check(comment, Match.OptionalOrNull(String));

   // Valid
   if (comment !== "Select One") {
     return true;
   }

   // Invalid
   return {
     error: "INVALID_COMMENT",
     reason: "Select a reason for cancelling order"
   };
 };

 Template.coreOrderCancelOrder.onCreated(function () {
   const template = Template.instance();

   template.showCancelOrderForm = ReactiveVar(true);
   this.state = new ReactiveDict();
   template.formMessages = new ReactiveVar({});

   this.autorun(() => {
     const currentData = Template.currentData();
     const order = currentData.order;

     if (order.workflow.status === "canceled") {
       template.showCancelOrderForm = ReactiveVar(false);
     }

     this.state.set("order", order);
   });
 });

 Template.coreOrderCancelOrder.events({
   "submit form[name=cancelOrderForm]": (event, template) => {
     event.preventDefault();

     const commentInput = template.$(".input-comment option:selected");

     const comment = commentInput.text();
     const validatedComment = validateComment(comment);

     const templateInstance = Template.instance();
     const errors = {};

     templateInstance.formMessages.set({});

     if (validatedComment !== true) {
       errors.comment = validatedComment;
     }

     if ($.isEmptyObject(errors) === false) {
       templateInstance.formMessages.set({
         errors
       });
       // prevent order cancel
       return;
     }

     const newComment = {
       body: comment,
       userId: Meteor.userId(),
       updatedAt: new Date()
     };

     const state = template.state;
     const order = state.get("order");

     Alerts.alert({
       title: "Are you sure you want to cancel this order?",
       showCancelButton: true,
       cancelButtonText: "No",
       confirmButtonText: "Yes"
     }, (confirmed) => {
       if (confirmed) {
         Meteor.call("orders/adminCancelOrder", order, newComment, (error) => {
           Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "canceled", order);

           // send notification to order owner
           const userId = order.userId;
           const type = "orderCanceled";
           const prefix = Reaction.getShopPrefix();
           const url = `${prefix}/notifications`;
           const sms = true;
           Meteor.call("notification/send", userId, type, url, sms, order);
           if (!error) {
             template.showCancelOrderForm.set(false);
           }
         });
       }
     });
   }
 });

 Template.coreOrderCancelOrder.helpers({
   showCancelOrderForm() {
     const template = Template.instance();
     return template.showCancelOrderForm.get();
   },

   messages() {
     return Template.instance().formMessages.get();
   },

   hasError(error) {
     if (error !== true && typeof error !== "undefined") {
       return "has-error has-feedback";
     }

     return false;
   }
 });
