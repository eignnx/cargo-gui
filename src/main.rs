use std::process::Command;
use actix_files as fs;
use actix_web::{web, App, HttpServer, Responder};
use serde::Deserialize;

const PORT: u32 = 8080;

#[derive(Deserialize)]
struct CargoCmd {
    cmd: String,
    #[serde(rename = "cargoOpts")]
    cargo_opts: Vec<String>,
}

fn run_cargo_cmd(req: web::Json<CargoCmd>) -> impl Responder {
    let command = Command::new("cargo")
        .arg(&req.cmd)
        .args(&req.cargo_opts)
        .current_dir("/tmp/cargo-gui-test")
        .output()
        .expect("command is able to run");
    
    let stdout = command.stdout;
    let stderr = command.stderr;
    
    let tostr = |s| String::from_utf8(s).expect("utf-8 encoded text returned from command");

    let output = format!("{}\n\n{}", tostr(stdout), tostr(stderr));
    
    let opts: String = req.cargo_opts.as_slice().join(" ");
    let cmd: String = format!("cargo {} {}", req.cmd, opts).trim().into();
    println!("ran command `{}`", cmd);
    println!("got output `{}`", output);
    format!("{}", output)
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
