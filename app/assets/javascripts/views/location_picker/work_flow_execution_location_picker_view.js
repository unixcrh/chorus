chorus.views.WorkFlowExecutionLocationPicker = chorus.views.LocationPicker.BaseView.extend({
    constructorName: 'WorkFlowExecutionLocationPicker',
    templateName: "execution_location_picker",

    subviews: {
        ".data_source": "dataSourceView",
        ".database": "databaseView"
    },

    buildSelectorViews: function() {
        this.databaseView = new chorus.views.LocationPicker.DatabaseView();

        this.dataSourceView = new chorus.views.LocationPicker.DataSourceView({
            showHdfsDataSources: true,
            childPicker: this.databaseView
        });

        this.registerSubView(this.databaseView);
        this.registerSubView(this.dataSourceView);
    },

    setSelectorViewDefaults: function() {
        this.databaseView.hide();
        this.setSelection('dataSource', this.options.dataSource);
        this.setSelection('database', this.options.database);
        if(this.dataSourceView.selection && !this.options.database && this.options.dataSource.databases) {
            this.databaseView.fetchDatabases(this.dataSourceView.selection);
        }
    },

    getSelectedDataSource: function() {
        return this.dataSourceView.selection;
    },

    getSelectedDatabase: function() {
        return this.databaseView.selection;
    },

    ready: function() {
        return this._super('ready') || this.isHdfs();
    },

    isHdfs: function() {
        var selectedDataSource = this.getSelectedDataSource();
        return selectedDataSource && selectedDataSource.get("entityType") === "hdfs_data_source";
    }
});