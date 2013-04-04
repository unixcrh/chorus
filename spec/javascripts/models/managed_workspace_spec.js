describe("chorus.models.ManagedWorkspace", function() {
    describe("#manager", function() {
        beforeEach(function() {
            this.workspace = rspecFixtures.managedWorkspace({
                manager: {
                    firstName: "John",
                    lastName: "McJohnFace"
                }
            });
        });

        it("returns the workspace's manager as User model", function() {
            expect(this.workspace.manager()).toBeA(chorus.models.User);
            expect(this.workspace.manager().get('firstName')).toBe("John");
        });
    });
});