describe("chorus.dialogs.DataSourcesNew", function() {
    beforeEach(function() {
        loadConfig();
        stubDefer();
        this.selectMenuStub = stubSelectMenu();
        spyOn(chorus, 'styleSelect').andCallThrough();
        spyOn(chorus.dialogs.DataSourcesNew.prototype, "createDataSource").andCallThrough();
        this.dialog = new chorus.dialogs.DataSourcesNew();
        $('#jasmine_content').append(this.dialog.el);
        this.dialog.render();
    });

    it("styles the select", function() {
        expect(chorus.styleSelect).toHaveBeenCalled();
    });

    it("shows the icon", function() {
        this.dialog.$(".ui-selectmenu-button .ui-button").click();
        expect(this.selectMenuStub.find(".register_existing_greenplum")).toExist();
        expect(this.selectMenuStub.find(".register_existing_hdfs")).toExist();
    });

    it("shows data source description", function() {
        expect(this.dialog.$(".register_existing_greenplum .description").text()).toMatchTranslation("data_sources.new_dialog.register_existing_greenplum_help_text");
        expect(this.dialog.$(".register_existing_hdfs .description").text()).toMatchTranslation("data_sources.new_dialog.register_existing_hdfs_help_text");
    });

    it("does not autocomplete password inputs", function(){
        var passwordFields = this.dialog.$("input[type=password]");
        _.each(passwordFields, function(field) {
            expect($(field)).toHaveAttr("autocomplete", "off");
        });
    });

    describe("immediately", function() {
        beforeEach(function() {
            chorus.models.Config.instance().set({oracleConfigured: false, gnipConfigured: false});
            this.dialog.render();
        });
        it("shows the label", function() {
            expect(this.dialog.$("label[for=data_sources]").text()).toMatchTranslation("datasource.type");
        });

        it("has select box for 'Greenplum Database', 'HDFS Cluster'", function() {
            expect(this.dialog.$("select.data_sources option").length).toBe(3);
            expect(this.dialog.$("select.data_sources option").eq(1).text()).toMatchTranslation("datasource.greenplum");
            expect(this.dialog.$("select.data_sources option").eq(2).text()).toMatchTranslation("datasource.hdfs");
        });

        it("starts with no select box selected", function() {
            expect(this.dialog.$(".data_sources option:selected").text()).toMatchTranslation("selectbox.select_one");
        });

        it("starts with the submit button disabled", function() {
            expect(this.dialog.$("button.submit")).toBeDisabled();
        });

        describe("selecting the 'Greenplum Database' option", function() {
            beforeEach(function() {
                this.dialog.$(".data_sources").val("register_existing_greenplum").change();
            });

            it("un-collapses the 'register an existing data source'", function() {
                expect(this.dialog.$(".data_sources_form").not(".collapsed").length).toBe(1);
                expect(this.dialog.$(".register_existing_greenplum")).not.toHaveClass("collapsed");
            });

            it("enables the submit button", function() {
                expect(this.dialog.$("button.submit")).toBeEnabled();
            });

            it("uses 'postgres' as the default database name", function() {
                expect(this.dialog.$(".register_existing_greenplum input[name=dbName]").val()).toBe("postgres");
            });

            describe("filling out the form", function() {
                beforeEach(function() {
                    this.dialog.$(".register_existing_greenplum input[name=name]").val("DataSource_Name");
                    this.dialog.$(".register_existing_greenplum textarea[name=description]").val("DataSource Description");
                    this.dialog.$(".register_existing_greenplum input[name=host]").val("foo.bar");
                    this.dialog.$(".register_existing_greenplum input[name=port]").val("1234");
                    this.dialog.$(".register_existing_greenplum input[name=dbUsername]").val("user");
                    this.dialog.$(".register_existing_greenplum input[name=dbPassword]").val("my_password");
                    this.dialog.$(".register_existing_greenplum input[name=dbName]").val("foo");

                    this.dialog.$(".register_existing_greenplum input[name=name]").trigger("change");
                });

                it("gets the fieldValues", function() {
                    var values = this.dialog.fieldValues();
                    expect(values.name).toBe("DataSource_Name");
                    expect(values.description).toBe("DataSource Description");
                    expect(values.host).toBe("foo.bar");
                    expect(values.port).toBe("1234");
                    expect(values.dbUsername).toBe("user");
                    expect(values.dbPassword).toBe("my_password");
                    expect(values.dbName).toBe("foo");
                });
            });

            context("changing to 'Select one' option", function() {
                beforeEach(function() {
                    this.dialog.$("select.data_sources").val("").change();
                });

                it("should hides all forms", function() {
                    expect(this.dialog.$(".data_sources_form")).toHaveClass("collapsed");
                });

                it("should disable the submit button", function() {
                    expect(this.dialog.$("button.submit")).toBeDisabled();
                });

            });
        });

        describe("selecting the 'HDFS cluster' option", function() {
            beforeEach(function() {
                this.dialog.$("select.data_sources").val("register_existing_hdfs").change();
            });

            it("un-collapses the 'register a hadoop file system' form", function() {
                expect(this.dialog.$("div.data_sources_form").not(".collapsed").length).toBe(1);
                expect(this.dialog.$("div.register_existing_hdfs")).not.toHaveClass("collapsed");
            });

            it("enables the submit button", function() {
                expect(this.dialog.$("button.submit")).toBeEnabled();
            });

            describe("filling out the form", function() {
                beforeEach(function() {
                    var form = this.dialog.$(".register_existing_hdfs");
                    form.find("input[name=name]").val("DataSource_Name");
                    form.find("textarea[name=description]").val("DataSource Description");
                    form.find("input[name=host]").val("foo.bar");
                    form.find("input[name=port]").val("1234");
                    form.find("input.username").val("user");
                    form.find("input.group_list").val("hadoop");
                    form.find("select[name=hdfsVersion]").val("Cloudera CDH4");

                    form.find("input[name=name]").trigger("change");
                });

                it("labels 'host' correctly ", function() {
                    expect(this.dialog.$(".register_existing_hdfs label[name=host]").text()).toMatchTranslation("data_sources.dialog.hadoop_host");
                });

                it("#fieldValues returns the values", function() {
                    var values = this.dialog.fieldValues();
                    expect(values.name).toBe("DataSource_Name");
                    expect(values.description).toBe("DataSource Description");
                    expect(values.host).toBe("foo.bar");
                    expect(values.port).toBe("1234");
                    expect(values.username).toBe("user");
                    expect(values.groupList).toBe("hadoop");
                    expect(values.hdfsVersion).toBe("Cloudera CDH4");
                });

                it("#fieldValues includes 'shared'", function() {
                    var values = this.dialog.fieldValues();
                    expect(values.shared).toBe("true");
                });
            });
        });
    });

    context("when oracle is configured", function() {
        beforeEach(function() {
            chorus.models.Config.instance().set({oracleConfigured: true});
        });

        describe("selecting the 'Oracle Database' option", function() {
            beforeEach(function() {
                this.dialog.$(".data_sources").val("register_existing_oracle").change();
            });

            it("un-collapses the 'register an existing data source'", function() {
                expect(this.dialog.$(".data_sources_form").not(".collapsed").length).toBe(1);
                expect(this.dialog.$(".register_existing_oracle")).not.toHaveClass("collapsed");
            });

            it("enables the submit button", function() {
                expect(this.dialog.$("button.submit")).toBeEnabled();
            });

            it("uses a blank name as the default database name", function() {
                expect(this.dialog.$(".register_existing_oracle input[name=dbName]").val()).toBe("");
            });

            describe("filling out the form", function() {
                beforeEach(function() {
                    this.dialog.$(".register_existing_oracle input[name=name]").val("DataSource_Name");
                    this.dialog.$(".register_existing_oracle textarea[name=description]").val("DataSource Description");
                    this.dialog.$(".register_existing_oracle input[name=host]").val("foo.bar");
                    this.dialog.$(".register_existing_oracle input[name=port]").val("1234");
                    this.dialog.$(".register_existing_oracle input[name=dbUsername]").val("user");
                    this.dialog.$(".register_existing_oracle input[name=dbPassword]").val("my_password");
                    this.dialog.$(".register_existing_oracle input[name=dbName]").val("foo");

                    this.dialog.$(".register_existing_oracle input[name=name]").trigger("change");
                });

                it("should return the values in fieldValues", function() {
                    var values = this.dialog.fieldValues();
                    expect(values.name).toBe("DataSource_Name");
                    expect(values.description).toBe("DataSource Description");
                    expect(values.host).toBe("foo.bar");
                    expect(values.port).toBe("1234");
                    expect(values.dbUsername).toBe("user");
                    expect(values.dbPassword).toBe("my_password");
                    expect(values.dbName).toBe("foo");
                });
            });
        });
    });

    context("when gnip is configured", function() {
        beforeEach(function() {
            chorus.models.Config.instance().set({ gnipConfigured: true });
        });

        it("shows the 'Register an existing GNIP data source' option", function() {
            expect(this.dialog.$("select.data_sources option[name='register_existing_gnip']")).toExist();
        });

        it("shows gnip data source description", function() {
            expect(this.dialog.$(".register_existing_gnip .description").text()).toMatchTranslation("data_sources.new_dialog.register_existing_gnip_help_text");
        });

        it("shows the icon", function() {
            this.dialog.$(".ui-selectmenu-button .ui-button").click();
            expect(this.selectMenuStub.find(".register_existing_gnip")).toExist();
        });

        describe("selecting gnip data source", function() {
            beforeEach(function() {
                this.dialog.$("select.data_sources").val("register_existing_gnip").change();
            });

            it("shows the gnip streamUrl", function() {
                expect(this.dialog.$(".register_existing_gnip input[name=streamUrl]").val()).toBe("");
            });

            it("does not autocomplete password inputs", function(){
                var passwordField = this.dialog.$("input[type=password].gnip_password ");
                expect(passwordField).toHaveAttr("autocomplete", "off");
            });
        });
    });

    context("when gnip is not configured", function() {
        beforeEach(function() {
            chorus.models.Config.instance().set({ gnipConfigured: false });
            this.dialog.render();
        });

        it("does not show the 'Register an existing GNIP data source' option", function() {
            expect(this.dialog.$("select.data_sources option[name='register_existing_gnip']")).not.toExist();
        });
    });

    describe("submitting the form", function() {
        beforeEach(function() {
            this.dialog.$("select.data_sources").val(this.dialog.$("select.data_sources option:last").val());
            chorus.models.Config.instance().set({ gnipConfigured: true, gnipUrl: "www.example.com", gnipPort: 433, oracleConfigured:true });
        });

        it("hitting enter should submit the form", function() {
            this.dialog.$("form").submit();
            expect(chorus.dialogs.DataSourcesNew.prototype.createDataSource).toHaveBeenCalled();
        });

        function testUpload() {
            context("#upload", function() {
                beforeEach(function() {
                    this.dialog.$("button.submit").click();
                });

                it("puts the button in 'loading' mode", function() {
                    expect(this.dialog.$("button.submit").isLoading()).toBeTruthy();
                });

                it("changes the text on the upload button to 'saving'", function() {
                    expect(this.dialog.$("button.submit").text()).toMatchTranslation("data_sources.new_dialog.saving");
                });

                it("does not disable the cancel button", function() {
                    expect(this.dialog.$("button.cancel")).not.toBeDisabled();
                });

                context("when save completes", function() {
                    beforeEach(function() {
                        spyOn(chorus.PageEvents, 'trigger');
                        spyOn(this.dialog, "closeModal");

                        this.dialog.model.set({id: "123"});
                        this.dialog.model.trigger("saved");
                    });

                    it("closes the dialog", function() {
                        expect(this.dialog.closeModal).toHaveBeenCalled();
                    });

                    it('displays a toast message', function() {
                        spyOn(chorus, 'toast');
                        this.server.lastCreate().succeed();
                        expect(chorus.toast).toHaveBeenCalledWith('data_sources.add.toast',
                            {dataSourceName: this.dialog.model.name()});
                    });

                    it("publishes the 'data_source:added' page event with the new data_source's id", function() {
                        expect(chorus.PageEvents.trigger).toHaveBeenCalledWith("data_source:added", this.dialog.model);
                    });
                });

                function itRecoversFromError() {
                    it("takes the button out of 'loading' mode", function() {
                        expect(this.dialog.$("button.submit").isLoading()).toBeFalsy();
                    });

                    it("sets the button text back to 'Uploading'", function() {
                        expect(this.dialog.$("button.submit").text()).toMatchTranslation("data_sources.new_dialog.save");
                    });
                }

                context("when the upload gives a server error", function() {
                    beforeEach(function() {
                        this.dialog.model.set({serverErrors: { fields: { a: { BLANK: {} } } }});
                        this.dialog.model.trigger("saveFailed");
                    });

                    it("display the correct error", function() {
                        expect(this.dialog.$(".errors").text()).toContain("A can't be blank");
                    });

                    itRecoversFromError();
                });

                context("when the validation fails", function() {
                    beforeEach(function() {
                        this.dialog.model.trigger("validationFailed");
                    });

                    itRecoversFromError();
                });
            });
        }

        context("registering a hadoop data source", function() {
            beforeEach(function() {
                this.dialog.$("select.data_sources").val("register_existing_hdfs").change();

                var hadoopSection = this.dialog.$("div.register_existing_hdfs");
                hadoopSection.find("input[name=name]").val(" DataSource_Name ");
                hadoopSection.find("textarea[name=description]").val(" DataSource Description ");
                hadoopSection.find("input[name=host]").val(" foo.bar ");
                hadoopSection.find("input[name=port]").val("1234");
                hadoopSection.find("input[name=username]").val(" user ");
                hadoopSection.find("input[name=groupList]").val(" hadoop ").change();
                hadoopSection.find("input[name=jobTrackerHost]").val("foooo.baaaar");
                hadoopSection.find("input[name=jobTrackerPort]").val("4321");

                spyOn(chorus.models.HdfsDataSource.prototype, "save").andCallThrough();
                this.dialog.$("button.submit").click();
            });

            it("creates a hadoop data source model with the right data and saves it", function() {
                var params = this.server.lastCreate().params();

                expect(params['hdfs_data_source[name]']).toBe("DataSource_Name");
                expect(params['hdfs_data_source[description]']).toBe("DataSource Description");
                expect(params['hdfs_data_source[host]']).toBe("foo.bar");
                expect(params['hdfs_data_source[port]']).toBe("1234");
                expect(params['hdfs_data_source[username]']).toBe("user");
                expect(params['hdfs_data_source[group_list]']).toBe("hadoop");
                expect(params['hdfs_data_source[job_tracker_host]']).toBe("foooo.baaaar");
                expect(params['hdfs_data_source[job_tracker_port]']).toBe("4321");
            });
        });

        context("registering a greenplum database", function() {
            beforeEach(function() {
                this.dialog.$("select.data_sources").val("register_existing_greenplum").change();

                var section = this.dialog.$(".register_existing_greenplum");
                section.find("input[name=name]").val("DataSource_Name");
                section.find("textarea[name=description]").val("DataSource Description");
                section.find("input[name=host]").val("foo.bar");
                section.find("input[name=port]").val("1234");
                section.find("input[name=dbUsername]").val("user");
                section.find("input[name=dbPassword]").val("my_password");
                section.find("input[name=dbName]").val("foo");
                section.find("input[name=name]").trigger("change");
            });

            it("sends the right params", function() {
                this.dialog.$("button.submit").click();
                var params = this.server.lastCreate().params();

                expect(params['data_source[entity_type]']).toBe('gpdb_data_source');
                expect(params["data_source[name]"]).toBe("DataSource_Name");
                expect(params["data_source[description]"]).toBe("DataSource Description");
                expect(params["data_source[db_name]"]).toBe("foo");
            });

            testUpload();
        });

        context("registering an oracle database", function() {
            beforeEach(function() {
                this.dialog.$("select.data_sources").val("register_existing_oracle").change();

                var section = this.dialog.$(".register_existing_oracle");
                section.find("input[name=name]").val("DataSource_Name");
                section.find("textarea[name=description]").val("DataSource Description");
                section.find("input[name=host]").val("foo.bar");
                section.find("input[name=port]").val("1234");
                section.find("input[name=dbUsername]").val("user");
                section.find("input[name=dbPassword]").val("my_password");
                section.find("input[name=dbName]").val("foo");
                section.find("input[name=name]").trigger("change");

                spyOn(chorus.models.OracleDataSource.prototype, "save").andCallThrough();
            });

            it('sends the right params', function() {
                this.dialog.$("button.submit").click();
                var params = this.server.lastCreate().params();

                expect(params['data_source[entity_type]']).toBe('oracle_data_source');
                expect(params["data_source[db_password]"]).toBe("my_password");
                expect(params["data_source[name]"]).toBe("DataSource_Name");
                expect(params["data_source[description]"]).toBe("DataSource Description");
                expect(params["data_source[db_name]"]).toBe("foo");
            });

            testUpload();
        });

        context('registering a gnip data source', function() {
            beforeEach(function() {
                this.dialog.$("select.data_sources").val("register_existing_gnip").change();

                var section = this.dialog.$(".register_existing_gnip");
                section.find("input[name=name]").val("Gnip Name");
                section.find("textarea[name=description]").val("Gnip Description");
                section.find("input[name=streamUrl]").val("gnip.com");
                section.find("input[name=username]").val("gnip_user");
                section.find("input[name=password]").val("my_password");
            });

            it("sends the right params", function() {
                this.dialog.$("button.submit").click();
                var params = this.server.lastCreate().params();

                expect(params["gnip_data_source[name]"]).toBe("Gnip Name");
                expect(params["gnip_data_source[description]"]).toBe("Gnip Description");
                expect(params["gnip_data_source[stream_url]"]).toBe("gnip.com");
                expect(params["gnip_data_source[username]"]).toBe("gnip_user");
                expect(params["gnip_data_source[password]"]).toBe("my_password");
            });

            testUpload();
        });
    });
});
