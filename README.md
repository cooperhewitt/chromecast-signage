chromecast-signage
--

## Who's on first

## Chromecast device

Sometimes called the "dongle". The plastic thing that comes in a box and which
you plug in to your monitor or display.

## Chromecast application

The [Chromecast setup application](https://cast.google.com/chromecast/setup)
used to pair the Chromecast device with your Wifi network.

## Chrome and Chromecast extension

The [Chrome web browser](https://www.google.com/intl/en/chrome/browser/) with the [Chromecast extension](https://chrome.google.com/webstore/detail/google-cast/boadgeojelhgndaghljhdicfkmllpafd?hl=en) installed.

## Sender

The "sender" is a webpage that you load in Google Chrome and which can cause a
custom web page/application (often called the "receiver", but more on that
below) to be loaded by the Chromecast device.

## Receiver

This is a living breathing URL (or at least something whose DNS can be resolved
by the Chromecast device) that will be loaded by a Chromecast device.

Not just any URL can be loaded though. You need to have the URL in question
[whitelisted by Google](https://developers.google.com/cast/whitelisting). Once
the URL has been approved you will be issued an `application ID`. That ID needs
to be included in a little bit of Javascript in both the "sender" and the
"receiver".

Additionally, you need to add the _domain_ for the whitelisted URL to a separate
whitelist in the Chromecast extension, but more on that below.

## Broker

This is a very simple [socket.io](http://socket.io) server that is designed to
relay messages between the various pieces.

## Client

This is a plain old webpage that can run in any web browser that retrieves
informations about, and relays commands to, one or more displays via the
"broker".

Specifically the "broker" _brokers_ traffic between one or more "client"
applications and a single "sender" which itself controls one or more
"receivers".

## What does that look like in practice?

It looks like this:

![model](https://github.com/cooperhewitt/chromecast-signage/blob/master/model/model.png?raw=true)

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

## Make it go

### broker/server.js

The first thing you'll need to do is start the broker. You can do this manually by typing:

	$> node broker/server.js

Or using the handy `Makefile` shortcut:

	$> make do-broker

This will spin up a dumb little socket.io server to relay events between the various devices.

### chromecast/globals.js

Make sure you copy the `chromecast/globals.js.example` file to `chromecast/globals.js` and update it with the relevant configs (like you Chromecast app ID)

See also
--

* https://developers.google.com/cast/reference/

* https://github.com/googlecast/cast-android-sample

