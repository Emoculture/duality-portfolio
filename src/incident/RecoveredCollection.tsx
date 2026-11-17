import { useState } from "react";
import { add, type IncidentSave } from "./state";

type Props = { save: IncidentSave; update: (fn: (s: IncidentSave) => IncidentSave) => void };

/** Files extend the existing save rather than creating a second progress store. */
export default function RecoveredCollection({ save, update }: Props) {
  const [photoTime, setPhotoTime] = useState("");
  const [order, setOrder] = useState("");
  const [word, setWord] = useState("");
  const [feedback, setFeedback] = useState("");
  const memory = save.memory;
  function recover(id: string, name: string) {
    update((s) => ({ ...s, files: add(s.files, name), memory: { ...s.memory, recovered: add(s.memory.recovered, id), evidence: add(s.memory.evidence, `file:${id}`) } }));
    setFeedback(`${name}: восстановлен и добавлен в дело.`);
  }
  const state = (id: string, unlocked: boolean) => memory.recovered.includes(id) ? "RECOVERED" : unlocked ? "CORRUPTED" : "LOCKED";
  const photoReady = memory.evidence.includes("camera000");
  const logReady = memory.recovered.includes("LETTER");
  const transcriptReady = memory.recovered.includes("CASE_LOG");
  return <section className="incident-panel recovered-collection" aria-label="Дополнительные восстановленные файлы">
    <h3>RECOVERED FILES / дополнительная копия</h3>
    <p>Это вымышленные архивные материалы. Улики и состояния сохраняются в журнале расследования.</p>
    <article>
      <h4>PHOTO_000.JPG — {state("CASE_PHOTO", photoReady)}</h4>
      {!photoReady ? <p>Заблокирован: сохраните кадр 00:01 из CAMERA_000.</p> : memory.recovered.includes("CASE_PHOTO") ? <>
        <img className="recovered-photo" src="/archive/camera-unknown.svg" alt="Восстановленный кадр вымышленной комнаты" />
        <p>На обороте: «Это та же комната, что на плёнке, но дверь на схеме отсутствует».</p>
      </> : <>
        <p>Метка повреждена. Введите время сохранённого кадра CAMERA_000.</p>
        <form onSubmit={(event) => { event.preventDefault(); if (photoTime.trim() === "00:01") recover("CASE_PHOTO", "PHOTO_000.JPG"); else setFeedback("Метка не совпадает. Сверьте сохранённый кадр CAMERA_000."); }}>
          <label>Метка фотографии <input value={photoTime} onChange={(event) => setPhotoTime(event.target.value)} placeholder="00:00" /></label>{" "}<button>Восстановить фотографию</button>
        </form>
        <details><summary>Подсказка</summary><p>Тень у двери видна в кадре 00:01.</p></details>
      </>}
    </article>
    <article>
      <h4>SERVER_2007.LOG — {state("CASE_LOG", logReady)}</h4>
      {!logReady ? <p>Заблокирован: сначала восстановите LETTER_2007.TXT.</p> : memory.recovered.includes("CASE_LOG") ? <p>2004: создана копия → 2007: попытка восстановления. Запись о запуске памяти до команды удаления отмечена как спорная.</p> : <>
        <p>Восстановите порядок: создание копии / попытка восстановления. Укажите годы через дефис.</p>
        <form onSubmit={(event) => { event.preventDefault(); if (order.trim() === "2004-2007") recover("CASE_LOG", "SERVER_2007.LOG"); else setFeedback("Порядок не совпадает. Сверьте заметку модератора и письмо 2007 года."); }}>
          <label>Порядок событий <input value={order} onChange={(event) => setOrder(event.target.value)} placeholder="ГГГГ-ГГГГ" /></label>{" "}<button>Восстановить журнал</button>
        </form>
        <details><summary>Подсказка</summary><p>Модератор описывает создание копии в 2004; письмо относится к попытке 2007 года.</p></details>
      </>}
    </article>
    <article>
      <h4>VOICE_2007.TXT — {state("CASE_VOICE", transcriptReady)}</h4>
      {!transcriptReady ? <p>Заблокирован: восстановите SERVER_2007.LOG.</p> : memory.recovered.includes("CASE_VOICE") ? <p>[Расшифровка, носитель повреждён] «Не знаю, кто отвечает. Запишите след, прежде чем завершать сеанс».</p> : <>
        <p>В заголовке расшифровки пропущено контрольное слово из LETTER_2007.TXT.</p>
        <form onSubmit={(event) => { event.preventDefault(); if (word.trim().toUpperCase() === "TRACE") recover("CASE_VOICE", "VOICE_2007.TXT"); else setFeedback("Слово не совпадает. Оно записано в восстановленной переписке."); }}>
          <label>Слово расшифровки <input value={word} onChange={(event) => setWord(event.target.value)} /></label>{" "}<button>Восстановить расшифровку</button>
        </form>
        <details><summary>Подсказка</summary><p>В письме прямо названо слово TRACE.</p></details>
      </>}
    </article>
    <p role="status">{feedback}</p>
  </section>;
}
