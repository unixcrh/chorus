require 'spec_helper'

describe InstanceAccountsController do
  let(:admin) {FactoryGirl.create :admin}
  let(:instance_owner) {FactoryGirl.create :user}
  let(:joe) {FactoryGirl.create :user}
  let(:instance) {FactoryGirl.create :instance, :owner => instance_owner}

  describe "#index" do
    let!(:account1) { FactoryGirl.create :instance_account, :instance => instance, :db_username => "instance_owner", :owner => instance_owner }
    let!(:account2) { FactoryGirl.create :instance_account, :instance => instance, :db_username => "joe", :owner => joe}

    before do
      log_in instance_owner
    end

    it_behaves_like "an action that requires authentication", :get, :index

    it "succeeds" do
      get :index, :instance_id => instance.to_param
      response.code.should == "200"
    end

    it "shows list of users" do
      get :index, :instance_id => instance.to_param
      decoded_response.length.should == 2
    end

    describe "pagination" do
      let!(:bob) { FactoryGirl.create :user }
      let!(:account3) { FactoryGirl.create :instance_account, :instance => instance, :db_username => "bob", :owner => bob }

      it "paginates the collection" do
        get :index, :instance_id => instance.to_param, :page => 1, :per_page => 2
        decoded_response.length.should == 2
      end

      it "defaults to page one" do
        get :index, :instance_id => instance.to_param, :per_page => 2
        decoded_response.length.should == 2
        decoded_response.first.db_username.should == "instance_owner"
        decoded_response.second.db_username.should == "joe"
      end

      it "accepts a page parameter" do
        get :index, :instance_id => instance.to_param, :page => 2, :per_page => 2
        decoded_response.length.should == 1
        decoded_response.first.db_username.should == "bob"
      end

      it "defaults the per_page to fifty" do
        get :index, :instance_id => instance.to_param
        request.params[:per_page].should == 50
      end
    end
  end

  describe "#create" do
    let!(:owner) { FactoryGirl.create :user }
    context "when admin" do
      before do
        log_in admin
      end

      context "for a shared account instance" do
        before do
          instance.update_attribute :shared, true
        end

        context "that does not already have accounts stored" do
          it "get saved correctly" do
            post :create, :instance_id => instance.id, :account => { :db_username => "lenny", :db_password => "secret", :owner_id => owner.id }
            response.code.should == "201"
            rehydrated_account = InstanceAccount.find(decoded_response.id)
            rehydrated_account.should be_present
            rehydrated_account.db_username.should == "lenny"
            rehydrated_account.db_password.should == "secret"
            rehydrated_account.owner.should == owner
            rehydrated_account.instance.should == instance
          end
        end

        context "that already has accounts stored" do
          before do
            FactoryGirl.create(:instance_account, :instance => instance)
          end

          it "fails" do
            post :create, :instance_id => instance.id, :account => {:db_username => "lenny", :db_password => "secret", :owner_id => owner.id }
            response.code.should == "422"
          end
        end
      end

      context "for an individual accounts instance" do
        it "get saved correctly" do
          post :create, :instance_id => instance.id, :account => {:db_username => "lenny", :db_password => "secret", :owner_id => admin.id }
          response.code.should == "201"
          rehydrated_account = InstanceAccount.find(decoded_response.id)
          rehydrated_account.should be_present
          rehydrated_account.db_username.should == "lenny"
          rehydrated_account.db_password.should == "secret"
          rehydrated_account.owner.should == admin
          rehydrated_account.instance.should == instance
        end
      end
    end

    context "when instance owner" do
      before do
        log_in instance_owner
      end

      context "for a shared accounts instance" do
        before do
          instance.update_attribute :shared, true
        end

        context "that does not already have accounts stored" do
          it "get saved correctly" do
            post :create, :instance_id => instance.id, :account => {:db_username => "lenny", :db_password => "secret", :owner_id => owner.id }
            response.code.should == "201"
            rehydrated_account = InstanceAccount.find(decoded_response.id)
            rehydrated_account.should be_present
            rehydrated_account.db_username.should == "lenny"
            rehydrated_account.db_password.should == "secret"
            rehydrated_account.owner.should == owner
            rehydrated_account.instance.should == instance
          end
        end

        context "that already has accounts stored" do
          before do
            account = instance.accounts.build :db_username => "foo", :db_password => "bar"
            account.owner = instance_owner
            account.save!
          end

          it "fails" do
            post :create, :instance_id => instance.id, :account => {:db_username => "lenny", :db_password => "secret", :owner_id => owner.id }
            response.code.should == "422"
          end
        end
      end

      context "for an individual accounts instance" do
        it "get saved correctly" do
          post :create, :instance_id => instance.id, :account => {:db_username => "lenny", :db_password => "secret", :owner_id => owner.id }
          response.code.should == "201"
          rehydrated_account = InstanceAccount.find(decoded_response.id)
          rehydrated_account.should be_present
          rehydrated_account.db_username.should == "lenny"
          rehydrated_account.db_password.should == "secret"
          rehydrated_account.owner.should == owner
          rehydrated_account.instance.should == instance
        end
      end
    end

    context "when regular joe" do
      before do
        log_in joe
      end

      context "for a shared accounts instance" do
        before do
          instance.update_attribute :shared, true
        end

        context "that does not already have accounts stored" do
          it "fails" do
            post :create, :instance_id => instance.id, :account => {:db_username => "lenny", :db_password => "secret", :owner_id => joe.id }
            response.code.should == "403"
          end
        end

        context "that already has accounts stored" do
          before do
            InstanceAccount.create :instance_id => instance.id, :owner_id => FactoryGirl.create(:user).id, :db_username => "foo", :db_password => "bar"
          end

          it "fails" do
            post :create, :instance_id => instance.id, :account => {:db_username => "lenny", :db_password => "secret", :owner_id => joe.id }
            response.code.should == "403"
          end
        end
      end

      context "for an individual accounts instance" do
        it "get saved correctly" do
          post :create, :instance_id => instance.id, :account => {:db_username => "lenny", :db_password => "secret", :owner_id => joe.id }
          response.code.should == "201"
          rehydrated_account = InstanceAccount.find(decoded_response.id)
          rehydrated_account.should be_present
          rehydrated_account.db_username.should == "lenny"
          rehydrated_account.db_password.should == "secret"
          rehydrated_account.owner.should == joe
          rehydrated_account.instance.should == instance
        end
      end
    end
  end

  describe "#update" do
    let(:account) { FactoryGirl.create :instance_account, :instance => instance, :owner => instance_owner }

    context "when admin" do
      before do
        log_in admin
      end

      it "succeeds" do
        put :update, :instance_id => instance.id, :id => account.id, :account => {:db_username => "changed", :db_password => "changed" }
        response.code.should == "200"
        rehydrated_account = InstanceAccount.find(decoded_response.id)
        rehydrated_account.should be_present
        rehydrated_account.db_username.should == "changed"
        rehydrated_account.db_password.should == "changed"
        rehydrated_account.owner.should == instance_owner
      end
    end

    context "when instance owner" do
      before do
        log_in instance_owner
      end

      it "succeeds for user's account" do
        put :update, :instance_id => instance.id, :id => account.id, :account => {:db_username => "changed", :db_password => "changed" }
        response.code.should == "200"
        rehydrated_account = InstanceAccount.find(decoded_response.id)
        rehydrated_account.should be_present
        rehydrated_account.db_username.should == "changed"
        rehydrated_account.db_password.should == "changed"
        rehydrated_account.owner.should == instance_owner
      end

      it "fails for other's account" do
        account.update_attribute :owner, joe
        put :update, :instance_id => instance.id, :id => account.id, :account => {:db_username => "changed", :db_password => "changed" }
        response.code.should == "403"
      end
    end

    context "when regular joe" do
      before do
        log_in joe
      end

      context "someone else's account'" do
        it "fails" do
          put :update, :instance_id => instance.id, :id => account.id, :account => {:db_username => "changed", :db_password => "changed" }
          response.should be_forbidden
        end
      end

      context "his own account" do
        before do
          account.owner = joe
          account.save!
        end

        it "succeeds" do
          put :update, :instance_id => instance.id, :id => account.id, :account => {:db_username => "changed", :db_password => "changed" }
          response.code.should == "200"
          rehydrated_account = InstanceAccount.find(decoded_response.id)
          rehydrated_account.should be_present
          rehydrated_account.db_username.should == "changed"
          rehydrated_account.db_password.should == "changed"
          rehydrated_account.owner.should == joe
        end
      end
    end
  end

  describe "#show" do
    let(:account1) { FactoryGirl.create :instance_account, :instance => instance, :db_username => "instance_owner", :owner => instance_owner }

    it "when given an :id parameter returns the specified InstanceAccount" do
      log_in instance_owner
      get :show, :id => account1.id, :instance_id => instance.id
      response.code.should == "200"
      decoded_response.id.should == account1.id
      decoded_response.db_username.should == account1.db_username
    end

    it "when given no :id parameter returns the current_user's InstanceAccount for the specified Instance" do
      joes_account = FactoryGirl.create :instance_account, :instance => instance, :owner => joe
      log_in joe
      get :show, :instance_id => instance.id
      response.code.should == "200"
      decoded_response.id.should == joes_account.id
      decoded_response.db_username.should == joes_account.db_username
    end

    it "generates a jasmine fixture", :fixture => true do
      log_in joe
      get :show, :id => account1.id, :instance_id => instance.id
      save_fixture "instanceAccount.json"
    end
  end
end
