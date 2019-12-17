# cargo-gui
A browser interface for working through rustc errors and running cargo commands.

![See the repository for a screen shot](https://github.com/eignnx/cargo-gui/blob/master/test-screenshot.png)

## Instructions

### Install

Install `cargo-gui` from crates.io:

```shell
$ cargo install cargo-gui
```


### Start the Server

Next, go to the directory of one of your cargo projects and start the `cargo-gui` server:

```shell
$ cd path/to/my-cargo-project
$ cargo gui

Server is listening on: http://127.0.0.1:9345
```

### Opening the Dashboard

Now open that link in your web browser: [http://localhost:9345/](http://localhost:9345/)

### In the Dashboard

You can click the `Build`, and `Check` buttons to invoke the corresponding `cargo` commands (i.e. `Build` invokes `cargo build` in your project directory).


If building or checking your program results in compilation errors, they will be displayed in a paginated format below. You can used the pagination navbar to see the `Next`, `Previous`, `First` and `Last` compilation errors. You can also use the **left and right arrow keys** on your keyboard to go to the next and previous errors.

## Planned Features
- [x] Streaming input from `cargo`. Compiler messages and errors come in *asynchronously* as they are produced by the remote `cargo` command! (`v0.3.0`)
- [ ] Specialized display for `cargo test` commands.
- [ ] Cancellable commands via the `Cancel (^C)` button.
- [ ] Color themes (dark/light mode).
- [ ] Generalized `Run` and `Exec` commands. This is tricky because the user could run a command like `vim` which constantly "repaints" the terminal window and accepts user input.

## Contributing
Contributions are welcome! Please check out [CONTRIBUTING.md](https://github.com/eignnx/cargo-gui/blob/master/CONTRIBUTING.md) for instructions on how to get involved.
