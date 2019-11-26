use std::process::Command;
use std::env;
use actix_files as fs;
use actix_web::{web, App, HttpServer, Responder};
use serde::{Deserialize, Serialize};

const PORT: u32 = 9345;

#[derive(Deserialize)]
struct CargoCmd {
    cmd: String,
    #[serde(rename = "cargoOpts")]
    cargo_opts: Vec<String>,
}

#[derive(Serialize)]
struct CmdResponse {
    status: i32,
    stdout: String,
    stderr: String,
}

#[derive(Serialize)]
struct ProjectConfig {
    title: String,
    path: String,
}

fn get_project_config() -> impl Responder {
    println!("project config requested");
    let project_working_dir = env::current_dir().expect("pwd is accessable");
    let path = project_working_dir
        .to_str()
        .expect("cwd is a valid str")
        .into();

    // TODO: Use the Cargo.toml file to get the actual project title.
    let title = project_working_dir
        .file_name()
        .map(|os_str| os_str.to_str().expect("file name is a valid str"))
        .unwrap_or("/")
        .into();

    serde_json::to_string(&ProjectConfig { title, path }).unwrap()
}

fn run_cargo_cmd(req: web::Json<CargoCmd>) -> impl Responder {
    let command = Command::new("cargo")
        .arg(&req.cmd)
        .args(&req.cargo_opts)
        // Output JSON messages that have retain their ansi color information.
        .args(&["--message-format", "json-diagnostic-rendered-ansi"])
        .current_dir(env::current_dir().unwrap())
        .output()
        .expect("command is able to run");
    
    let stdout = String::from_utf8_lossy(&command.stdout).to_string();
    let stderr = String::from_utf8_lossy(&command.stderr).to_string();
    
    let opts: String = req.cargo_opts.as_slice().join(" ");
    let cmd: String = format!("cargo {} {}", req.cmd, opts).trim().into();
    println!("ran command `{}`", cmd);
    println!("got stdout `{}`", stdout);
    println!("got stderr `{}`", stderr);

    let status = command.status.code().unwrap();
    serde_json::to_string(&CmdResponse { status, stdout, stderr }).unwrap()
}

fn init_js_app(home: impl AsRef<str>) {
    let home = home.as_ref();
    let status = Command::new("npm")
        .arg("install")
        .current_dir(format!("{}/public", home))
        .status()
        .expect("`npm install` will run successfully");

    if !status.success() {
        panic!("`npm install` failed to run!");
    }
}

fn index() -> actix_web::Result<fs::NamedFile> {
    let path = format!("{}/public/index.html", env!("CARGO_GUI_HOME"));
    Ok(fs::NamedFile::open(path)?)
}

fn main() {
    // This environment variable is set up during compilation by `build.rs`.
    let cargo_gui_home = env!("CARGO_GUI_HOME");

    init_js_app(&cargo_gui_home);
    
    println!("");
    println!("  Your `cargo-gui` dashboard is running at http://localhost:{}/", PORT);
    println!("");

    #[rustfmt::skip]
    let app = move || {
        App::new()
            .service(web::scope("/api")
                .route("/cargo", web::post().to(run_cargo_cmd))
                .route("/project_config", web::get().to(get_project_config)))
            .route("/", web::get().to(index))
            .service(fs::Files::new("/", format!("{}/public", cargo_gui_home)).show_files_listing())
    };

    HttpServer::new(app)
        .bind(&format!("127.0.0.1:{}", PORT))
        .unwrap()
        .run()
        .unwrap();
}
