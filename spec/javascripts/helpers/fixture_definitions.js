window.fixtureDefinitions = {
    user: {
        model: "User",
        unique: [ "id" ]
    },

    workspace: {
        model: "Workspace",
        unique: [ "id", "sandboxInfo.sandboxId" ]
    },

    workspaceSet: {
        collection: "WorkspaceSet",
        unique: [ "id", "sandboxInfo.sandboxId" ]
    },

    userSet: {
        collection: "UserSet",
        unique: [ "id" ]
    },

    schema: {
        model: "Schema",
        unique: [ "id", "instance.id"]
    },

    schemaSet: {
        collection: "SchemaSet",
        unique: ["id"]
    },

    sandbox: {
        model: "Sandbox",
        unique: [ "id", "workspaceId", "instanceId", "schemaId", "databaseId" ]
    },

    datasetExternalTable: {
        model: "Dataset",
        unique: [ "id" ]
    },

    datasetSourceView: {
        model: "Dataset",
        unique: [ "id" ]
    },

    datasetSourceTable: {
        model: "Dataset",
        unique: [ "id" ]
    },

    datasetSandboxView: {
        model: "Dataset",
        unique: [ "id" ]
    },

    datasetSandboxTable: {
        model: "Dataset",
        unique: [ "id" ]
    },

    datasetChorusView: {
        model: "Dataset",
        unique: [ "id" ]
    },

    csvImport: {
        model: "CSVImport"
    }
};
