class AddManagerIdToWorkspace < ActiveRecord::Migration
  def change
    add_column :workspaces, :manager_id, :integer
  end
end