# How to Contribute

If you'd like to contribute, please open an issue with a description of the feature you'd like to add/propose OR comment on a current issue and let me know you'd like to work on it. Please don't just open a pull request with your changes without checking in with me first. This ensures someone else isn't already working on the same task.

## Code of Conduct
Please note that this project has a code of conduct that you must adhere to if you want to contribute.

## TL;DR
If you don't find this document very clear, but are still interested in helping out, please reach out! You can open an issue [by clicking here](https://github.com/eignnx/cargo-gui/issues/new) asking how to get involved.

# Setting Up Development Environment

If you want to contribute to the project, you'll want to download the project from the GitHub repository and be able to run that development version rather than the  `cargo gui` version that's on crates.io.


## Clone the Repository

First get the source code from GitHub:

### Linux / Windows 10

```shell
$ git clone https://github.com/eignnx/cargo-gui.git
```

## Install Web App Dependencies

First, you'll want to run `npm install` inside the `cargo-gui/frontend` directory to install all dependencies. This only needs to be done when you first install the project or when a new npm dependency is added.

### Linux / Windows 10

```shell
$ cd frontend # Ensure you're in the `cargo-gui/frontend` directory.
$ npm install
```

## Building the Vue App (for front end devs only)

Next, if you will be editing the frontend application (anything located inside the `cargo-gui/frontend` directory) you'll want to run the build command every time you make a change. Do this by either:
 - restarting the server after every change (kinda annoying)
 - running the `npm run build -- --watch` command so that the frontend source is constantly recompiled whenever it changes. This command will need to be run in its own terminal window.

### Linux / Windows 10

To run the `--watch` command:

```shell
$ # From a new terminal window
$ # From inside `cargo-gui/frontend`
$ npm run build -- --watch # If editing `cargo-gui/frontend/src`
```

## Save Working Directory

Save the path to the `cargo-gui/Cargo.toml` file. This is needed to—from a different directory—run the development copy you just downloaded (as opposed to the `cargo gui` command you may have installed from crates.io).

### Linux

```shell
$ cd cargo-gui
$ # Save the manifest file's path
$ CARGO_GUI_DEV=`pwd`/Cargo.toml
```

### Windows 10

```powershell
> cd cargo-gui
> # Save the manifest file's path
> set CARGO_GUI_DEV=%cd%/Cargo.toml
```

## Start the Server

Next, go to the directory of some cargo project and start the `cargo-gui` server:

### Linux

```shell
$ cd path/to/my-cargo-project
$ cargo run --manifest-path $CARGO_GUI_DEV

Server is listening on: http://127.0.0.1:9345
```

### Windows 10

```powershell
> cd path\to\my-cargo-project
> cargo run --manifest-path %CARGO_GUI_DEV%

Server is listening on: http://[::1]:9345
```

## Open the Dashboard

Now open that link in your web browser: [http://localhost:9345/](http://localhost:9345/)

