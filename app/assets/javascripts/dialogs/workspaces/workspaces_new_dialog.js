chorus.dialogs.WorkspacesNew = chorus.dialogs.Base.include(
        chorus.Mixins.DialogFormHelpers
    ).extend({
    constructorName: "WorkspacesNew",

    templateName:"workspaces_new",
    title:"Create a New Workspace",

    persistent:true,

    makeModel:function () {
        this.model = this.model || new chorus.models.Workspace();
    },

    setup:function () {
        this.listenTo(this.resource, "saved", this.workspaceSaved);
        this.listenTo(this.resource, "saveFailed", function() { this.$("button.submit").stopLoading(); });
        this.disableFormUnlessValid({formSelector: "form.new_workspace", inputSelector: "input[name='name']"});
    },

    create:function create(e) {
        e.preventDefault();

        this.resource.set({
            name:this.$("input[name=name]").val().trim(),
            "public": !!this.$("input[name=public]").is(":checked")
        });

        this.$("button.submit").startLoading("actions.creating");
        this.resource.save();
    },

    workspaceSaved:function () {
        this.closeModal();
        chorus.router.navigate("/workspaces/" + this.model.get("id") + "/quickstart");
    }
});
