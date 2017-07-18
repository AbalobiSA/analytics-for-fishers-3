# Abalobi Fisher Analytics 3

The third iteration of the Fisher Analytics app.

> Note: This app is compiled to the www/ folder using gulp tasks. You will need
gulp and node-sass to work on the source files.

## Global dependencies

You will need to install these before you continue:

    $ npm install -g yarn
    $ npm install -g gulp
    $ npm install -g node-sass
    $ npm install -g ionic 
    $ npm install -g cordova

## Getting Started

Clone this repo.

    $ git clone REPO_URL
    $ cd REPO_URL
    $ bower install
    $ yarn
    
Create the dist files for the first time:

    $ gulp
    
You should now be ready to go! To serve, use

    $ gulp devwatch
    
Open a second terminal, and use 

    $ npm start
    
## Deploying on a mobile device

You will have to edit your `ionic.config.json`.

Change the `documentRoot: ` entry to `123documentRoot` so that it 
becomes invalid. This will ensure ionic will create a build of the app
from your www folder.

Then, do the following:

    $ gulp
    $ ionic cordova prepare
    
Now, open Android Studio, import the `platforms/android` folder as a 
gradle project, build & run on your device.
