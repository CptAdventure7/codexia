use crate::features::event_sink::EventSink;
use notify::RecommendedWatcher;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;

pub struct WatchState {
    pub watchers: Arc<Mutex<HashMap<String, (RecommendedWatcher, usize)>>>,
}

impl WatchState {
    pub fn new() -> Self {
        Self {
            watchers: Arc::new(Mutex::new(HashMap::new())),
        }
    }
}

impl Default for WatchState {
    fn default() -> Self {
        Self::new()
    }
}

pub struct CodexEventSinkState {
    pub event_sink: Arc<dyn EventSink>,
}
