import { useEffect, useState } from "react";

const KEY = "duality.sound.enabled";
function enabled() {
  try { return localStorage.getItem(KEY) === "true"; } catch { return false; }
}
export function playArchiveClick(kind: "click" | "open" | "close" | "error" = "click") {
  if (!enabled()) return;
  try {
    const audio = new AudioContext();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = kind === "error" ? "triangle" : "sine";
    oscillator.frequency.value = { click: 540, open: 620, close: 390, error: 180 }[kind];
    gain.gain.setValueAtTime(kind === "error" ? 0.015 : 0.025, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.08);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + 0.08);
    oscillator.onended = () => { void audio.close(); };
  } catch { /* Sound is optional; navigation must still work. */ }
}
export default function SoundSetting({ className }: { className?: string }) {
  const [sound, setSound] = useState(enabled);
  useEffect(() => {
    const refresh = () => setSound(enabled());
    window.addEventListener("storage", refresh);
    window.addEventListener("duality:sound", refresh);
    return () => { window.removeEventListener("storage", refresh); window.removeEventListener("duality:sound", refresh); };
  }, []);
  return <button className={className} aria-pressed={sound} onClick={() => {
    const next = !sound;
    try { localStorage.setItem(KEY, String(next)); } catch { /* unavailable storage */ }
    setSound(next);
    window.dispatchEvent(new Event("duality:sound"));
    if (next) playArchiveClick();
  }}>Звук эффектов: {sound ? "включён" : "выключен"}</button>;
}
