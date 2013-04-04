class AddTypeToWorkspace < ActiveRecord::Migration
  def change
    add_column :workspaces, :type, :string
  end
end
