use actix_files as fs;
use actix_web::{App, HttpServer};

const PORT: u32 = 8080;

fn main() {
    println!("Your `cargo-gui` app is running at http://localhost:{}", PORT);

    #[rustfmt::skip]
    let app = || App::new().service(fs::Files::new("/", "./public").show_files_listing());
    HttpServer::new(app)
        .bind("127.0.0.1:8088")
        .unwrap()
        .run()
        .unwrap();
}
