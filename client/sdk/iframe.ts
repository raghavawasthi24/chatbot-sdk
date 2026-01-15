export function createIframe(config: {
    botId: string;
    position?: "left" | "right";
  }) {
    if (document.getElementById("chatbot-iframe")) return;
  
    const iframe = document.createElement("iframe");
    iframe.id = "chatbot-iframe";
    iframe.src = `/`;
    iframe.style.position = "fixed";
    iframe.style.bottom = "20px";
    iframe.style.width = "380px";
    iframe.style.height = "520px";
    iframe.style.border = "none";
    iframe.style.zIndex = "999999";
    iframe.style.background = "transparent";
  
    if (config.position === "left") {
      iframe.style.left = "20px";
    } else {
      iframe.style.right = "20px";
    }
  
    document.body.appendChild(iframe);
  }
  