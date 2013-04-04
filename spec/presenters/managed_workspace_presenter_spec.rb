require 'spec_helper'

describe ManagedWorkspacePresenter, :type => :view do
  let(:user) { users(:owner) }
  let(:workspace) { workspaces(:managed) }
  let(:presenter) { ManagedWorkspacePresenter.new(workspace, view, options) }
  let(:options) {{}}

  before(:each) do
    set_current_user(user)
  end

  describe "#to_hash" do
    let(:hash) { presenter.to_hash }

    it "includes the manager" do
      hash.should have_key(:manager)
      hash[:manager].to_hash.should eq(UserPresenter.new(workspace.manager, view).presentation_hash)
    end

    it "includes the workspace presenter data" do
      hash.delete(:manager)
      hash.should eq(WorkspacePresenter.new(workspace, view, options).to_hash)
    end
  end
end