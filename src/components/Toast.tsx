interface ToastProps {
  message: string | null
}

/** Small "✓ Logged!" confirmation pill shown near the center of the screen. */
export default function Toast({ message }: ToastProps) {
  return (
    <div className={`toast ${message ? 'toast--show' : ''}`} role="status" aria-live="polite">
      {message}
    </div>
  )
}
