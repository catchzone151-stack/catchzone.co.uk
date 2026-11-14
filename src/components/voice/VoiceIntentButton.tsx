"use client";

interface VoiceIntentButtonProps {
  intent: "demonstration" | "requirements";
  className?: string;
  children: React.ReactNode;
}

/** Selects the enquiry intent and moves focus into the contact form. */
export function VoiceIntentButton({ intent, className, children }: VoiceIntentButtonProps) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        document.getElementById("voice-contact")?.scrollIntoView({ block: "start" });
        window.dispatchEvent(new CustomEvent("cz-voice-intent", { detail: intent }));
      }}
    >
      {children}
    </button>
  );
}
