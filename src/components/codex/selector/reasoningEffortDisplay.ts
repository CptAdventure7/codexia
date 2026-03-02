import type { ReasoningEffort } from '@/bindings';

type OpenAiReasoningOption = {
  reasoningEffort: ReasoningEffort;
  description: string;
};

export function getReasoningEffortDisplay(
  option: OpenAiReasoningOption | ReasoningEffort,
): ReasoningEffort {
  return typeof option === 'string' ? option : option.reasoningEffort;
}

export function getReasoningEffortTriggerLabel(
  reasoningEffort: ReasoningEffort | null | undefined,
): string {
  return reasoningEffort ?? 'Default';
}
