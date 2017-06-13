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

    $ gulp babel
    $ gulp sass
    
You should now be ready to go! To serve, use

    $ gulp watch
    
Open a second terminal, and use 

    $ npm start
    
