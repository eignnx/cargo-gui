# cargo-gui
A browser interface for working through rustc errors and running cargo commands.

**SUPER WORK IN PROGRESS RITE NWO!**

## Running

Start up the server:

```shell
$ cd my-cargo-project # go to your project directory
$ CARGO_GUI_HOME=/path/to/cargo-gui cargo run --manifest-path /path/to/cargo-gui/Cargo.toml
Your `cargo-gui` app is running at http://localhost:8080
```

Now go to [that link](http://localhost:8080)!

(Yeah, I know the ENV variable and `--manifest-path` thing are ugly. We'll have to put up with it until there's an actual way to install `cargo-gui`.)