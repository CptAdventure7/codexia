import { useCallback, useEffect, useState } from 'react';
import { listen } from '@tauri-apps/api/event';
import './App.css';
import { useCodexEvents } from '@/hooks/codex';
import { AppLayout } from '@/components/layout';
import { isTauri } from '@/hooks/runtime';
import { HistoryProjectsDialog } from '@/components/project-selector';
import { shouldEnableCodexEvents } from '@/hooks/codex/startupGate';
import {
  ensureCodexConnected,
  initializeCodexAsync,
  installCodexCliUser,
  isCodexCliInstalled,
} from '@/services/tauri';
import { CodexInstallDialog } from '@/components/codex/CodexInstallDialog';

function AppShell() {
  const isTauriRuntime = isTauri();
  const [codexReady, setCodexReady] = useState(!isTauriRuntime);
  const [installDialogOpen, setInstallDialogOpen] = useState(false);
  const [installingCodex, setInstallingCodex] = useState(false);
  const [installError, setInstallError] = useState<string | null>(null);
  const [authStepVisible, setAuthStepVisible] = useState(false);

  const installAndInitializeCodex = useCallback(async () => {
    setInstallingCodex(true);
    setInstallError(null);
    try {
      await installCodexCliUser();
      await ensureCodexConnected();
      await initializeCodexAsync();
      setCodexReady(true);
      setInstallDialogOpen(true);
      setAuthStepVisible(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error ?? 'Unknown error');
      setInstallError(message);
    } finally {
      setInstallingCodex(false);
    }
  }, []);

  useEffect(() => {
    if (!isTauriRuntime) {
      return;
    }

    let cancelled = false;

    const bootstrapCodex = async () => {
      try {
        const installed = await isCodexCliInstalled();
        if (cancelled) {
          return;
        }

        if (!installed) {
          setCodexReady(false);
          setInstallDialogOpen(true);
          setAuthStepVisible(false);
          return;
        }

        await ensureCodexConnected();
        await initializeCodexAsync();
        setCodexReady(true);
      } catch (error) {
        console.warn('Failed to initialize codex asynchronously', error);
      }
    };

    void bootstrapCodex();

    // Listen for codex connected event
    const unlisten = listen('codex:notification', (event: any) => {
      const notification = event.payload;
      if (notification?.method === 'codex/connected') {
        console.log('Codex connected and initialized');
      }
    });

    return () => {
      cancelled = true;
      unlisten.then((fn) => fn());
    };
  }, [isTauriRuntime]);

  // Listen to codex events
  useCodexEvents(shouldEnableCodexEvents(isTauriRuntime, codexReady));

  return (
    <>
      <AppLayout />
      <HistoryProjectsDialog />
      <CodexInstallDialog
        open={installDialogOpen}
        isInstalling={installingCodex}
        error={installError}
        authStepVisible={authStepVisible}
        onInstall={() => {
          void installAndInitializeCodex();
        }}
        onCancel={() => setInstallDialogOpen(false)}
      />
    </>
  );
}

export default function App() {
  return <AppShell />;
}
