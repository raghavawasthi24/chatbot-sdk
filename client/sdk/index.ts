import { createIframe } from "./iframe";

type ChatbotConfig = {
  botId: string;
  position?: "left" | "right";
};

declare global {
  interface Window {
    ChatbotSDK: {
      init: (config: ChatbotConfig) => void;
    };
  }
}

function init(config: ChatbotConfig) {
  if (!config?.botId) {
    throw new Error("ChatbotSDK: botId is required");
  }

  createIframe(config);
}

window.ChatbotSDK = { init };
