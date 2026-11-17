import { useEffect, useRef, useState } from "react";
import "./pixel-cutscene.css";

export type RecordingId = "first" | "recording" | "two" | "final";
export const recordings: Record<RecordingId, { title: string; lines: string[]; end: string }> = {
  first: { title: "REC_0001 — FIRST CONTACT", lines: ["Ты всё-таки открыл его.", "Я думал, этот адрес давно перестал существовать.", "Если услышишь второй голос... не отвечай сразу."], end: "RECORDING ENDED" },
  recording: { title: "REC_0002 — THE RECORDING", lines: ["Если ты видишь эту запись, значит, они не смогли стереть всё.", "Не верь времени на этих файлах.", "Некоторые записи появились раньше, чем произошли события."], end: "TIMESTAMP CORRUPTED" },
  two: { title: "REC_0003 — TWO USERS", lines: ["Сначала я думал, что здесь только один пользователь.", "Но кто-то отвечает мне моим же голосом.", "Я не знаю, кого из нас удалили."], end: "USER COUNT: 2 → USER COUNT: 1" },
  final: { title: "REC_0004 — FINAL MEMORY", lines: ["Я хотел сохранить человека.", "Но сохранил только то, что помнило о нём.", "Скажи мне... ты помнишь, зачем пришёл?"], end: "SIGNAL LOST" },
};
export default function PixelCutscene({ id, replay = false, completed = false, reduced = false, onComplete }: {
  id: RecordingId; replay?: boolean; completed?: boolean; reduced?: boolean; onComplete: () => void;
}) {
  const [line, setLine] = useState(0);
  const [visible, setVisible] = useState(0);
  const [failed, setFailed] = useState(false);
  const typing = useRef<number | null>(null);
  const item = recordings[id];
  const text = line < item.lines.length ? item.lines[line] : item.end;
  let short = reduced || document.documentElement.dataset.reduced === "true";
  try { short ||= typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { /* unavailable preference */ }
  useEffect(() => {
    setVisible(short ? text.length : 0);
    if (short) return;
    let count = 0;
    const timer = window.setInterval(() => {
      count = Math.min(count + 2, text.length);
      setVisible(count);
      if (count >= text.length) window.clearInterval(timer);
    }, 35);
    typing.current = timer;
    return () => window.clearInterval(timer);
  }, [text, short]);
  function next() {
    if (visible < text.length) { if (typing.current !== null) window.clearInterval(typing.current); setVisible(text.length); }
    else if (line < item.lines.length) setLine(line + 1);
    else onComplete();
  }
  return <main className="pixel-cutscene" aria-label={item.title}>
    <div className={`pixel-room pixel-${id}`}>
      <p className="pixel-time">{item.title} / {replay && completed && id === "first" ? "2004.13.40" : "00:0" + line}</p>
      <div className="pixel-monitor" aria-hidden="true"><span /></div>
      {!failed ? <div className={`witness-frame ${visible < text.length ? "witness-talking" : "witness-idle"} ${id === "two" && line === 0 ? "witness-looking-down" : ""} ${id === "recording" && line === 2 ? "witness-glitch" : ""}`}>
        <img className="witness-sprite" src="/archive/witness/witness-master.png" alt="THE WITNESS, вымышленный персонаж записи" onError={() => setFailed(true)} />
        <img className="witness-mouth" src="/archive/witness/witness-master.png" alt="" aria-hidden="true" />
        <span className="witness-blink" aria-hidden="true" />
      </div> : <p>Видеосигнал повреждён. Текст записи доступен ниже.</p>}
      {replay && completed && id === "first" && line === item.lines.length && <p className="pixel-anomaly">THIS RECORDING WAS MADE TOMORROW.</p>}
      <div className="pixel-dialogue" aria-live="polite">
        <strong>{line < item.lines.length ? "THE WITNESS:" : "SYSTEM:"}</strong>
        <p>{text.slice(0, visible)}</p>
        <button onClick={next}>{visible < text.length ? "Показать текст" : line < item.lines.length ? "Далее" : "Завершить запись"}</button>{" "}
        <button onClick={onComplete}>Пропустить запись</button>
      </div>
    </div>
  </main>;
}
