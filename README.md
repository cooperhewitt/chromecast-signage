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

### chrome-extension

You need to make sure that the hostname you had whitelisted is _also_
whitelisted in the Chrome extension itself.

I have no idea why but basically in Chrome select the little
Chromecast icon in the top right hand corner of the browser
window. Choose `Options` which will open a web page with options for
the extension.

Now... are you ready for it? ... click the blue Chromecast icon in the
top left hand corner _of the webpage_. Not once but over and over and
over again until you see the `Developer Settings` box appear. I know,
right?

Once it appears add the hostname (collection.cooperhewitt.org) to the
list of "Cast SDK additional domains".


See also
--

* https://developers.google.com/cast/reference/

* https://github.com/googlecast/cast-android-sample

