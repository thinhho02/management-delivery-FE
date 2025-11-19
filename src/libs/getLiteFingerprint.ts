import { UAParser } from "ua-parser-js";
import { sha256 } from 'js-sha256';
// Canvas
function getCanvasHash() {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.textBaseline = "top";
    ctx.font = "16px Arial";
    ctx.fillStyle = "#f60";
    ctx.fillRect(0, 0, 100, 30);
    ctx.fillStyle = "#069";
    ctx.fillText("fingerprint", 2, 15);
    return canvas.toDataURL();
  } catch {
    return null;
  }
}

// WebGL
function getWebglRenderer() {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl");
    if (!gl) return null;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    if (!ext) return null;
    return gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
  } catch {
    return null;
  }
}

export async function collectFingerprintComponents() {
  const parser = new UAParser();
  const ua = parser.getResult();

  const canvasHash = getCanvasHash();
  const webglRenderer = getWebglRenderer();

  return {
    deviceType: ua.device.type || "desktop",
    osName: ua.os.name || "",
    osVersionMajor: Number(ua.os.version?.split(".")[0] || 0),
    browserName: ua.browser.name || "",
    browserVersionMajor: Number(ua.browser.version?.split(".")[0] || 0),
    webglRenderer: webglRenderer || "",
    canvasHash: canvasHash || "",
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
}

export async function getLiteFingerprint() {
  const components = await collectFingerprintComponents();
  // Chuẩn hóa -> string
  const raw = JSON.stringify(components);

  const hash = sha256(raw);

  return { hash, components };
}
