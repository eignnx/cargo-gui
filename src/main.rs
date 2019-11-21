use std::process::Command;
use actix_files as fs;
use actix_web::{web, App, HttpServer, Responder};
use serde::Deserialize;

const PORT: u32 = 8080;

#[derive(Deserialize)]
struct Cmd {
    cmd: String,
}

fn run_cmd(req: web::Json<Cmd>) -> impl Responder {
    let output = String::from_utf8(Command::new("cargo")
        .arg("run")
        .current_dir("/tmp/cargo-gui-test")
        .output()
        .expect("command ran successfully")
        .stdout).expect("utf-8 encoded text returned from command");
        
    let resp = format!("ran command `{}`, got output `{}`", req.cmd, output);
    println!("{}", resp);
    resp
}

fn main() {
    println!("Your `cargo-gui` app is running at http://localhost:{}/site/index.html", PORT);

    #[rustfmt::skip]
    let app = || App::new()
        .service(fs::Files::new("/site", "./public").show_files_listing())
        .service(web::resource("/api").route(web::post().to(run_cmd)))
        ;
    HttpServer::new(app)
        .bind(&format!("127.0.0.1:{}", PORT))
        .unwrap()
        .run()
        .unwrap();
}
