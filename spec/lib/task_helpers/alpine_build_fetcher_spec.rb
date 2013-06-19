require 'spec_helper'

describe AlpineBuildFetcher do

  describe 'default options' do
    it 'has the correct default fetch url' do
      described_class.defaults[:fetch_url].should == 'http://184.169.171.153/NightlyBuild/Illuminator'
    end
  end

  describe 'installing the nightly build' do
    let(:fetcher) { described_class.new options }

    describe '#build_list_html' do
      let(:options) {{:fetch_url => pull_url}}
      let(:pull_url) {'NightlyBuild'}

      it "pulls from the alpine nightly builds" do
        mock(Kernel).open(pull_url)
        fetcher.build_list_html
      end
    end

    describe '#latest_build' do
      let(:options) { {:fetch_url => 'example.com'} }
      it "parses the latest build from a given html file" do
        file = open("#{::Rails.root}/spec/fixtures" + '/alpine_build_list.html')
        #Alpine_Rel2.9_single_20130618-0601/
        fetcher.latest_build(file).should == 'example.com/Alpine_Rel2.9_single_20130618-0601/Alpine_Bundle_Rel2.9_single_linux_20130618-0601.zip'
      end
    end

    describe '#download' do
      let(:options)       { nil }
      let(:dir)           { Rails.root }
      let(:file_uri)      { 'foo' }

      it 'pulls the specified file from THE INTERNET to a target directory' do
        mock(Kernel).system("curl #{file_uri} > #{dir}/alpine.zip")
        fetcher.download_to(dir, file_uri)
      end
    end
  end
end