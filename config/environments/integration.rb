require_relative 'test'

#require 'rails'
require 'sass-rails'
#require 'compass-rails'
#require 'handlebars_assets'

Chorus::Application.configure do
  config.action_dispatch.show_exceptions = false # make sure capybara server middleware gets exceptions
  config.middleware.delete(::Rack::Sendfile)
  config.allow_concurrency = true
end
