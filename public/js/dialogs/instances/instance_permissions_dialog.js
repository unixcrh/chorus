;
(function(ns) {
    ns.dialogs.InstancePermissions = ns.dialogs.Base.extend({
        className : "instance_permissions",
        title : t("instances.permissions_dialog.title"),
        persistent : true,

        events : {
            "click a.edit" : "editCredentials",
            "click a.save" : "save",
            "click a.cancel" : "cancel",
            "click button.add_account" : "newAccount",
            "click a.alert" : "removeSharedAccountAlert"
        },

        makeModel : function() {
            this.instance = this.options.pageModel;
            this.model = this.instance.sharedAccount();
            if (!this.model) {
                this.users = new ns.models.UserSet();
                this.users.bind("reset", this.populateSelect, this);
                this.users.fetchAll();
            }
            this.collection = this.instance.accounts();

            this.collection.bind("saved", this.saved, this);
            this.collection.bind("saveFailed", this.saveFailed, this);
            this.collection.bind("validationFailed", this.saveFailed, this);

            this._super("makeModel")
        },

        additionalContext: function() {
            return {
                sharedAccount: !!this.instance.sharedAccount(),
                accountCount: this.collection.reject(function(account) {return account.isNew()}).length
            };
        },

        collectionModelContext: function(account) {
            var context = {};
            var user = account.user()
            if (user) {
                _.extend(context, {
                    fullName: user.displayName(),
                    imageUrl: user.imageUrl(),
                    isOwner: this.instance.isOwner(account.user())
                });
            }
            if (account.isNew()) {
                context.id = 'new';
                context.isNew = true;
            }
            return context;
        },

        editCredentials : function(event) {
            event.preventDefault();
            var li = $(event.target).closest("li");
            var accountId = li.data("id");
            li.addClass("editing");
            this.account = this.resource = this.collection.get(accountId);
        },

        newAccount: function(e) {
            var button = this.$("button.add_account");
            if (button.is(":disabled")) return;
            this.account = this.resource = new ns.models.InstanceAccount({instanceId: this.instance.get("id")});
            this.collection.add(this.account);
            this.render();
            this.$("button.add_account").attr("disabled", "disabled");
            this.$("li[data-id=new]").addClass('editing new');
            this.populateSelect();
        },

        populateSelect: function() {
            var userSet = new chorus.models.UserSet(this.collection.users());

            var options = this.users.map(function(user) {
                if(!userSet.get(user.get("id"))) {
                return $("<option/>").text(user.displayName()).val(user.get("id")).outerHtml();}
            });
            var select = this.$("li.new select.name");
            if (select) {
                select.append(options.join(""));
            }
            chorus.styleSelect(select);
        },

        save : function(event) {
            event.preventDefault();
            var li = $(event.target).closest("li");
            li.find("a.save").startLoading("instances.permissions.saving")

            this.account.save({
                userId: li.find("select").val(),
                dbUserName : li.find("input[name=dbUserName]").val(),
                dbPassword : li.find("input[name=dbPassword]").val()
            });
        },

        cancel : function(event) {
            event.preventDefault();
            this.$("button.add_account").removeAttr("disabled");
            this.$("li").removeClass("editing");
            this.$("li[data-id=new]").remove();
            if(this.account.isNew()) {
                this.collection.remove(this.account);
                delete this.account;
            }
        },

        saved : function() {
            this.instance.fetch();
            this.render();
        },

        saveFailed : function() {
            this.$("a.save").stopLoading();
        },

        removeSharedAccountAlert : function(e) {
            e.preventDefault();
            var alert = new ns.alerts.RemoveSharedAccount();
            alert.bind("removeSharedAccount", _.bind(this.confirmRemoveSharedAccount, this));
            this.launchSubModal(alert);
        },

        confirmRemoveSharedAccount : function() {
            var map = this.model;
            this.model.bind("saved", displaySuccessToast, this);
            this.model.bind("saveFailed", displayFailureToast);

            var id = this.model.get("id")
            this.model.clear({silent: true});
            this.model.save({id: id, shared: "no"});

            function displaySuccessToast() {
                ns.toast("instances.shared_account_removed");
                this.instance.unset("sharedAccount");
                this.render();
                map.unbind("saved", displaySuccessToast);
                map.unbind("saveFailed", displayFailureToast);
            }

            function displayFailureToast() {
                ns.toast("instances.shared_account_remove_failed");
                map.unbind("saved", displaySuccessToast);
                map.unbind("saveFailed", displayFailureToast);
            }
        }
    });
})(chorus);
