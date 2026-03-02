use std::path::PathBuf;
use tokio::process::Command;

use codex_finder::discover_codex_command;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct InstallAttempt {
    pub command: String,
    pub args: Vec<String>,
}

pub fn install_attempts_for_user() -> Vec<InstallAttempt> {
    vec![
        InstallAttempt {
            command: "bun".to_string(),
            args: vec![
                "add".to_string(),
                "-g".to_string(),
                "@openai/codex".to_string(),
            ],
        },
        InstallAttempt {
            command: "npm".to_string(),
            args: vec![
                "install".to_string(),
                "-g".to_string(),
                "@openai/codex".to_string(),
            ],
        },
    ]
}

pub fn format_install_errors(errors: &[String]) -> String {
    if errors.is_empty() {
        return "No installer output available".to_string();
    }
    errors.join("\n")
}

pub fn resolve_install_result_path(path: Option<PathBuf>) -> Result<PathBuf, String> {
    path.ok_or_else(|| "Codex CLI installed but binary path was not detected".to_string())
}

async fn run_install_attempt(attempt: &InstallAttempt) -> Result<(), String> {
    let output = Command::new(&attempt.command)
        .args(&attempt.args)
        .output()
        .await
        .map_err(|err| {
            format!(
                "{} failed to start: {}",
                attempt.command,
                err
            )
        })?;

    if output.status.success() {
        return Ok(());
    }

    let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
    let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
    let details = if !stderr.is_empty() {
        stderr
    } else if !stdout.is_empty() {
        stdout
    } else {
        format!("exit status {}", output.status)
    };

    Err(format!(
        "{} {} failed: {}",
        attempt.command,
        attempt.args.join(" "),
        details
    ))
}

pub fn codex_cli_installed() -> bool {
    discover_codex_command().is_some()
}

pub async fn install_codex_cli_user() -> Result<PathBuf, String> {
    if let Some(existing) = discover_codex_command() {
        return Ok(existing);
    }

    let attempts = install_attempts_for_user();
    let mut errors = Vec::with_capacity(attempts.len());

    for attempt in &attempts {
        match run_install_attempt(attempt).await {
            Ok(()) => return resolve_install_result_path(discover_codex_command()),
            Err(err) => errors.push(err),
        }
    }

    Err(format!(
        "Failed to install Codex CLI in user scope.\n{}",
        format_install_errors(&errors)
    ))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn install_attempts_are_ordered_for_per_user_install() {
        let attempts = install_attempts_for_user();

        assert_eq!(attempts.len(), 2);
        assert_eq!(attempts[0].command, "bun");
        assert_eq!(
            attempts[0].args,
            vec![
                "add".to_string(),
                "-g".to_string(),
                "@openai/codex".to_string()
            ]
        );
        assert_eq!(attempts[1].command, "npm");
        assert_eq!(
            attempts[1].args,
            vec![
                "install".to_string(),
                "-g".to_string(),
                "@openai/codex".to_string()
            ]
        );
    }

    #[test]
    fn format_install_errors_aggregates_context_lines() {
        let rendered = format_install_errors(&[
            "bun failed: command not found".to_string(),
            "npm failed: exit code 1".to_string(),
        ]);

        assert!(rendered.contains("bun failed: command not found"));
        assert!(rendered.contains("npm failed: exit code 1"));
    }

    #[test]
    fn resolve_install_result_path_requires_detected_binary_path() {
        let err = resolve_install_result_path(None)
            .expect_err("expected error when codex binary path is not discovered");
        assert!(err.contains("binary path"));
    }
}
