type AuthStatusMessageProps = {
  message?: string | undefined;
  tone: "danger" | "success";
};

export function AuthStatusMessage({ message, tone }: AuthStatusMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <p className="form__notice__SW0hq" data-tone={tone}>
      {message}
    </p>
  );
}
