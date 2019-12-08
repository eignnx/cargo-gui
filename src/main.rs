use std::env;
use std::path::{Path, PathBuf};
use std::pin::Pin;
use std::process::{Command, Stdio};

use async_std::prelude::*;
use async_std::stream::{Stream, StreamExt};
use async_std::sync::{Arc, Mutex};
use serde::{self, Deserialize, Serialize};
use tide_naive_static_files::{serve_static_files, StaticRootDir};

const PORT: u16 = 9345;

type IoStream = Pin<Box<dyn Stream<Item = String> + Send + Sync>>;

struct AppState {
    home_dir: PathBuf,
    cmd_stdout: Arc<Mutex<Option<IoStream>>>,
    cmd_stderr: Arc<Mutex<Option<IoStream>>>,
}

impl AppState {
    fn new(home_dir: PathBuf) -> Self {
        Self {
            home_dir,
            cmd_stdout: Arc::new(Mutex::new(None)),
            cmd_stderr: Arc::new(Mutex::new(None)),
        }
    }
}

impl StaticRootDir for AppState {
    fn root_dir(&self) -> &Path {
        &self.home_dir
    }
}

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

type Req = tide::Request<AppState>;

async fn get_project_config(_: Req) -> String {
    println!("project config requested");
    let project_working_dir = env::current_dir().expect("pwd is accessible");
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

fn read_into_lines_stream(
    stdio: impl std::io::Read + Send + Sync + 'static,
) -> impl Stream<Item = String> {
    let reader = std::io::BufReader::new(stdio);
    use std::io::BufRead;
    let stream = async_std::stream::from_iter(reader.lines());
    let stream = stream.map(|res| res.unwrap());
    stream
}

async fn register_cmd_stdio(
    cmd_stream: Arc<Mutex<Option<IoStream>>>,
    stdio: impl std::io::Read + Send + Sync + 'static,
) {
    let stream = read_into_lines_stream(stdio);
    let mut guard = cmd_stream.lock().await;
    *guard = Some(Box::pin(stream));
}

async fn start_running_cargo_cmd(mut req: Req) -> String {
    let cargo_cmd: CargoCmd = req.body_json().await.unwrap();
    let child = Command::new("cargo")
        .arg(&cargo_cmd.cmd)
        .args(&cargo_cmd.cargo_opts)
        // Output JSON messages that have retain their ansi color information.
        .args(&["--message-format", "json-diagnostic-rendered-ansi"])
        .current_dir(env::current_dir().unwrap())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .unwrap();

    let cmd_stdout = req.state().cmd_stdout.clone();
    register_cmd_stdio(cmd_stdout, child.stdout.unwrap()).await;
    let cmd_stderr = req.state().cmd_stderr.clone();
    register_cmd_stdio(cmd_stderr, child.stderr.unwrap()).await;

    serde_json::to_string(&CmdResponse {
        status: 101,
        stdout: "{\"msg\": \"coming soon dawg\"}".into(),
        stderr: "{\"msg\": \"coming soon dawg\"}".into(),
    })
    .unwrap()
}

// async fn run_cargo_cmd(mut req: Req) -> String {
//     let cargo_cmd: CargoCmd = req.body_json().await.unwrap();
//     let command = Command::new("cargo")
//         .arg(&cargo_cmd.cmd)
//         .args(&cargo_cmd.cargo_opts)
//         // Output JSON messages that have retain their ansi color information.
//         .args(&["--message-format", "json-diagnostic-rendered-ansi"])
//         .current_dir(env::current_dir().unwrap())
//         .output()
//         .expect("command is able to run");

//     let stdout = String::from_utf8_lossy(&command.stdout).to_string();
//     let stderr = String::from_utf8_lossy(&command.stderr).to_string();
//     let opts: String = cargo_cmd.cargo_opts.as_slice().join(" ");
//     let cmd: String = format!("cargo {} {}", cargo_cmd.cmd, opts).trim().into();

//     println!("ran command `{}`", cmd);
//     println!("got stdout `{}`", stdout);
//     println!("got stderr `{}`", stderr);

//     let status = command.status.code().unwrap();
//     serde_json::to_string(&CmdResponse {
//         status,
//         stdout,
//         stderr,
//     })
//     .unwrap()
// }

fn init_js_app(home_dir: impl AsRef<Path>) {
    let status = Command::new("npm")
        .arg("install")
        .current_dir(home_dir.as_ref().join("public"))
        .status()
        .expect("`npm install` will run successfully");

    if !status.success() {
        panic!("`npm install` failed to run!");
    }
}

#[derive(Serialize)]
enum LineMsg {
    Line(String),
    End,
}

impl tide::IntoResponse for LineMsg {
    fn into_response(self) -> tide::Response {
        tide::Response::new(200).body_json(&self).unwrap()
    }
}

use std::ops::DerefMut;

async fn get_line(mtx: Arc<Mutex<Option<IoStream>>>) -> LineMsg {
    let mut guard = mtx.lock().await;
    if let Some(stream) = guard.deref_mut() {
        match stream.next().await {
            Some(line) => LineMsg::Line(line),
            None => {
                *guard = None;
                LineMsg::End
            }
        }
    } else {
        LineMsg::End
    }
}

async fn get_stdout_line(req: Req) -> LineMsg {
    let arc = req.state().cmd_stdout.clone();
    get_line(arc).await
}

async fn get_stderr_line(req: Req) -> LineMsg {
    let arc = req.state().cmd_stdout.clone();
    get_line(arc).await
}

#[async_std::main]
async fn main() {
    // This environment variable is set up during compilation by `build.rs`.
    let cargo_gui_home = env!("CARGO_GUI_HOME");

    init_js_app(&cargo_gui_home);

    let state = AppState::new(PathBuf::from(cargo_gui_home).join("public").into());
    let mut app = tide::with_state(state);
    app.at("/api/cargo").post(start_running_cargo_cmd);
    app.at("/api/project_config").get(get_project_config);
    app.at("/api/stdout_line").get(get_stdout_line);
    app.at("/api/stderr_line").get(get_stderr_line);
    app.at("/").get(tide::redirect("/index.html"));
    app.at("/*")
        .get(|req| async { serve_static_files(req).await.unwrap() });
    app.listen(format!("localhost:{}", PORT)).await.unwrap();
}
