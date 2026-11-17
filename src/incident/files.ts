export const files: Record<string, Record<string, string>> = {
  "C:\\ARCHIVE": {
    "README.TXT":
      "ARCHIVE v0.4 / Файлы виртуальны. В 2004 форум остановился после удаления аккаунта 000. В 2007 резервная копия не смогла загрузиться.",
    "IMAGE_017.JPG":
      "Камера 03, лестница. На фрагменте видна временная метка 00:01. Откройте /recovery/.",
  },
  "C:\\LOGS": {
    "LOG_2004.TXT":
      "00:01 CAM_03: фигура на лестнице.\n00:02 SERVER: создан тред 1273.\n00:03 ADMIN: запрос удаления 000.\n00:04 SERVER: остановка.",
    "USER_000.LOG":
      "Я помню этот рабочий стол. Я не помню, кто нажал восстановление.",
  },
  "C:\\USERS": {
    "ADMIN_NOTES.TXT":
      "Если копия ответит раньше создания треда, не удаляй память. Сверь CAM_03 с SERVER.LOG. Код для unlock: 000-0102.",
  },
  "C:\\RECOVERY": {
    "MEMORY.DAT":
      "2003 ORIGINAL → 2004 INCIDENT → 2007 RECOVERY → 2026 RESTORED. Это последовательность, не дата посещения пользователя.",
    "LAST_SESSION.DAT":
      "Предыдущая попытка восстановления в 2007 завершилась без администратора.",
  },
  "C:\\SYSTEM": {
    "SYSTEM_RECOVERY.EXE":
      "Виртуальная утилита. Выполните help. Для unlock используйте код из ADMIN_NOTES.TXT.",
  },
};
export const names = Object.keys(files);
