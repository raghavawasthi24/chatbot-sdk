import { createIframe } from "./iframe";

declare global {
    interface Window {
        ChatbotSDK: {
            init: () => void;
        };
    }
}

function init() {
    createIframe();
}

const sdk = { init };

(window as any).ChatbotSDK = sdk;
