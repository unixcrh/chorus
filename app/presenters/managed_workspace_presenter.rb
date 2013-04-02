class ManagedWorkspacePresenter < WorkspacePresenter
  def to_hash
    super.merge(:manager => present(model.manager))
  end
end