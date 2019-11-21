use std::process::Command;
use std::env;
use actix_files as fs;
use actix_web::{web, App, HttpServer, Responder};
use serde::{Deserialize, Serialize};

const PORT: u32 = 8080;

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
    path: String,
}

fn get_project_config() -> impl Responder {
    println!("project config requested");
    let cwd = env::current_dir()
        .expect("pwd is accessable")
        .to_str()
        .expect("pwd is a valid string")
        .into();

    serde_json::to_string(&ProjectConfig {
        path: cwd,
    }).unwrap()
}

fn run_cargo_cmd(req: web::Json<CargoCmd>) -> impl Responder {
    let command = Command::new("cargo")
        .arg(&req.cmd)
        .args(&req.cargo_opts)
        .arg("--message-format").arg("json")
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

fn main() {
    println!("Your `cargo-gui` app is running at http://localhost:{}/site/index.html", PORT);

    let cargo_gui_home = env::var("CARGO_GUI_HOME").expect("CARGO_GUI_HOME env var was set");

    #[rustfmt::skip]
    let app = move || {
        App::new()
            .service(fs::Files::new("/site", format!("{}/public", cargo_gui_home)).show_files_listing())
            .service(web::scope("/api")
                .route("/cargo", web::post().to(run_cargo_cmd))
                .route("/project_config", web::get().to(get_project_config)))
    };

    HttpServer::new(app)
        .bind(&format!("127.0.0.1:{}", PORT))
        .unwrap()
        .run()
        .unwrap();
}
