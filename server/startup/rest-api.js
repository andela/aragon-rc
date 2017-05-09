import { Accounts, Cart, Emails, Orders, Products, Shops } from "/lib/collections";
import { Reaction } from "/server/api";

export default () => {
  const RestApi = new Restivus({
    useDefaultAuth: true,
    prettyJson: true,
    defaultHeaders: {
      "Content-Type": "application/json"
    }
  });

  const configRoutes = (collection, isPrivate) => {
    const requiredRoles = ["admin", "owner"];
    return {
      endpoints: {
        getAll: {
          authRequired: isPrivate,
          action() {
            if (isPrivate) {
              if (!Reaction.hasPermission("admin", this.user._id)) {
                return {
                  statusCode: 403,
                  status: "error",
                  message: "You do not have permission to perform this action"
                };
              }
            }
            const records = collection.find().fetch();
            if (records) {
              return {
                statusCode: 200,
                status: "success",
                data: records
              };
            }
            return {
              statusCode: 404,
              status: "failure",
              message: "Error"
            };
          }
        },
        post: {
          authRequired: true,
          action() {
            try {
              collection.schema.validate(this.bodyParams);
            } catch (err) {
              return {
                statusCode: 400,
                status: "error",
                message: "Invalid format"
              };
            }
            const isInserted = collection.insert(this.bodyParams);
            if (isInserted) {
              return {
                statusCode: 201,
                status: "success",
                data: isInserted
              };
            }
            return {
              statusCode: 404,
              status: "failure",
              message: "Error"
            };
          }
        },
        get: {
          authRequired: isPrivate,
          action() {
            if (isPrivate) {
              if (!Reaction.hasPermission(requiredRoles, this.user._id)) {
                return {
                  statusCode: 403,
                  status: "error",
                  message: "You do not have permission to perform this action"
                };
              }
            }
            const record = collection.findOne({ _id: this.urlParams.id });
            if (record) {
              return {
                statusCode: 200,
                status: "success",
                data: record
              };
            }
            return {
              statusCode: 404,
              status: "failure",
              message: "Error"
            };
          }
        },
        put: {
          authRequired: true,
          action() {
            if (!Reaction.hasPermission(requiredRoles, this.user._id)) {
              return {
                statusCode: 403,
                status: "error",
                message: "You do not have permission to perform this action"
              };
            }
            try {
              collection.schema.validate(this.bodyParams);
            } catch (err) {
              return {
                statusCode: 400,
                status: "error",
                message: "Invalid format"
              };
            }
            const isUpdated = collection.update(this.urlParams.id, this.bodyParams);
            if (isUpdated) {
              return {
                statusCode: 201,
                status: "success",
                data: {
                  message: "Resource modified"
                }
              };
            }
            return {
              statusCode: 404,
              status: "failure",
              message: "Error"
            };
          }
        },
        patch: {
          authRequired: true,
          action() {
            if (!Reaction.hasPermission(requiredRoles, this.user._id)) {
              return {
                statusCode: 403,
                status: "error",
                message: "You do not have permission to perform this action"
              };
            }
            const isUpdated = collection.update(this.urlParams.id, {
              $set: this.bodyParams
            });
            if (isUpdated) {
              return {
                statusCode: 201,
                status: "success",
                data: {
                  message: "Resource patched"
                }
              };
            }
            return {
              statusCode: 404,
              status: "failure",
              message: "Error"
            };
          }
        },
        delete: {
          authRequired: true,
          action() {
            if (!Reaction.hasPermission(requiredRoles, this.user._id)) {
              return {
                statusCode: 403,
                status: "error",
                message: "You do not have permission to perform this action"
              };
            }
            const isDeleted = collection.remove(this.urlParams.id);
            if (isDeleted) {
              return {
                statusCode: 200,
                status: "success",
                data: {
                  message: "Resource deleted"
                }
              };
            }
            return {
              statusCode: 404,
              status: "failure",
              message: "Error"
            };
          }
        }
      }
    };
  };

  RestApi.addCollection(Accounts, configRoutes(Accounts, true));
  RestApi.addCollection(Cart, configRoutes(Cart, true));
  RestApi.addCollection(Emails, configRoutes(Emails, true));
  RestApi.addCollection(Orders, configRoutes(Orders, true));
  RestApi.addCollection(Products, configRoutes(Products, false));
  RestApi.addCollection(Shops, configRoutes(Shops, false));
};
