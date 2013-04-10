begin
  require_relative "../bundle/bundler/setup"
rescue
  puts "Make sure to install your gems with bundle --standalone to get a faster boot time"
  require 'rubygems'

  # Set up gems listed in the Gemfile.
  ENV['BUNDLE_GEMFILE'] ||= File.expand_path('../../Gemfile', __FILE__)

  # Ugh. needed for deploys on staging, should not affect dev/test. JP + BL
  $LOAD_PATH << File.expand_path('../../vendor/bundler_gem/gems/bundler-1.1.0/lib/', __FILE__)

  require 'bundler/setup' if File.exists?(ENV['BUNDLE_GEMFILE'])
end
