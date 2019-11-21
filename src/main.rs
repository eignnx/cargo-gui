use std::process::Command;
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

fn run_cargo_cmd(req: web::Json<CargoCmd>) -> impl Responder {
    let command = Command::new("cargo")
        .arg(&req.cmd)
        .args(&req.cargo_opts)
        .current_dir("/tmp/cargo-gui-test")
        .output()
        .expect("command is able to run");
    
    let to_string = |s| String::from_utf8(s).expect("utf-8 encoded text returned from command");
    let stdout = to_string(command.stdout);
    let stderr = to_string(command.stderr);

    
    let opts: String = req.cargo_opts.as_slice().join(" ");
    let cmd: String = format!("cargo {} {}", req.cmd, opts).trim().into();
    println!("ran command `{}`", cmd);
    println!("got stdout `{}`", stdout);
    println!("got stderr `{}`", stderr);

    serde_json::to_string(&CmdResponse {
        status: command.status.code().unwrap(),
        stdout,
        stderr,
    }).unwrap()
}

fn main() {
    println!("Your `cargo-gui` app is running at http://localhost:{}/site/index.html", PORT);

    #[rustfmt::skip]
    let app = || App::new()
        .service(fs::Files::new("/site", "./public").show_files_listing())
        .service(web::scope("/api")
            .service(web::resource("/cargo").route(web::post().to(run_cargo_cmd))))
        ;
    HttpServer::new(app)
        .bind(&format!("127.0.0.1:{}", PORT))
        .unwrap()
        .run()
        .unwrap();
}
