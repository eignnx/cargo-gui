use std::env;

fn main() {
    // Output the current working directory (the install location) and save it
    // to the CARGO_GUI_HOME environment variable for use during compilation.
    let cwd = env::current_dir().expect("cwd is accessable during build");
    println!("cargo:rustc-env=CARGO_GUI_HOME={}", cwd.display());
}
