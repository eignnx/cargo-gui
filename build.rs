use std::process::Command;

fn main() {
    assert!(Command::new("npm")
        .arg("install")
        .current_dir("./public")
        .status()
        .expect("`npm install` will run successfully")
        .success());
}