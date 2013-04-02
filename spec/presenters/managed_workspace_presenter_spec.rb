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
      #puts workspace.class => Workspace
      presenter.to_hash
      #hash.should have_key(:manager)
      #hash[:manager].to_hash.should == (UserPresenter.new(workspace.manager, view).presentation_hash)
    end
  end
end