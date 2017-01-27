[![Left Field Labs website](http://www.leftfieldlabs.com/assets/images/logo-main.png)](http://www.leftfieldlabs.com)

# Grow Localization POC and Process Workflow

This is a Grow SDK proof of concept specifically illustrating how Grow handles localization.


## Prerequisites

At a minimum, you will need the following tools installed:

1. [Git](http://git-scm.com)
2. [Grow](https://grow.io)
3. [Homebrew](http://brew.sh)
4. [Node.js](https://nodejs.org)  
  
### Git install
If Git isn't already installed on your system, you may visit:  
[Git download page](https://git-scm.com/download)


### Homebrew
Homebrew is a package manager for macOS. We'll use it to install Node.js and keep it up to date. Please enter the following in the terminal:

```sh
$ /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

### Node.js install
We use Node.js to run various project build tasks, install dependencies, and supplemental utilities. You may install Node.js by downloading an installer or by using a binaries to compile it yourself. Visit their download page and choose your preferred method or simply install using Homebrew:  

#### Method 1: Homebrew (leave off -g flag if you do not want to install globally, globally recommended for project-to-project convenience)
```sh
$ brew install node -g
```  
  
#### Method 2: Installer or by using a binaries
[Node.js download page](https://nodejs.org/en/download)


### Grow install
We use Grow to generate static web pages based on the built in [templating engine](https://grow.io/docs/templates/) and configuration files (such as YAML). Grow also provides a convenient localization solution at it's core. To install Grow, you can install by entering the following into your terminal:
```sh
$ curl https://install.growsdk.org | bash
```

Or by using:
```sh
$ pip install grow
```  

## Install required dependencies  

Prior to starting the development server or running the project, install dependencies used by the project. The `grow install` command walks you through this and tries to set up your environment for you.

Run the following commands in terminal:
```sh
$ npm install
$ node_modules/bower/bin/bower install
```

## Running the development server

The `grow run` command starts your development server. You can make changes to your project files and refresh to see them reflected immediately.
```sh
$ grow install
$ grow run
```
*Note: If `grow install` does not work or throws an error stating it's not found/installed, restart your computer or your IDE.*
## Building

You can use the `grow build` command to build your whole site to the `build` directory. This is a good way to test and verify the generated code.
```sh
$ grow build
```

## Staging

Once you are ready to share your changes with your team, you can stage your workspace to an access-controlled web server. Running the below command will build your site and deploy it, and then provide you with a link to the staging environment.
```sh
$ grow stage
```

## Localization

Any content within the yaml files you'd like to be tagged for translation needs the key to be followed by `@`. For example:

```sh
$ headline@: Headline that will be translated
```

When referencing that content in the HTML, it needs to be appropriately tagged for translation (if the content isn't wrapped with the `_()`, it will not be translated):
```
{{_(doc.headline)}}
```

To extract strings tagged for translation:
```sh
$ grow extract
```

To import translations:
```sh
$ grow import_translations --locale=LOCALE --source /path/to/source/messages.po
```  
In this example, try importing the Spanish translations: 
```sh
$ grow import_translations --locale=es_ES --source translations/es_ES/LC_MESSAGES/messages.po
```  