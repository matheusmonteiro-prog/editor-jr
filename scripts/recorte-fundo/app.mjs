// Teste de recorte de fundo (13/11/2026): roda no NAVEGADOR (WebGPU). Veja docs/guia-recorte-fundo.md.
import { canUseVideoMatting, getAvailableModels, loadVideoMattingModel, separateVideoLayers } from "@remotion/video-matting";
const log = (m) => { console.log(m); document.getElementById("o").textContent += m + "\n"; fetch("/log", { method: "POST", body: m }).catch(() => {}); };
const t0 = performance.now();
const seg = () => ((performance.now() - t0) / 1000).toFixed(1) + "s";
(async () => {
 for (const ent of (new URLSearchParams(location.search).get("v") || "A").split(",")) {
  try {
    log(`[${seg()}] navegador: ${navigator.userAgent.match(/Chrome\/[\d.]+/)?.[0]}`);
    const sup = await canUseVideoMatting({ model: "modnet" });
    log(`[${seg()}] canUseVideoMatting: ${JSON.stringify(sup)}`);
    if (!sup.supported) return log("PARADO: " + sup.detailedReason);
    log(`[${seg()}] baixando modelo modnet...`);
    let up=-1; await loadVideoMattingModel({ model: "modnet", onProgress: (p) => { const q = p.progress == null ? -1 : Math.floor(p.progress / 25); if (q !== up) { up = q; log(`  modelo ${p.status} ${p.file ?? ""} ${p.progress == null ? "" : p.progress.toFixed(0) + "%"}`); } } });
    log(`[${seg()}] modelo pronto. separando camadas (5 s, 1080x1920, 150 quadros)...`);
    let ult = -1;
    const r = await separateVideoLayers({
      src: location.origin + "/entrada"+ent+".mp4", model: "modnet", audio: "none",
      outputs: { base: { outputTarget: "arraybuffer" }, foreground: { outputTarget: "arraybuffer" } },
      onProgress: (p) => { const q = p.progress == null ? -1 : Math.floor(p.progress * 10); if (q !== ult) { ult = q; log(`[${seg()}] ${p.stage} ${p.progress == null ? "" : (p.progress * 100).toFixed(0) + "%"} quadros=${p.processedFrames}`); } },
    });
    log(`[${seg()}] separado: ${r.width}x${r.height}, ${r.processedFrames} quadros, ${r.durationInSeconds}s`);
    for (const nome of ["base", "foreground"]) {
      const b = await r[nome].getBlob();
      await fetch("/salvar?nome=" + ent + "-" + nome + ".webm", { method: "POST", body: b });
      log(`[${seg()}] salvo ${nome}.webm (${(b.size / 1e6).toFixed(1)} MB)`);
    }
    log(`[${seg()}] CONCLUIDO ${ent}`);
  } catch (e) { log("ERRO: " + (e?.stack || e?.message || e)); }
 }
})();
