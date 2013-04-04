chorus.models.ManagedWorkspace = chorus.models.Workspace.extend({
    manager: function() {
        return new chorus.models.User(this.get("manager"));
    }
});