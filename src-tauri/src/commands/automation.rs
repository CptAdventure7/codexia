use crate::features::automation::{self, AutomationRunRecord, AutomationSchedule, AutomationTask};
use crate::cc::CCState;
use crate::codex::AppState;
use crate::state::CodexEventSinkState;
use std::sync::Arc;
use tauri::State;

async fn ensure_runtime_initialized(
    app_state: &State<'_, AppState>,
    cc_state: &State<'_, CCState>,
    event_sink_state: &State<'_, CodexEventSinkState>,
) -> Result<(), String> {
    crate::features::automation::initialize_automation_runtime(
        Some(app_state.codex.clone()),
        cc_state.inner().clone(),
        Arc::clone(&event_sink_state.event_sink),
    )
    .await
}

#[tauri::command]
pub async fn list_automations(
    state: State<'_, AppState>,
    cc_state: State<'_, CCState>,
    event_sink_state: State<'_, CodexEventSinkState>,
) -> Result<Vec<AutomationTask>, String> {
    ensure_runtime_initialized(&state, &cc_state, &event_sink_state).await?;
    automation::list_automations(Some(state.codex.clone()), Some(cc_state.inner().clone())).await
}

#[tauri::command]
pub async fn list_automation_runs(
    task_id: Option<String>,
    limit: Option<u32>,
) -> Result<Vec<AutomationRunRecord>, String> {
    automation::list_automation_runs(task_id, limit).await
}

#[tauri::command]
pub async fn create_automation(
    name: String,
    projects: Vec<String>,
    prompt: String,
    schedule: AutomationSchedule,
    agent: Option<String>,
    model_provider: Option<String>,
    model: Option<String>,
    state: State<'_, AppState>,
    cc_state: State<'_, CCState>,
    event_sink_state: State<'_, CodexEventSinkState>,
) -> Result<AutomationTask, String> {
    ensure_runtime_initialized(&state, &cc_state, &event_sink_state).await?;
    automation::create_automation(
        name,
        projects,
        prompt,
        schedule,
        agent,
        model_provider,
        model,
        Some(state.codex.clone()),
        Some(cc_state.inner().clone()),
    )
        .await
}

#[tauri::command]
pub async fn update_automation(
    id: String,
    name: String,
    projects: Vec<String>,
    prompt: String,
    schedule: AutomationSchedule,
    agent: Option<String>,
    model_provider: Option<String>,
    model: Option<String>,
    state: State<'_, AppState>,
    cc_state: State<'_, CCState>,
    event_sink_state: State<'_, CodexEventSinkState>,
) -> Result<AutomationTask, String> {
    ensure_runtime_initialized(&state, &cc_state, &event_sink_state).await?;
    automation::update_automation(
        id,
        name,
        projects,
        prompt,
        schedule,
        agent,
        model_provider,
        model,
        Some(state.codex.clone()),
        Some(cc_state.inner().clone()),
    )
    .await
}

#[tauri::command]
pub async fn set_automation_paused(
    id: String,
    paused: bool,
    state: State<'_, AppState>,
    cc_state: State<'_, CCState>,
    event_sink_state: State<'_, CodexEventSinkState>,
) -> Result<AutomationTask, String> {
    ensure_runtime_initialized(&state, &cc_state, &event_sink_state).await?;
    automation::set_automation_paused(
        id,
        paused,
        Some(state.codex.clone()),
        Some(cc_state.inner().clone()),
    )
    .await
}

#[tauri::command]
pub async fn delete_automation(
    id: String,
    state: State<'_, AppState>,
    cc_state: State<'_, CCState>,
    event_sink_state: State<'_, CodexEventSinkState>,
) -> Result<(), String> {
    ensure_runtime_initialized(&state, &cc_state, &event_sink_state).await?;
    automation::delete_automation(id, Some(state.codex.clone()), Some(cc_state.inner().clone()))
        .await
}

#[tauri::command]
pub async fn run_automation_now(
    id: String,
    state: State<'_, AppState>,
    cc_state: State<'_, CCState>,
    event_sink_state: State<'_, CodexEventSinkState>,
) -> Result<(), String> {
    ensure_runtime_initialized(&state, &cc_state, &event_sink_state).await?;
    automation::run_automation_now(id, Some(state.codex.clone()), Some(cc_state.inner().clone()))
        .await
}
