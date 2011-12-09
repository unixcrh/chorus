(function($, ns) {
    ns.WorkfileList = chorus.views.Base.extend({
        tagName : "ul",
        className : "workfile_list",
        additionalClass : "list",
        events : {
            "click li" : "selectItem"
        },

        selectItem : function selectItem(e){
            if ($(e.currentTarget).hasClass("selected")) {
                // don't repeatedly raise events for the same item
                // e.g. the user clicks the item to highlight text
                return;
            }
            
            this.$("li").removeClass("selected");
            $(e.currentTarget).addClass("selected");
            var workfileId = $(e.currentTarget).data("id");
            var workfile = this.collection.get(workfileId);
            this.trigger("workfile:selected", workfile);
        },

        collectionModelContext : function(model) {
            var isOther = !(model.isImage() || model.isText());

            var ctx = {
                iconUrl : chorus.urlHelpers.fileIconUrl(model.get('fileType')),
                showUrl : isOther ? model.downloadUrl() : model.showUrl()
            }

            var lastComment = model.lastComment();
            if (lastComment) {
                var commentOnMatch = lastComment.get("commentCreatedStamp") && lastComment.get("commentCreatedStamp").match(/(.+)\.\d{1,3}/)
                if (commentOnMatch && commentOnMatch[1]) {
                    var commentOn = Date.parse(commentOnMatch[1]).toString("MMM d");
                }

                var commentOn =
                ctx.lastComment = {
                    body : lastComment.get("body"),
                    creator : lastComment.creator(),
                    on : commentOn
                }

                ctx.otherCommentCount = parseInt(model.get("commentCount")) - 1;
            };

            return ctx;
        },

        filter: function(type){
            this.collection.attributes.type = type;
            this.collection.fetch();
            return this;
        },

        postRender : function() {
            if (this.$("li.selected").length == 0) {
                this.$("li:first-child").click();
            }
        }
    });
})(jQuery, chorus.views);
