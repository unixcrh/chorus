describe("chorus.views.LoadingSection", function() {
    describe("#render", function() {
        context("without options", function() {
            beforeEach(function() {
                this.view = new chorus.views.LoadingSection();
                this.view.render();
            });

            it("immediately draws the spinner", function() {
                expect(this.view.$(".loading_spinner div[aria-role=progressbar]")).toExist();
            });
        });

        context("with options", function() {
            beforeEach(function() {
                clock.install();
                this.delay = 25;
                this.view = new chorus.views.LoadingSection({delay: this.delay});
            });

            it("doesn't fill in the sections until after the delay", function() {
                this.view.render();

                expect(this.view.$(".loading_spinner").is(":empty")).toBeTruthy();
                expect(this.view.$(".loading_text")).toHaveClass("hidden");

                clock.tick(this.delay + 1);
                expect(this.view.$(".loading_text")).not.toHaveClass("hidden");
                expect(this.view.$(".loading_spinner div[aria-role=progressbar]")).toExist();
            });
        });
    });
});