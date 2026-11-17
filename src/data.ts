// Замените эти поля своими данными. Неизвестные сведения намеренно не выдуманы.
export const portfolio = {
  name: "Ваше имя",
  role: "Независимый разработчик",
  about:
    "Здесь будет ваша история: чем вы занимаетесь, что для вас важно и какие задачи вам интересно решать. Замените этот текст перед публикацией персональной версии.",
  email: "",
  github: "",
  skills: [
    "React",
    "TypeScript",
    "JavaScript",
    "HTML & CSS",
    "Vite",
    "Git",
    "Адаптивные интерфейсы",
    "Доступность",
  ],
  projects: [
    {
      id: "01",
      title: "CUT CULTURE",
      category: "ВЕБ-ПРОЕКТ",
      description:
        "Проект из личной коллекции. Откройте сайт, чтобы познакомиться с ним ближе.",
      tags: ["Website", "Live project"],
      href: "https://cut-culture.vercel.app/",
      kind: "cut",
    },
    {
      id: "02",
      title: "DUALITY",
      category: "ЭКСПЕРИМЕНТАЛЬНОЕ ПОРТФОЛИО",
      description:
        "Исследование цифровой идентичности. Один адрес, несколько способов увидеть знакомое.",
      tags: ["React", "TypeScript", "Creative dev"],
      href: "#home",
      kind: "duality",
    },
    {
      id: "03",
      title: "LUNA NAILS",
      category: "ДЕМОНСТРАЦИОННЫЙ САЙТ",
      description: "Демонстрационный сайт вымышленной студии маникюра.",
      tags: ["React", "TypeScript", "Vite"],
      href: "https://luna-nails-mocha.vercel.app/",
      kind: "luna",
    },
    {
      id: "04",
      title: "Director Studio",
      category: "TELEGRAM MINI APP",
      description:
        "Telegram Mini App для создания промптов, сценариев и работы с визуальными референсами.",
      tags: ["Telegram Mini App"],
      href: "https://emoculture.github.io/prompt-craft-/",
      kind: "director",
    },
  ],
  services: [
    {
      title: "Веб-разработка",
      text: "Лендинги, персональные сайты и интерактивные веб-приложения.",
    },
    {
      title: "Интерфейсы",
      text: "От понятной структуры до адаптивного интерфейса с вниманием к деталям.",
    },
    {
      title: "Creative development",
      text: "Небольшие эксперименты, анимации и нестандартные цифровые впечатления.",
    },
  ],
};

export const projectRepositories: Record<string, string> = {
  cut: "cut-culture",
  duality: "duality-portfolio",
  luna: "luna-nails",
  director: "prompt-craft-",
};
