chorus.views.WorkfileContentDetails = chorus.views.Base.include(
        chorus.Mixins.StickyHeader
    ).extend({

    templateName:"workfile_content_details",
    additionalClass: "workfile_content_details action_bar_highlighted",

    setup: function() {
        this.subscribePageEvent("file:autosaved", this.updateAutosaveText);
    },

    teardown: function() {
        this._super("teardown", arguments);
        this.teardownStickyHeaders();
    },

    updateAutosaveText: function(args) {
        var text = args ? args : "workfile.content_details.auto_save";

        var time = this.formatTime(new Date());
        this.$("span.auto_save").removeClass("hidden");
        this.$("span.auto_save").text(t(text, {time:time}));
    },

    additionalContext: function() {
        return {
            isLatestVersion: this.model.isLatestVersion(),
            disableSaveButton: !this.model.workspace().isActive() || !this.model.workspace().canUpdate()
        };
    },

    fileMenuItems: function() {
        return [{
                name: "new",
                text: t("workfile.content_details.save_new_version"),
                onSelect: _.bind(this.createNewVersion, this)
            },
            {
                name: "replace",
                text: t("workfile.content_details.replace_current"),
                onSelect: _.bind(this.replaceCurrentVersion, this)
            }
        ];
    },

    postRender: function() {
        this.fileMenu = new chorus.views.Menu({
            launchElement: this.$(".save_as"),
            checkable: false,
            orientation: "left",
            items: this.fileMenuItems()
        });

        if (!this.model.isLatestVersion()) {
            this.fileMenu.disableItem("replace");
        }

        this.bindStickyHeader();
    },

    stickyHeaderElements: function() {
        var $resultsConsole = this.$el.closest('.main_content').find(".results_console");
        return [this.$el, $resultsConsole];
    },

    replaceCurrentVersion: function() {
        this.updateAutosaveText("workfile.content_details.save");
        chorus.PageEvents.trigger("file:replaceCurrentVersion");
    },

    createNewVersion: function() {
        chorus.PageEvents.trigger("file:createNewVersion");
    },


    formatTime: function(time) {
        var hours = time.getHours();
        var minutes = time.getMinutes();

        var suffix = "AM";
        if (hours >= 12) {
            suffix = "PM";
            hours = hours - 12;
        }
        if (hours === 0) {
            hours = 12;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        return hours + ":" + minutes + " " + suffix;
    }
},
{
    buildFor: function(model, contentView) {
        if (model.isImage()) {
            return new chorus.views.ImageWorkfileContentDetails({ model:model });
        }

        if (model.isPartialFile()) {
            return new chorus.views.PartialWorkfileContentDetails({ model:model });
        }

        if (model.isSql()) {
            if (model.workspace().isActive()) {
                return new chorus.views.SqlWorkfileContentDetails({ model:model, contentView: contentView });
            } else {
                return new chorus.views.ArchivedWorkfileContentDetails({ model:model });
            }
        }

        if (model.isAlpine()) {
            return new chorus.views.AlpineWorkfileContentDetails({ model:model });
        }

        if (model.isTableau()) {
            return new chorus.views.TableauWorkfileContentDetails({ model:model });
        }

        if (model.isBinary()) {
            return new chorus.views.BinaryWorkfileContentDetails({ model:model });
        }

        return new chorus.views.WorkfileContentDetails({ model:model });
    }
});
