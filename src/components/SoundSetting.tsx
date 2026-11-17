import { useEffect, useState } from "react";

const KEY = "duality.sound.enabled";
function enabled() {
  try { return localStorage.getItem(KEY) === "true"; } catch { return false; }
}
export function playArchiveClick() {
  if (!enabled()) return;
  try {
    const audio = new AudioContext();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 540;
    gain.gain.setValueAtTime(0.025, audio.currentTime);
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
