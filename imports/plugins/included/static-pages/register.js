import { Reaction } from "/server/api";


Reaction.registerPackage({
  label: "Static Pages",
  name: "Static Pages",
  icon: "fa fa-copy",
  autoEnable: true,
  settings: {
    name: "Static Pages"
  },
  registry: [{
    route: "/dashboard/static-pages",
    provides: "dashboard",
    workflow: "corePagesWorkFlow",
    name: "Static Pages",
    label: "Static Pages",
    description: "Create and Manage Static Pages",
    icon: "fa fa-copy",
    priority: 1,
    container: "core",
    template: "staticPageLayout"
  }],
  layout: [{
    layout: "coreLayout",
    workflow: "corePagesWorkFlow",
    theme: "default",
    enabled: true,
    structure: {
      template: "staticPageLayout",
      layoutHeader: "layoutHeader",
      layoutFooter: "layoutFooter",
      notFound: "notFound",
      dashboardHeader: "dashboardHeader",
      dashboardControls: "dashboardControls",
      adminControlsFooter: "adminControlsFooter"
    }
  }]
});
