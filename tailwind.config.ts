import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      keyframes: {
        heroImageEntrance: {
          "0%": {
            opacity: "0",
            transform: "translateY(70px) scale(0.85)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0) scale(1)",
          },
        },
      },
      animation: {
        heroImageEntrance:
          "heroImageEntrance 2s cubic-bezier(.23,1,.32,1) forwards",
      },
    },
  },
};

export default config;
