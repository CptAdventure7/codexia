import { Loader2 } from 'lucide-react';
import { CodexAuth } from '@/components/codex/CodexAuth';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type CodexInstallDialogProps = {
  open: boolean;
  isInstalling: boolean;
  error: string | null;
  authStepVisible: boolean;
  onInstall: () => void;
  onCancel: () => void;
};

export function CodexInstallDialog({
  open,
  isInstalling,
  error,
  authStepVisible,
  onInstall,
  onCancel,
}: CodexInstallDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onCancel()}>
      <DialogContent className="sm:max-w-[520px]" showCloseButton={!isInstalling}>
        <DialogHeader>
          <DialogTitle>
            {authStepVisible ? 'Authenticate Codex' : 'Install Codex CLI'}
          </DialogTitle>
          <DialogDescription>
            {authStepVisible
              ? 'Codex CLI is installed. Sign in to start using Codexia.'
              : 'Codex CLI was not detected on this machine. Install it for your user account now?'}
          </DialogDescription>
        </DialogHeader>

        {authStepVisible ? (
          <CodexAuth />
        ) : (
          <>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button variant="secondary" onClick={onCancel} disabled={isInstalling}>
                Not now
              </Button>
              <Button onClick={onInstall} disabled={isInstalling}>
                {isInstalling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Installing...
                  </>
                ) : (
                  'Install Codex CLI'
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
