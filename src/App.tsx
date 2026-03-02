import { useCallback, useEffect, useState } from 'react';
import { listen } from '@tauri-apps/api/event';
import './App.css';
import { useCodexEvents } from '@/hooks/codex';
import { AppLayout } from '@/components/layout';
import { isTauri } from '@/hooks/runtime';
import { HistoryProjectsDialog } from '@/components/project-selector';
import {
  ensureCodexConnected,
  initializeCodexAsync,
  installCodexCliUser,
  isCodexCliInstalled,
} from '@/services/tauri';
import { CodexInstallDialog } from '@/components/codex/CodexInstallDialog';

function AppShell() {
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
    if (!isTauri()) {
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
          setInstallDialogOpen(true);
          setAuthStepVisible(false);
          return;
        }

        await ensureCodexConnected();
        await initializeCodexAsync();
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
  }, []);

  // Listen to codex events
  useCodexEvents();

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
