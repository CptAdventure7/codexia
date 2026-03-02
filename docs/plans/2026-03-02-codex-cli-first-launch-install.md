# Codex CLI First-Launch Install Prompt Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** When Codex CLI is missing at app launch, show a modal that offers per-user installation; if user accepts, install Codex CLI, connect Codex app-server, and immediately prompt for authentication.

**Architecture:** Add backend tauri commands for CLI presence check, per-user installer execution, and post-install Codex connection bootstrap. Add a frontend launch dialog flow in `App.tsx` that gates initialization, runs installation, then renders `CodexAuth` as the immediate next step. Keep web/headless behavior unchanged.

**Tech Stack:** Rust (Tauri v2 backend), React + TypeScript frontend, shadcn Dialog/Button/Card components.

---

### Task 1: Backend command test scaffolding (TDD red)

**Files:**
- Create: `src-tauri/src/codex/installer.rs`
- Modify: `src-tauri/src/codex/mod.rs`

**Step 1: Write failing tests for installer command selection logic**

Define pure helper tests for:
- building per-user install attempts (bun then npm)
- formatting aggregated install errors
- success path expectation for discover-after-install behavior

**Step 2: Run test to verify it fails**

Run: `cargo test codex::installer --manifest-path src-tauri/Cargo.toml`
Expected: FAIL due to missing implementation.

**Step 3: Implement minimal helper code**

Implement helper functions and minimal module exports needed for test compile.

**Step 4: Re-run test to verify pass**

Run: `cargo test codex::installer --manifest-path src-tauri/Cargo.toml`
Expected: PASS.

### Task 2: Backend tauri commands for detect/install/connect

**Files:**
- Modify: `src-tauri/src/codex/commands.rs`
- Modify: `src-tauri/src/gui.rs`
- Modify: `src-tauri/src/codex/mod.rs`
- Modify: `src-tauri/src/codex/app_server.rs`

**Step 1: Write failing test for install command flow helper (red)**

Add unit test that verifies failed command output is surfaced and that install attempts are ordered.

**Step 2: Verify fail**

Run: `cargo test codex::installer --manifest-path src-tauri/Cargo.toml`
Expected: FAIL message for unimplemented async command runner path.

**Step 3: Implement minimal production logic (green)**

Add tauri commands:
- `codex_cli_installed` -> bool
- `install_codex_cli_user` -> installed binary path string
- `ensure_codex_connected` -> connect app-server and manage runtime state if absent

Wire commands into `invoke_handler` and ensure required shared event sink / init state are always available.

**Step 4: Verify green**

Run: `cargo test codex::installer --manifest-path src-tauri/Cargo.toml`
Expected: PASS.

### Task 3: Frontend launch UX (TDD red)

**Files:**
- Create: `src/components/codex/CodexInstallDialog.tsx`
- Modify: `src/App.tsx`
- Modify: `src/services/tauri/codex.ts`

**Step 1: Add failing TypeScript compile expectations**

Reference new tauri service methods from `App.tsx` before implementation to produce type errors.

**Step 2: Verify fail**

Run: `bunx tsc --noEmit`
Expected: FAIL due to missing exported service functions/component.

**Step 3: Implement minimal UI flow**

- Check install state at launch.
- If missing: open install modal.
- Install button triggers per-user install, then `ensure_codex_connected`, then `initializeCodexAsync`.
- After successful install/connect: display auth prompt (`CodexAuth`) immediately.

**Step 4: Verify green**

Run: `bunx tsc --noEmit`
Expected: PASS.

### Task 4: End-to-end verification before completion

**Files:**
- No additional code files.

**Step 1: Run backend compile/test checks**

Run: `cargo check --manifest-path src-tauri/Cargo.toml`
Expected: PASS.

**Step 2: Run frontend type checks**

Run: `bunx tsc --noEmit`
Expected: PASS.

**Step 3: Manual smoke check (dev runtime)**

Run: `bun tauri dev`
Expected: missing-Codex machine shows install dialog; installing transitions to auth prompt.
