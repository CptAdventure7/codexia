import { CodexAuth } from '@/components/codex/CodexAuth';

export default function LoginView() {
  return (
    <div className="h-full overflow-auto p-6">
      <div className="mx-auto w-full max-w-2xl">
        <CodexAuth />
      </div>
    </div>
  );
}
