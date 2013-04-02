class ManagedWorkspace < Workspace
  belongs_to :manager, :class_name => 'User'
end