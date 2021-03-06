use std::env;
use std::path::PathBuf;
use std::process::{Command, Stdio};

use async_std::stream::{Stream, StreamExt};
use async_std::sync::{Arc, Mutex};
use async_std::task;
use serde::{self, Deserialize, Serialize};
use tide_naive_static_files::serve_static_files;

mod app;
mod init;

use app::{AppState, CmdStatus, IoStream};

const PORT: u16 = 9345;

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct CargoCmd {
    cmd: String,
    cargo_opts: Vec<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct CmdResponse {
    status: i32,
    stdout: String,
    stderr: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ProjectConfig {
    title: String,
    path: String,
}

type Req = tide::Request<AppState>;

async fn get_project_config(_: Req) -> String {
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

async fn start_running_cargo_cmd(mut req: Req) -> tide::Response {
    {
        let state = req.state();
        state.reset_cmd().await;
    }

    let cargo_cmd: CargoCmd = req.body_json().await.unwrap();
    let mut child = Command::new("cargo")
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
    register_cmd_stdio(cmd_stdout, child.stdout.take().unwrap()).await;
    let cmd_stderr = req.state().cmd_stderr.clone();
    register_cmd_stdio(cmd_stderr, child.stderr.take().unwrap()).await;

    // Spawn a new thread (1) and a new task (2) to wait for the process to
    // finish (1) and for the `AppState.cmd_status` mutex to lock (2). We need
    // to do these asynchronously so that this Endpoint function returns
    // immediately.
    task::spawn(async move {
        let status = task::spawn_blocking(move || {
            let handle = child.wait_with_output().unwrap();
            handle.status.code().unwrap()
        })
        .await;

        let mtx = &req.state().cmd_status;
        let mut guard = mtx.lock().await;
        eprintln!("GOT CMD STATUS!!! Setting...");
        *guard = Some(CmdStatus(status));
    });

    tide::Response::new(200)
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
enum LineMsg {
    Line(String),
    End,
}

impl tide::IntoResponse for LineMsg {
    fn into_response(self) -> tide::Response {
        tide::Response::new(200).body_json(&self).unwrap()
    }
}

async fn get_line(mtx: Arc<Mutex<Option<IoStream>>>) -> LineMsg {
    let mut guard = mtx.lock().await;
    use std::ops::DerefMut;
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

fn log_line_msg(line_msg: LineMsg, log_msg: &str) -> LineMsg {
    match line_msg {
        LineMsg::End => {
            eprintln!("{}", log_msg);
            LineMsg::End
        }
        x => x,
    }
}

async fn get_stdout_line(req: Req) -> LineMsg {
    let arc = req.state().cmd_stdout.clone();
    let x = get_line(arc).await;
    log_line_msg(x, "END OF stdout LINES")
}

async fn get_stderr_line(req: Req) -> LineMsg {
    let arc = req.state().cmd_stderr.clone();
    let x = get_line(arc).await;
    log_line_msg(x, "END OF stderr LINES")
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
enum PollCmdStatus {
    Ready(CmdStatus),
    Pending,
}

impl tide::IntoResponse for PollCmdStatus {
    fn into_response(self) -> tide::Response {
        tide::Response::new(200).body_json(&self).unwrap()
    }
}

async fn get_cmd_status(req: Req) -> PollCmdStatus {
    eprintln!("CMD STATUS REQUESTED");
    let state = req.state();
    let guard = state.cmd_status.lock().await;
    if let Some(&status) = guard.as_ref() {
        PollCmdStatus::Ready(status)
    } else {
        PollCmdStatus::Pending
    }
}

#[async_std::main]
async fn main() {
    // This environment variable is set up during compilation by `build.rs`.
    let cargo_gui_home = env!("CARGO_GUI_HOME");

    init::init_js_app(&cargo_gui_home);

    let static_root = PathBuf::from(cargo_gui_home)
        .join("frontend")
        .join("dist")
        .into();
    let state = AppState::new(static_root);
    let mut app = tide::with_state(state);
    app.at("/api/cargo").post(start_running_cargo_cmd);
    app.at("/api/project_config").get(get_project_config);
    app.at("/api/stdout_line").get(get_stdout_line);
    app.at("/api/stderr_line").get(get_stderr_line);
    app.at("/api/cmd_status").get(get_cmd_status);
    app.at("/").get(tide::redirect("/index.html"));
    app.at("/*path")
        .get(|req| async { serve_static_files(req).await.unwrap() });
    app.listen(format!("localhost:{}", PORT)).await.unwrap();
}
