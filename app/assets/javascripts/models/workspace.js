chorus.models.Workspace = chorus.models.Base.extend({
    constructorName: "Workspace",

    urlTemplate:"workspaces/{{id}}",
    showUrlTemplate:"workspaces/{{id}}",
    nameAttribute: 'name',
    entityType: "workspace",

    customIconUrl:function (options) {
        options = (options || {});
        return this.get("image")[(options.size ||"original")];
    },

    defaultIconUrl:function (size) {
        var iconSize = size || "large";
        var activeIcon = this.isActive() ? "" : "_archived";
        var publicIcon = this.isPublic() ? "" : "private_";

        return "/images/workspaces/" + publicIcon + "workspace" + activeIcon + "_"+ iconSize +".png";
    },

    initialize: function() {
        this.bind("change:owner", function() { delete this._owner; }, this);
    },

    isActive: function() {
        return this.get("archivedAt") === null;
    },

    isPublic: function() {
        return this.get("public");
    },

    owner: function() {
        var ownerAttrs;
        if (_.isObject(this.get("owner"))) {
            ownerAttrs = this.get("owner");
        } else {
            ownerAttrs = {
                id: this.get("ownerId"),
                username: this.get("owner"),
                firstName: this.get("ownerFirstName"),
                lastName: this.get("ownerLastName")
            };
        }
        this._owner = new chorus.models.User(ownerAttrs);
        return this._owner;
    },

    sandbox: function() {
        if (this._sandbox) return this._sandbox;
        var sandboxInfo = this.get("sandboxInfo");
        if (sandboxInfo && sandboxInfo.id) {
            var attrs = _.extend(
                {},
                sandboxInfo,
                { id: sandboxInfo.id, workspaceId: this.get('id') }
            );
            this._sandbox = new chorus.models.Sandbox(attrs);
            return this._sandbox;
        }
    },

    datasetsInDatabase: function(database) {
        return new chorus.collections.WorkspaceDatasetSet([], {
            workspaceId: this.id,
            database: database
        });
    },

    sandboxTables: function(options) {
        this._sandboxTables = this._sandboxTables || new chorus.collections.WorkspaceDatasetSet([], _.extend({
            workspaceId: this.id,
            type: "SANDBOX_TABLE",
            objectType: "TABLE"
        }, options));

        return this._sandboxTables;
    },

    datasets: function() {
        this._datasets = this._datasets || new chorus.collections.WorkspaceDatasetSet([], { workspaceId: this.id });
        return this._datasets;
    },

    comments:function () {
        this._comments = this._comments || new chorus.collections.CommentSet(this.get("latestCommentList"));
        return this._comments;
    },

    currentUserIsOwner: function() {
        return this.owner().id === chorus.session.user().id;
    },

    members:function () {
        if (!this._members) {
            this._members = new chorus.collections.MemberSet([], {workspaceId:this.get("id")});
            this._members.bind("saved", function () {
                this.trigger("change");
            }, this);
        }
        return this._members;
    },

    declareValidations:function (newAttrs) {
        this.require("name", newAttrs);
    },

    archiver:function () {
        return new chorus.models.User(
          this.get("archiver")
        );
    },

    displayName:function () {
        return this.get("name");
    },

    displayShortName:function (length) {
//        length = length || 20;
//
        var name = this.displayName() || "";
//        return (name.length < length) ? name : name.slice(0, length) + "...";
        return name;
    },

    fetchImageUrl:function (options) {
        var size = (options && options.size) || "original";
        var url = this.get("image") && this.get("image")[size];
        return url && new URI(url)
            .addSearch({ iebuster: chorus.cachebuster() })
            .toString();
    },

    createImageUrl:function (options) {
        var url = new URI(this.url());
        url.path(url.path() + "/image");
        return url.toString();
    },

    picklistImageUrl:function () {
        return this.defaultIconUrl("small");
    },

    workfilesUrl: function () {
        return this.showUrl() + "/workfiles";
    },

    attrToLabel:{
        "name":"workspace.validation.name"
    },

    hasImage:function () {
        return this.get("image") && this.get("image")["original"];
    },

    canRead:function () {
        return this._hasPermission(['admin', 'read']);
    },

    canComment:function () {
        return this._hasPermission(['admin', 'commenting']);
    },

    canUpdate:function () {
        return this._hasPermission(['admin', 'update']);
    },

    currentUserCanCreateWorkFlows: function(){
        return this.isActive() && this._hasPermission(['admin', 'create_work_flow']);
    },

    currentUserCanDuplicateChorusViews: function() {
        return this._hasPermission(['admin', 'duplicate_chorus_view']);
    },

    workspaceAdmin:function () {
        return this._hasPermission(['admin']);
    },

    _hasPermission:function (validPermissions) {
        return _.intersection(this.get("permission"), validPermissions).length > 0;
    },

    maxImageSize:function () {
        return chorus.models.Config.instance().get("fileSizesMbWorkspaceIcon");
    }
});
