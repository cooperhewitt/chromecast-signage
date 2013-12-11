Installing the Cast Sample App in Eclipse

The goal of this sample is to show developers how to use the Google Cast
technology, and not to demonstrate Android programming best practices.

For more information on Android best practices, please see
http://developer.android.com/training/index.html

Before you Start:

1. You should already have Eclipse set up with the Android SDK. If not, go to
http://developer.android.com/sdk/installing/index.html and follow the
instructions there.

2. You should have the Cast SDK and all necessary support libraries installed.
For instructions on installation, go to developers.google.com/cast, or see the
included INSTALL_CAST_ECLIPSE.txt.

3. You should also already have an app name and receiver URLs whitelisted,
so that your device knows where to find your receiver app. If you're not sure
how to do this, go to developers.google.com/cast/whitelisting for whitelisting
instructions.

Contents

A. Installing the Sample App
B. Casting to the Receiver
C. Common Errors

***

A. Installing the Sample App

This section describes how to set up the Cast Sample App as a project within
your Eclipse workspace.

1. In Eclipse, go to File->Import... and select Android->Existing Android Code
   into Workspace.
2. In the resulting Import Projects dialog, browse to the directory you
   unzipped the files into and set that as your root directory.
   OPTIONAL BUT RECOMMENDED:
      1. Set New Project Name to something that describes the project, such as
         "CastSampleApp".
      2. Check "Copy Projects into Workspace".
3. Hit Finish. The project you just created should show up in your workspace,
   with errors if you don't have the Cast SDK and support libraries configured.
   See developers.google.com/cast for up-to-date installation instructions.
4. If no errors pop up, the demo project is ready to be built.

***

B. Casting to the Receiver

This section describes how to set up the included receiver, so that you can
cast to it using your version of the Cast Sample App. You must already have
a whitelisted URL (your_domain.com/your_receiver_name.html) for a receiver, 
which you can replace with the Cast Sample App's receiver.

1. In the /receiver folder, you'll find receiver.html. Rename it to the name
of your own receiver, and upload it to your whitelisted URL.
2. In /res/values/strings.xml, you'll find an entry labeled app_name, with
the value "YOUR_APP_ID_HERE". Replace "YOUR_APP_ID_HERE" with your own App ID.
3. Run the app and select your Cast device. Your second screen should go dark
when the receiver loads. Once it does so, you can select a piece of media and
it will be cast to the second screen.

***

C. Common Errors

My receiver application doesn't show up on the second screen!
1. Make sure you changed the value of the app_name variable to your officially
whitelisted app id.
2. Make sure you uploaded the provided receiver.html to the URL associated with
your app, and that you renamed it (if necessary) to your own receiver.
3. After doing so, force close the current instance of your Cast Sample App, 
then compile and run again.

