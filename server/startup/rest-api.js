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

  const failure = {
    statusCode: 404,
    status: "failure",
    message: "Error"
  };

  const forbidden = {
    statusCode: 403,
    status: "error",
    message: "You do not have permission to perform this action"
  };

  const invalid = {
    statusCode: 400,
    status: "error",
    message: "Invalid format"
  };

  const configPrivate = (collection) => {
    return {
      path: collection._name.toLowercase(),
      routeOptions: {
        authRequired: true
      },
      endpoints: {
        getAll: {
          action() {
            if (!Reaction.hasPermission("admin", this.user._id)) {
              return forbidden;
            }
            const records = collection.find().fetch();
            if (records) {
              return {
                statusCode: 200,
                status: "success",
                data: records
              };
            }
            return failure;
          }
        },
        post: {
          action() {
            try {
              collection.schema.validate(this.bodyParams);
            } catch (err) {
              return invalid;
            }
            const insertedId = collection.insert(this.bodyParams);
            if (insertedId) {
              return {
                statusCode: 201,
                status: "success",
                data: insertedId
              };
            }
            return failure;
          }
        },
        get: {
          action() {
            const record = collection.findOne({ _id: this.urlParams.id });
            if (record) {
              if (!Reaction.hasPermission("admin", this.user._id) && record.userId !== this.user._id) return forbidden;
              return {
                statusCode: 200,
                status: "success",
                data: record
              };
            }
            return failure;
          }
        },
        put: {
          action() {
            try {
              collection.schema.validate(this.bodyParams);
            } catch (err) {
              return invalid;
            }
            const record = collection.findOne({ _id: this.urlParams.id });
            if (record) {
              if (!Reaction.hasPermission("admin", this.user._id) && record.userId !== this.user._id) return forbidden;
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
            }
            return failure;
          }
        },
        patch: {
          action() {
            const record = collection.findOne({ _id: this.urlParams.id });
            if (record) {
              if (!Reaction.hasPermission("admin", this.user._id) && record.userId !== this.user._id) return forbidden;
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
            }
            return failure;
          }
        },
        delete: {
          action() {
            const record = collection.findOne({ _id: this.urlParams.id });
            if (record) {
              if (!Reaction.hasPermission("admin", this.user._id) && record.userId !== this.user._id) return forbidden;
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
            }
            return failure;
          }
        }
      }
    };
  };

  const configPublic = (collection, isShop = false) => {
    return {
      path: collection._name.toLowercase(),
      routeOptions: {
        authRequired: true
      },
      endpoints: {
        getAll: {
          authRequired: false,
          action() {
            const records = collection.find().fetch();
            if (records) {
              return {
                statusCode: 200,
                status: "success",
                data: records
              };
            }
            return failure;
          }
        },
        post: {
          action() {
            if (!isShop) {
              if (!this.bodyParams.shopId || !Reaction.hasPermission(["admin", "owner"], this.user._id, this.bodyParams.shopId)) {
                return forbidden;
              }
            }
            try {
              collection.schema.validate(this.bodyParams);
            } catch (err) {
              return invalid;
            }
            const insertedId = collection.insert(this.bodyParams);
            if (insertedId) {
              if (isShop) {
                Roles.setUserRoles(this.user._id, "owner", insertedId);
              }
              return {
                statusCode: 201,
                status: "success",
                data: insertedId
              };
            }
            return failure;
          }
        },
        get: {
          action() {
            const record = collection.findOne({ _id: this.urlParams.id });
            if (record) {
              return {
                statusCode: 200,
                status: "success",
                data: record
              };
            }
            return failure;
          }
        },
        put: {
          action() {
            const shop = this.bodyParams.shopId || this.urlParams._id;
            if (!Reaction.hasPermission(["admin", "owner"], this.user._id, shop)) return forbidden;
            try {
              collection.schema.validate(this.bodyParams);
            } catch (err) {
              return invalid;
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
            return failure;
          }
        },
        patch: {
          action() {
            const shop = this.bodyParams.shopId || this.urlParams._id;
            if (!Reaction.hasPermission(["admin", "owner"], this.user._id, shop)) return forbidden;
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
            return failure;
          }
        },
        delete: {
          action() {
            const shop = this.bodyParams.shopId || this.urlParams._id;
            if (!Reaction.hasPermission(["admin", "owner"], this.user._id, shop)) return forbidden;
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
            return failure;
          }
        }
      }
    };
  };

  RestApi.addCollection(Accounts, configPrivate(Accounts));
  RestApi.addCollection(Cart, configPrivate(Cart));
  RestApi.addCollection(Emails, configPrivate(Emails));
  RestApi.addCollection(Orders, configPrivate(Orders));
  RestApi.addCollection(Products, configPublic(Products));
  RestApi.addCollection(Shops, configPublic(Shops, true));
};
