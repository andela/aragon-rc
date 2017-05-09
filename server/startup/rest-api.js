import { Accounts, Cart, Emails, Orders, Products, Shops } from "/lib/collections";

export default () => {
  const RestApi = new Restivus({
    useDefaultAuth: true,
    prettyJson: true,
    defaultHeaders: {
      "Content-Type": "application/json"
    }
  });

  const configRoutes = (collection, isPrivate) => {
    const roleRequired = ["admin", "owner"];
    let getAllRoleRequired;
    let getRoleRequired;
    if (isPrivate) {
      getAllRoleRequired = "admin";
      getRoleRequired = roleRequired;
    }
    return {
      endpoints: {
        getAll: {
          roleRequired: getAllRoleRequired,
          action() {
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
          roleRequired: getRoleRequired,
          action() {
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
          roleRequired,
          action() {
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
          roleRequired,
          action() {
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
          roleRequired,
          action() {
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
