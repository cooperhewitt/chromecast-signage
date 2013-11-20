chromecast-signage
--

## Setup

### MAMP

Add something like this to `/Applications/MAMP/conf/apache/extra/httpd-vhosts.conf`

	<VirtualHost *:80>
	    ServerAdmin webmaster@dummy-host.example.com
	    DocumentRoot "/Applications/MAMP/htdocs/chromecast"
	    ServerName collection.cooperhewitt.org
	    # ErrorLog "logs/dummy-host.example.com-error_log"
	    # CustomLog "logs/dummy-host.example.com-access_log" common
	</VirtualHost>

Note that I have symlink-ed the `chromecast` directory (in this repo)
in to `/Applications/MAMP/htdocs`.

Also note the `ServerName` directive which is
collection.cooperhewitt.org. As of this writing we're not actually
running any of this stuff on the production site but it's the host/URL
we got whitelisted so that means we also need to update...

### /etc/hosts

To direct traffic to `collection.cooperhewitt.org` back to the local
machine (aka MAMP)

	127.0.0.1       collection.cooperhewitt.org

At this point it's also worth flushing your local DNS cache, like
this:

	$> dscacheutil -flushcache

See also
--

* https://developers.google.com/cast/reference/

* https://github.com/googlecast/cast-android-sample

