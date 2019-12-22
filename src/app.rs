use std::path::{Path, PathBuf};
use std::pin::Pin;

use async_std::stream::Stream;
use async_std::sync::{Arc, Mutex};
use serde::Serialize;
use tide_naive_static_files::StaticRootDir;

pub type IoStream = Pin<Box<dyn Stream<Item = String> + Send + Sync>>;

pub struct AppState {
    home_dir: PathBuf,
    pub cmd_stdout: Arc<Mutex<Option<IoStream>>>,
    pub cmd_stderr: Arc<Mutex<Option<IoStream>>>,
    pub cmd_status: Arc<Mutex<Option<CmdStatus>>>,
}

impl AppState {
    pub fn new(home_dir: PathBuf) -> Self {
        Self {
            home_dir,
            cmd_stdout: Arc::new(Mutex::new(None)),
            cmd_stderr: Arc::new(Mutex::new(None)),
            cmd_status: Arc::new(Mutex::new(None)),
        }
    }

    // TODO: analyse for potential deadlock.
    pub async fn reset_cmd(&self) {
        {
            let mut guard = self.cmd_stdout.lock().await;
            *guard = None;
        }
        {
            let mut guard = self.cmd_stderr.lock().await;
            *guard = None;
        }
        {
            let mut guard = self.cmd_status.lock().await;
            *guard = None;
        }
    }
}

impl StaticRootDir for AppState {
    fn root_dir(&self) -> &Path {
        &self.home_dir
    }
}

#[derive(Serialize, Debug, Clone, Copy)]
pub struct CmdStatus(pub i32);

impl tide::IntoResponse for CmdStatus {
    fn into_response(self) -> tide::Response {
        tide::Response::new(200).body_json(&self).unwrap()
    }
}
