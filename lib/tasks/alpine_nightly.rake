namespace :alpine do

  desc 'install alpine from nightly build'
  task :nightly do |t, args|
    NightlyAlpineFetcher.fetch
  end
end