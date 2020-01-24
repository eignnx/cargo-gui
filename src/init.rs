use std::path::{Path, PathBuf};
use std::process::Command;

pub fn init_js_app(home_dir: impl AsRef<Path>) {
    let wd = home_dir.as_ref().join("frontend");
    if cfg!(not(target_os = "windows")) {
        not_windows_init(wd);
    } else if cfg!(target_os = "windows") {
        windows_init(wd);
    }
}

fn not_windows_init(wd: PathBuf) {
    // First install all required dependencies.
    cmd(&["npm", "install"], &wd);

    // Then build the Vue.js frontend application.
    cmd(&["npm", "run", "build"], &wd);
}

fn windows_init(wd: PathBuf) {
    // Attempt to use `where` to locate `npm.cmd`.
    let where_path = r"C:\Windows\System32\where.exe";
    let path_to_npm = match Command::new(where_path).arg("npm").output() {
        Ok(ref output) => {
            let bytes = &output.stdout;
            let output = std::str::from_utf8(bytes).unwrap();
            output
                .lines()
                .filter(|line| line.ends_with(".cmd"))
                .nth(0)
                .expect("found a result for `where npm` that ends in `.cmd`")
                .to_owned()
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

    // let path_to_npm = String::from(r"C:\Users\gideo\AppData\Roaming\npm");

    // First install all required dependencies.
    cmd(&[path_to_npm.as_ref(), "install"], &wd);

    // Then build the Vue.js frontend application.
    cmd(&[path_to_npm.as_ref(), "run", "build"], &wd);
}

fn cmd(cmd_and_args: &[&str], wd: impl AsRef<Path>) {
    let cmd_name = cmd_and_args.join(" ").to_owned();
    let (first, rest) = cmd_and_args.split_at(1);
    let first = first[0];

    let status = Command::new(first)
        .args(rest)
        .current_dir(wd)
        .status()
        .expect(&format!("`{}` will begin running successfully", cmd_name));

    if !status.success() {
        panic!("`{}` exited with an error!", cmd_name);
    }
}
