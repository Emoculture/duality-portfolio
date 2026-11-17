import { useState } from "react";
import { add, type IncidentSave } from "./state";
import RecoveredCollection from "./RecoveredCollection";

type Props = {
  view: "journal" | "forum" | "recovery" | "cctv";
  save: IncidentSave;
  update: (fn: (s: IncidentSave) => IncidentSave) => void;
};

/** An optional investigation layered over the original INCIDENT chapters. */
export default function MemoryCase({ view, save, update }: Props) {
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [frame, setFrame] = useState("00:00");
  const [enlarged, setEnlarged] = useState(false);
  const memory = save.memory;
  const unlocked = save.clues.includes("moderator");
  const photo = save.clues.includes("image");
  function collect(key: string) {
    update((s) => ({ ...s, memory: { ...s.memory, evidence: add(s.memory.evidence, key) } }));
  }
  if (view === "journal") return (
    <section className="memory-case" aria-label="Дело о пропавшем человеке">
      <strong>MISSING_PERSON_CASE.TXT</strong>
      <p>Архивная таблица: {memory.evidence.length} отметок. Источники сохранены отдельно от выводов.</p>
      <ul>
        <li>Форум / модератор: {memory.evidence.includes("forum") ? "запись №1410 сохранена" : "не изучено"}</li>
        <li>Повреждённая переписка: {memory.recovered.includes("LETTER") ? "восстановлена; слово TRACE" : "проверьте /recovery/"}</li>
        <li>Камера: {memory.evidence.includes("camera000") ? "кадр 00:01 сохранён" : "не найдено"}</li>
      </ul>
      {memory.changes.map((change) => <p key={change}>CHANGE.LOG: {change}</p>)}
    </section>
  );
  if (view === "forum") return (
    <article className="incident-panel memory-case">
      <h3>No.1410 / архив треда, 2004–2007</h3>
      <p><b>Anonymous</b> 07.11.2004 No.1410: «Кто-нибудь видел модератора? Он обещал посмотреть резервную копию.»</p>
      <p><b>Anonymous</b> 08.11.2004 No.1411: «У меня снова не грузятся картинки. Это связано?»</p>
      <p><b>MOD</b> 09.11.2004 No.1412: [ответ удалён; учётная запись заблокирована]</p>
      <p><b>Anonymous</b> 12.03.2007 No.1413: «В копии указан пропавший человек. На сервере отметка на минуту позже.»</p>
      <p>Оригинал No.1412: [удалено]</p>
      {unlocked && <p>Восстановленная версия No.1412: «Не удаляйте след. Контрольное слово в переписке — TRACE.» Дата восстановления: 2026.</p>}
      <button onClick={() => {
        collect("forum");
        if (unlocked) update((s) => ({ ...s, memory: { ...s.memory, changes: add(s.memory.changes, "No.1412: удалённая запись восстановлена после заметки модератора.") } }));
      }}>Сохранить запись №1410</button>
      {!unlocked && <p>Для восстановления No.1412 изучите заметку модератора в этом разделе.</p>}
    </article>
  );
  if (view === "recovery") return (<>
    <RecoveredCollection save={save} update={update} />
    <article className="incident-panel memory-case">
      <h3>RECOVERED FILES / переписка</h3>
      <p>LETTER_2007.TXT — {memory.recovered.includes("LETTER") ? "RECOVERED" : unlocked ? "CORRUPTED" : "LOCKED"}</p>
      {!unlocked ? <p>Нужна заметка модератора из /threads/.</p> : memory.recovered.includes("LETTER") ? (
        <p>«Копия отвечает прежде, чем мы её запустили. TRACE — не имя человека, а отметка следа. Сверь лестницу с камерой.»</p>
      ) : <>
        <p>Введите контрольное слово из восстановленного ответа No.1412 в /threads/.</p>
        <form onSubmit={(event) => {
          event.preventDefault();
          if (answer.trim().toUpperCase() === "TRACE") {
            update((s) => ({ ...s, files: add(s.files, "LETTER_2007.TXT"), memory: { ...s.memory, recovered: add(s.memory.recovered, "LETTER"), evidence: add(s.memory.evidence, "letter") } }));
            setFeedback("Файл восстановлен и добавлен в дело.");
          } else setFeedback("Контрольное слово не совпадает. Проверьте ответ модератора №1412.");
        }}>
          <label>Контрольное слово <input value={answer} onChange={(event) => setAnswer(event.target.value)} /></label>
          <button>Восстановить переписку</button>
        </form>
        <p role="status">{feedback}</p>
      </>}
    </article></>
  );
  return (
    <section className="memory-case">
      <h3>CAMERA_000 / восстановленные кадры</h3>
      {!photo ? <p>Источник заблокирован. Восстановите IMAGE_017.JPG, чтобы найти дополнительный канал.</p> : <>
        <p>Это подготовленные неподвижные кадры вымышленного помещения; доступ к камере устройства не используется.</p>
        <label>Таймкод <select value={frame} onChange={(event) => setFrame(event.target.value)}>
          <option>00:00</option><option>00:01</option><option>00:02</option>
        </select></label>
        <figure className={`memory-camera memory-camera-${frame.slice(-1)} ${frame === "00:02" && memory.events.includes("midnight") ? "memory-camera-restored" : ""} ${enlarged ? "memory-camera-zoom" : ""}`}>
          <img src={frame === "00:02" && memory.events.includes("midnight") ? "/archive/camera-000-restored.svg" : "/archive/camera-unknown.svg"} alt="Вымышленная комната в архиве камеры" />
          <figcaption>CAMERA_000 / {frame} {frame === "00:02" ? (memory.events.includes("midnight") ? "— СИГНАЛ ВОССТАНОВЛЕН: ДВЕРЬ ОТКРЫТА" : "— ПОТЕРЯ СИГНАЛА") : frame === "00:01" ? "— ТЕНЬ У ДВЕРИ" : "— АРХИВНЫЙ КАДР"}</figcaption>
          {memory.recovered.includes("CASE_PHOTO") && frame === "00:00" && <span className="memory-camera-mark">017 / ←</span>}
        </figure>
        <button onClick={() => setEnlarged(!enlarged)}>{enlarged ? "Уменьшить CAMERA_000" : "Увеличить CAMERA_000"}</button>
        {memory.recovered.includes("CASE_PHOTO") && frame === "00:00" && <p>На повторном просмотре видна отметка 017; в фотографии она была закрыта повреждённым фрагментом.</p>}
        {frame === "00:02" && memory.events.includes("midnight") && <p>Восстановленная запись противоречит журналу: дверь открыта до команды администратора.</p>}
        {frame === "00:01" && <><p>На кадре есть тень, но журнал камеры не содержит записи об открытии двери.</p><button onClick={() => collect("camera000")}>Сохранить кадр CAMERA_000</button></>}
        {memory.evidence.includes("camera000") && <p>Кадр сохранён в деле.</p>}
      </>}
    </section>
  );
}
