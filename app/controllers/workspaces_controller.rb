class WorkspacesController < ApplicationController
  def index
    workspaces = Workspace.where("owner_id = ? OR public = ?", current_user.id, true).order("lower(name) ASC")
    workspaces = workspaces.active if params[:active]
    workspaces = workspaces.where(:owner_id => params[:user_id]) if params[:user_id]
    present workspaces.paginate(params.slice(:page, :per_page))
  end

  def create
    workspace = current_user.owned_workspaces.create!(params[:workspace])
    membership = workspace.memberships.build
    membership.user = current_user
    membership.save!
    present workspace, :status => :created
  end

  def show
    present AccessPolicy.workspaces_for(current_user).find(params[:id])
  end

  def update
    workspace = Workspace.writable_by(current_user).find(params[:id])
    workspace.update_attributes!(params[:workspace])
    present workspace
  end
end
