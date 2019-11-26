# cargo-gui
A browser interface for working through rustc errors and running cargo commands.

![sample image](https://github.com/eignnx/cargo-gui/blob/master/test-screenshot.png)

## Usage

### Install

Install `cargo-gui` from crates.io:

```shell
$ cargo install cargo-gui
```

#### [Development Mode]

If you want to contribute to the project, you'll want to install from the github repository instead:

```shell
git clone https://github.com/eignnx/cargo-gui.git
```

### Start the Server

Next, go to your cargo project directory and start the `cargo-gui` server:

```shell
$ cd path/to/my-cargo-project
$ cargo gui

  Your `cargo-gui` app is running at http://localhost:9345/

```

#### [Development Mode]

If you want to contribute to the project, and have installed from the github repository, start the server like this instead:

```shell
$ cd path/to/my-cargo-project
$ cargo run --manifest-path /path/to/cargo-gui/Cargo.toml

  Your `cargo-gui` app is running at http://localhost:9345/

```

### Opening the Dashboard

Now open that link in your web browser: [http://localhost:9345/](http://localhost:9345/)

### In the Dashboard

You can click the `Run`, `Build`, `Test`, `Check` buttons to invoke the corresponding `cargo` commands (i.e. `Run` invokes `cargo run` in your project directory).

**NOTE:** Currently, `Run` doesn't support streaming output from your executables! If you're trying to run a never-ending task (like a server), you will just never get a response back unless there's an error. This is because `cargo-gui` is waiting for your program to finish before showing you the output. See [this github issue](https://github.com/eignnx/cargo-gui/issues/2) if you have suggestions on how to fix this!

If building, testing, or checking your program results in compilation errors, they will be displayed in a paginated format below. You can used the pagination navbar to see the `Next`, `Previous`, `First` and `Last` compilation errors. You can also use the left and right arrow keys on your keyboard to go to the next and previous errors.

## Contributing
Contributions are welcome! Please check out [CONTRIBUTING.md](https://github.com/eignnx/cargo-gui/blob/master/CONTRIBUTING.md) for instructions on how to get involved.