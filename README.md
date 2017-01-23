# Project name

This is a Grow SDK proof of concept specifically illustrating how Grow handles translations.

## Prerequisites

At a minimum, you will need the following tools installed:

1. [Git](http://git-scm.com/)
2. [Grow](https://grow.io)

If you do not have Grow, you can install it using:

```
curl https://install.growsdk.org | bash
```

## Running the development server

Prior to starting the development server, you may have to install dependencies used by your project. The `grow install` command walks you through this and tries to set up your environment for you.

Make sure the required dependencies are installed:

```
bower install
npm install
```

The `grow run` command starts your development server. You can make changes to your project files and refresh to see them reflected immediately.

```
grow install
grow run
```

## Building

You can use the `grow build` command to build your whole site to the `build` directory. This is a good way to test and verify the generated code.

```
grow build
```

## Staging

Once you are ready to share your changes with your team, you can stage your workspace to an access-controlled web server. Running the below command will build your site and deploy it, and then provide you with a link to the staging environment.

```
grow stage
```

## Localization

Any content within the yaml files you'd like to be tagged for translation needs the key to be followed by `@`. For example:

```
headline@: Headline that will be translated
```

When referencing that content in the HTML, it needs to be appropriately tagged for translation (if the content isn't wrapped with the `_()`, it will not be translated):

```
{{_(doc.headline)}}
```

To extract strings tagged for translation:

```
grow extract
```

To import translations:

```
grow import_translations --locale=LOCALE --source /path/to/source/messages.po
```
