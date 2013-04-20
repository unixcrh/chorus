beforeEach(function() {
    (function () {
        // wrap matchers
        this.matchersClass = function() {
            jasmine.Matchers.apply(this, arguments);
        };
        jasmine.util.inherit(this.matchersClass, jasmine.Matchers);

        jasmine.Matchers.wrapInto_(jasmine.Matchers.prototype, this.matchersClass);
    }).apply(jasmine.getEnv());
});