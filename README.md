# eslint-formatter-simple

##### Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Install](#install)
- [How To Use](#how-to-use)
- [Getting Exit Error](#getting-exit-error)
- [Miscellaneous](#miscellaneous)
- [Contributing](#contributing)
- [License](#license)

<a name="overview"></a>

### Overview

A simple ESLint formatter. Formats ESLint results in a simple, human-readable manner.

- Default ESLint output:

<img src="/src/assets/img/example_default_output.png" width="65%">

- `eslint-formatter-simple` output:

<img src="/src/assets/img/example_formatted_output_normal.png" width="65%">

- `eslint-formatter-simple` output (no verbose via environment variable: `ESLINT_CFS_VERBOSE=false`):

<img src="/src/assets/img/example_formatted_output_no_verbose.png" width="65%">

<a name="features"></a>

### Features

- Warnings always listed before errors.
- Warnings grouped with other warnings. Errors with errors.
- Fixable issues and files containing fixable issues are highlighted green.
- Prints a final output tree showing files with issues.
  - Disable with environment variable `ESLINT_CFS_VERBOSE=false`.

<a name="install"></a>

### Install

```shell
# npm
npm install eslint-formatter-simple --save-dev

# yarn
yarn add eslint-formatter-simple --dev
```

<a name="how-to-use"></a>

### How To Use

Via CLI:

```shell
$ eslint --format="simple" file.js

# Disable verbose output:
$ ESLINT_CFS_VERBOSE=false eslint --format="simple" file.js
```

With webpack via [eslint-loader](https://github.com/webpack-contrib/eslint-loader):

```js
module.exports = {
  entry: "...",
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: "eslint-loader",
            exclude: /node_modules/,
            options: {
              formatter: require("eslint-formatter-simple")
            }
          }
        ]
      }
    ]
  }
};
```

<a name="getting-exit-error"></a>

### Getting Exit Error

If getting an error like the following when running as a npm/yarn script:

```shell
error Command failed with exit code 1.
```

Check the following `eslint` issue [here](https://github.com/eslint/eslint/issues/2409). The [solution](https://github.com/eslint/eslint/issues/2409#issuecomment-103768546) is to add the following to the end of the script.

```json5
{
  scripts: {
    lint: "eslint ...; exit 0"
  }
}
```

<a name="miscellaneous"></a>

### Miscellaneous

- Made using Node.js `v8.14.0` on a Linux machine running `Ubuntu 16.04.5 LTS`.

<a name="contributing"></a>

### Contributing

Contributions are welcome! Found a bug, feel like documentation is lacking/confusing and needs an update, have performance/feature suggestions or simply found a typo? Let me know! :)

See how to contribute [here](/CONTRIBUTING.md).

<a name="license"></a>

### License

This project uses the [MIT License](/LICENSE.txt).
