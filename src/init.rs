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
        // Attempt to use `where` to locate `npm.cmd`.
        let where_path = r"C:\Windows\System32\where.exe";
        let path_to_npm = match Command::new(where_path).arg("npm").output() {
            Ok(ref output) => {
                let bytes = &output.stdout;
                let output = std::str::from_utf8(bytes).unwrap();
                output.lines().nth(1).unwrap().to_owned()
            }
            Err(_) => {
                // Allow the user to enter the path to their npm.cmd file if it cannot be located automatically.
                eprint!("Could not locate npm! Please enter the path to the `npm.cmd` file installed on your system: ");
                let mut buf = String::new();
                std::io::stdin()
                    .read_line(&mut buf)
                    .expect("stdin could not be read from");
                buf.trim().to_owned()
            }
        };

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
