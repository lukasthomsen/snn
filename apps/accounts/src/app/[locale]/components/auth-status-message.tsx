import { Alert } from "@snn/ui";

type AuthStatusMessageProps = {
  message?: string | undefined;
  tone: "danger" | "success";
};

export function AuthStatusMessage({ message, tone }: AuthStatusMessageProps) {
  if (!message) {
    return null;
  }

  return <Alert status={tone}>{message}</Alert>;
}
