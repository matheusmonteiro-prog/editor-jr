#!/usr/bin/env python
"""
melhorar-voz-ia.py — limpa ruído e reduz eco de sala com IA local (Resemble Enhance), 04/11/2026.

Modelo: ResembleAI/resemble-enhance (licença MIT), pesos do "enhancer_stage2" (713 MB) em
.vc-enhance/modelo/. Roda no PC, sem enviar áudio para fora. Python isolado em .vc-enhance/ (fora do Git).
Usa um "deepspeed" de mentira dentro do venv (só para os imports não falharem; o DeepSpeed real
serve para treinar e não instala no Windows).

Uso (sempre com -I):
  .vc-enhance/Scripts/python.exe -I scripts/melhorar-voz-ia.py <entrada.wav> <saida.wav> [--modo denoise|enhance] [--nfe 32] [--lambd 0.5] [--tau 0.5]

  denoise  só tira ruído (rápido).
  enhance  tira ruído e reconstrói a voz (é o que mexe no eco de sala). nfe maior = mais qualidade e mais lento.
  lambd    0 a 1: quanto do denoiser entra (maior = mais limpo, mais artificial).
  tau      0 a 1: temperatura do modelo (maior = mais "criativo").
"""
import sys, time, argparse
from pathlib import Path
import torch, torchaudio
import soundfile as sf

RAIZ = Path(__file__).resolve().parent.parent
MODELO = RAIZ / ".vc-enhance" / "modelo" / "enhancer_stage2"

ap = argparse.ArgumentParser()
ap.add_argument("entrada"); ap.add_argument("saida")
ap.add_argument("--modo", default="enhance", choices=["denoise", "enhance"])
ap.add_argument("--nfe", type=int, default=32)
ap.add_argument("--lambd", type=float, default=0.5)
ap.add_argument("--tau", type=float, default=0.5)
a = ap.parse_args()

from resemble_enhance.enhancer.inference import denoise, enhance

x, sr = sf.read(a.entrada, dtype="float32")
if x.ndim > 1: x = x.mean(axis=1)
dwav = torch.from_numpy(x)
t0 = time.time()
torch.set_num_threads(max(1, (torch.get_num_threads())))
if a.modo == "denoise":
    y, nsr = denoise(dwav, sr, "cpu", run_dir=MODELO)
else:
    y, nsr = enhance(dwav, sr, "cpu", nfe=a.nfe, solver="midpoint", lambd=a.lambd, tau=a.tau, run_dir=MODELO)
y = y.cpu().numpy()
sf.write(a.saida, y, nsr, subtype="PCM_24")
print(f"ok: {a.saida} (modo {a.modo}, nfe {a.nfe}, {nsr} Hz, {len(y)/nsr:.1f}s de áudio em {time.time()-t0:.1f}s)")
