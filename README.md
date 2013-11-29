chromecast-signage
--

Since the late 1990s museums have been fighting a pointless war against the
consumerization of technology. By the time the Playstation 2 was released in
2000, every science museum’s exhibition kiosk game looked, felt, and was
terribly out dated. The visitors had better hardware in their lounge rooms than
museums could ever hope to have. By the time the first iPhone hit the shelves in
2007, visitors have also had better hardware in their pockets.

But what if that consumer hardware, ever dropping in price, could be adapted
and quickly integrated into the museum itself?

– ["C" is for Chromecast: hacking digital signage.]()

## What does that look like in practice?

Something like this:

![model](https://github.com/cooperhewitt/chromecast-signage/blob/master/model/model.png?raw=true)

## Who's on first

### Chromecast device

Sometimes called the "dongle". The plastic thing that comes in a box and which
you plug in to your monitor or display.

### Chromecast application

The [Chromecast setup application](https://cast.google.com/chromecast/setup)
used to pair the Chromecast device with your Wifi network.

### Chrome and Chromecast extension

The [Chrome web browser](https://www.google.com/intl/en/chrome/browser/) with the [Chromecast extension](https://chrome.google.com/webstore/detail/google-cast/boadgeojelhgndaghljhdicfkmllpafd?hl=en) installed.

### Sender

The "sender" is a webpage that you load in Google Chrome and which can cause a
custom web page/application (often called the "receiver", but more on that
below) to be loaded by the Chromecast device.

### Receiver

This is a living breathing URL (or at least something whose DNS can be resolved
by the Chromecast device) that will be loaded by a Chromecast device.

Not just any URL can be loaded though. You need to have the URL in question
[whitelisted by Google](https://developers.google.com/cast/whitelisting). Once
the URL has been approved you will be issued an `application ID`. That ID needs
to be included in a little bit of Javascript in both the "sender" and the
"receiver".

Additionally, you need to add the _domain_ for the whitelisted URL to a separate
whitelist in the Chromecast extension, but more on that below.

### Broker

This is a very simple [socket.io](http://socket.io) server that is designed to
relay messages between the various pieces.

### Client

This is a plain old webpage that can run in any web browser that retrieves
informations about, and relays commands to, one or more displays via the
"broker".

Specifically the "broker" _brokers_ traffic between one or more "client"
applications and a single "sender" which itself controls one or more
"receivers".

## Who's on first (in detail)

The point being:

* The "sender" application has super powers. It also needs to run on a machine
  with a running web browser and, more specifically, that web browser is the one
  with the super powers since it can send anything to any of the "displays". So
  that pretty much means a dedicated machine that sits quietly in a locked room.

* The "sender" is really just a plain vanilla webpage with some magic Google
  Javascript but that's it. There's no more way to talk _at_ this webpage
  running in a browser than there is any other webpage running in a browser. The
  webpage itself needs to connect to a bridging server or a... broker which will
  relay communications between the webpage and other applications.

* The "broker" then becomes where all of your control logic and restrictions
  (authentication, authorization, etc.) lives.

* It's not clear whether it is possible for a "receiver" to relay messages back
  to the "sender" because a) it's not possible or b) we just didn't figure out
  how to do this.

## Setup

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

### shared/globals.js

Make sure you copy the `shared/globals.js.example` file to `sender/globals.js`
and `receiver/globals.js` and update them with the relevant configs (like you
Chromecast app ID).

### sender/sender.html

This is the page you load in Chrome. It will trigger the "receiver" to be loaded
on one or more "devices". It also has its own simple form-based interface for
sending specific URLs or blobs of text to a display.

### receiver/receiver.html

This is the page that will be loaded by Chromecast device (which will have told
to load it by the "sender" (which probably is saying something like "Hey, we
have the same application ID, so why don't you load the URL that it's associated
with!"))

Here's the important bit: It's not really called "receiver" or
"receiver.html". It's called whatever the URL you whitelisted with Google and
there is no URL normalization.

For example if you told Google to whitelist `my-website.example.com/chrome` then
you need to make sure that your webserver doesn't do something clever like
automatically add a trailing slash (as in `my-website.example.com/chrome/`) to
that URL when something tries to load this. Apache does this.

If you're using Apache then you might consider adding a [ModRewrite rule]() like
this:

	RewriteEngine	On
	RewriteRule	^chrome/?$	receiver/receiver.html	[L]		

## Addressability

The other important thing to remember is that the "sender" and the "receiver"
need to be on the Internet. Or rather if you're going to horse around with DNS
for example in such as way as to make it seem like an actual domain name points
to your laptop for testing purposes.

This may seem obvious except for the part where I spent a couple hours thrashing
around before I realized that even if I could trick my browser into thinking the
"sender" was being served off my latop there was no (easy) way to trick the
"device" in to doing the same. The "device" kept looking for the "receiver" out
there on the Internet where it didn't exist yet because I was trying to serve it
off my latop.

The point being: It's all about domain names and URLs and the Chromecast device
assumes everything is live on an Internet it can talk to.

### Addressability (and MAMP and /etc/hosts)

For testing purposes we set up [MAMP](http://www.mamp.info/en/index.html) to
serve the "sender" application. The following is provided as-is as a kind of
reference implementation rather than something that is guaranteed to work on
your machine.

Add something like this to `/Applications/MAMP/conf/apache/extra/httpd-vhosts.conf`

	<VirtualHost *:80>
	    ServerAdmin webmaster@dummy-host.example.com
	    DocumentRoot "/Applications/MAMP/htdocs/receiver"
	    ServerName collection.cooperhewitt.org
	    # ErrorLog "logs/dummy-host.example.com-error_log"
	    # CustomLog "logs/dummy-host.example.com-access_log" common
	</VirtualHost>

Note that I have symlink-ed the `receiver` directory (in this repo)
in to `/Applications/MAMP/htdocs`.

Also note the `ServerName` directive which is
collection.cooperhewitt.org. As of this writing we're not actually
running any of this stuff on the production site but it's the host/URL
we got whitelisted so that means we also need to update...

To direct traffic to `collection.cooperhewitt.org` back to the local
machine (aka MAMP) I edited my `/etc/hosts` file as follows:

	127.0.0.1       collection.cooperhewitt.org

At this point it's also worth flushing your local DNS cache, like
this:

	$> dscacheutil -flushcache

See also
--

* https://developers.google.com/cast/reference/

* https://github.com/googlecast/cast-android-sample

