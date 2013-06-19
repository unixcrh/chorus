class AlpineBuildFetcher
  def self.defaults
    {:fetch_url => 'http://184.169.171.153/NightlyBuild/Illuminator'}
  end

  def initialize(options = defaults)
    @options = options
  end

  def build_list_html
    Kernel.open @options.fetch(:fetch_url)
  end

  def latest_build(html_file)
    doc = Nokogiri::HTML(html_file)
    file_name = doc.css('a').to_a.last['href']
    base_url + file_name + file_slug(file_name)
  end

  def download_to(dir, file_url)
    Kernel.system("curl #{file_url} > #{dir}/alpine.zip")
  end

  private

  def base_url
    @options.fetch(:fetch_url) + '/'
  end

  def file_slug(name)
    name.
        gsub('Rel', 'Bundle_Rel').
        gsub('single', 'single_linux').
        gsub('/', '.zip')
  end
end