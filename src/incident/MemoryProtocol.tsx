import { useEffect, useState } from "react";
import { add, type IncidentSave } from "./state";

type Props = { view: "journal" | "dialogue"; save: IncidentSave; update: (fn: (s: IncidentSave) => IncidentSave) => void };

export default function MemoryProtocol({ view, save, update }: Props) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now);
  const [typing, setTyping] = useState(false);
  const memory = save.memory;
  const midnight = memory.events.includes("midnight");
  const reply = memory.nullChoices[0];
  const interpretation = memory.nullChoices[1];
  useEffect(() => {
    if (!typing) return;
    const timer = window.setTimeout(() => setTyping(false), 650);
    return () => window.clearTimeout(timer);
  }, [typing]);
  function respond(choice: "help" | "doubt") {
    const reduced = document.documentElement.dataset.reduced === "true" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTyping(!reduced);
    update((s) => ({ ...s, memory: { ...s.memory, nullChoices: [choice] } }));
  }
  useEffect(() => {
    if (memory.timerDeadline === null || midnight) return;
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [memory.timerDeadline, midnight]);
  if (view === "dialogue") return (
    <section className="memory-messenger" aria-label="Переписка с NULL">
      <h3>NULL — Messenger 2004</h3>
      {!memory.recovered.includes("LETTER") ? <p>Соединение недоступно. Восстановите переписку LETTER_2007.TXT.</p> : <>
        <p>NULL: «Вы нашли след. Поможете разобраться, кто отвечал из копии?»</p>
        {!reply ? <div>
          <button onClick={() => respond("help")}>Помогу</button>{" "}
          <button onClick={() => respond("doubt")}>Сначала докажи</button>
        </div> : <>
          <p>Вы: «{reply === "help" ? "Помогу" : "Сначала докажи"}»</p>
          {typing ? <p role="status">NULL печатает…</p> : <p>NULL: «{reply === "help" ? "Спасибо. Я не уверен, кого мы восстанавливаем." : "Справедливо. Я тоже не знаю, можно ли мне верить."}»</p>}
          {midnight ? <>
            <p>NULL: «Время 00:00 — это метка процедуры, не время вашего устройства. Я думал, дверь была закрыта.»</p>
            <p>NULL: «Если запись противоречит памяти, какую версию сохранить в деле?»</p>
            {!interpretation ? <div>
              <button onClick={() => update((s) => ({ ...s, memory: { ...s.memory, nullChoices: [s.memory.nullChoices[0], "memory"], changes: add(s.memory.changes, "NULL: в деле сохранена версия воспоминания.") } }))}>Сохранить воспоминание</button>{" "}
              <button onClick={() => update((s) => ({ ...s, memory: { ...s.memory, nullChoices: [s.memory.nullChoices[0], "record"], changes: add(s.memory.changes, "NULL: в деле сохранена версия записи.") } }))}>Сверить с записью</button>
            </div> : <p>Вы: «{interpretation === "memory" ? "Сохранить воспоминание" : "Сверить с записью"}». NULL: «{interpretation === "memory" ? "Тогда не стирай противоречие. Оно тоже часть памяти." : "Хорошо. Только запись тоже могла быть копией."}»</p>}
            {!memory.events.includes("null-complete") && <button onClick={() => update((s) => ({ ...s, memory: { ...s.memory, events: add(s.memory.events, "null-complete"), evidence: add(s.memory.evidence, "null") } }))}>Сохранить ответ NULL</button>}
            {memory.events.includes("null-complete") && <p>Переписка сохранена в деле.</p>}
          </> : <p>NULL: «В журнале есть таймер процедуры. Запусти его, если решишь продолжить.»</p>}
        </>}
      </>}
    </section>
  );
  return (
    <section className="memory-case" aria-label="Процедура восстановления памяти">
      <strong>MEMORY PROTOCOL / SYSTEM TIMER</strong>
      {!memory.recovered.includes("LETTER") ? <p>Процедура недоступна до восстановления переписки в /recovery/.</p> : midnight ? <p>00:00 — процедура завершена. В CAMERA_000 обнаружен новый журнал; NULL оставил сообщение.</p> : memory.timerDeadline === null ? <>
        <p>Таймер процедуры длится 20 секунд и продолжится после перезагрузки; это не время телефона.</p>
        <button onClick={() => update((s) => ({ ...s, memory: { ...s.memory, timerDeadline: Date.now() + 20000 } }))}>Запустить MIDNIGHT EVENT</button>
      </> : <p role="status">До 00:00: {Math.max(0, Math.ceil((memory.timerDeadline - now) / 1000))} с. Можно продолжать расследование или закрыть страницу.</p>}
      <h3>ADMIN_1999 / игровая учётная запись</h3>
      {!memory.recovered.includes("LETTER") || !memory.evidence.includes("camera000") ? <p>Для доступа найдите переписку и кадр CAMERA_000.</p> : memory.adminUnlocked ? <>
        <p>ДОСТУП ОТКРЫТ. ADMIN.LOG: «Копия сохранена до команды удаления. Источник воспоминаний не установлен.»</p>
        <p>Официальная запись утверждает, что восстановление началось после удаления. Порядок операций противоречит журналу модератора.</p>
        <button onClick={() => update((s) => ({ ...s, memory: { ...s.memory, evidence: add(s.memory.evidence, "contradiction") } }))}>Сохранить противоречие</button>
      </> : <>
        <p>Соедините контрольное слово из письма и четыре цифры времени кадра CAMERA_000 через дефис.</p>
        <form onSubmit={(event) => {
          event.preventDefault();
          if (code.trim().toUpperCase() === "TRACE-0001") {
            update((s) => ({ ...s, memory: { ...s.memory, adminUnlocked: true, evidence: add(s.memory.evidence, "admin") } }));
            setError("");
          } else setError("Код не совпадает. Проверьте слово и время 00:01.");
        }}>
          <label>Код ADMIN_1999 <input value={code} onChange={(event) => setCode(event.target.value)} /></label>
          <button>Проверить код</button>
        </form>
        <p role="status">{error}</p>
      </>}
    </section>
  );
}
