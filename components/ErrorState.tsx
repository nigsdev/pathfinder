type ErrorStateProps = {
  onRetry: () => void;
};

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="py-8 text-center">
      <p className="text-base leading-[26px] text-body">
        Something went wrong on our end — your answers are saved. Try again and
        we&apos;ll pick up where you left off.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 w-full min-h-11 rounded-sm bg-primary-600 px-5 py-3 text-base font-semibold text-white hover:bg-primary-700"
      >
        Try again
      </button>
    </div>
  );
}
