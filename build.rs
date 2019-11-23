use std::process::Command;
use std::env;

fn main() {
    assert!(Command::new("npm")
        .arg("install")
        .current_dir("./public")
        .status()
        .expect("`npm install` will run successfully")
        .success());

    // Output the current working directory (the install location) and save it
    // to the CARGO_GUI_HOME environment variable for use during compilation.
    let cwd = env::current_dir().expect("cwd is accessable during build");
    println!("cargo:rustc-env=CARGO_GUI_HOME={}", cwd.display());
}