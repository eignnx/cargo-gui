use std::fs::canonicalize;
use std::path::Path;
use std::process::Command;

pub fn init_js_app(home_dir: impl AsRef<Path>) {
    let wd = canonicalize(home_dir.as_ref().join("public")).unwrap();
    if cfg!(not(target_os = "windows")) {
        let status = Command::new("npm")
            .arg("install")
            .current_dir(wd)
            .status()
            .expect("`npm install` will run successfully");

        if !status.success() {
            panic!("`npm install` failed to run!");
        }
    } else if cfg!(target_os = "windows") {
        let output = Command::new(r"C:\Windows\System32\where.exe")
            .arg("npm")
            .output()
            .expect("`where npm` ran successfully");

        let output = std::str::from_utf8(&output.stdout).unwrap();
        let path_to_npm = output.lines().nth(1).unwrap();

        let status = Command::new(path_to_npm)
            .arg("install")
            .current_dir(wd)
            .status()
            .expect("`npm install` will run successfully");

        if !status.success() {
            panic!("`npm install` failed to run!");
        }
    }
}
