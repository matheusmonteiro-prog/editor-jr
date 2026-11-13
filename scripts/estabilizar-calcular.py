"""Calcula a correção de enquadramento por quadro (A-019, 11/11/2026).
Corta o caminho do rosto nos cortes secos do v1 (salto > LIMIAR px num quadro) e suaviza cada pedaço
separado: o corte continua corte, só o balanço dentro de cada pedaço diminui.
Uso: .vc-audio/Scripts/python.exe scripts/estabilizar-calcular.py pos.json src/dados/estabilizar-2810.json 0.6 20 8.5 1.5"""
import json, sys, numpy as np
from scipy.ndimage import gaussian_filter1d
d = json.load(open(sys.argv[1])); p = np.array(d["pos"])
k, sigma, ate, rampa = float(sys.argv[3]), float(sys.argv[4]), float(sys.argv[5]), float(sys.argv[6])
FPS = 30; N = int(round((ate + rampa) * FPS)) + 1; p = p[:N]
LIMIAR = 15
salto = np.linalg.norm(np.diff(p, axis=0), axis=1)
cortes = [0] + [i + 1 for i, s in enumerate(salto) if s > LIMIAR] + [len(p)]
suave = np.zeros_like(p)
for a, b in zip(cortes[:-1], cortes[1:]):
    suave[a:b] = gaussian_filter1d(p[a:b], sigma=min(sigma, max(1, (b - a) / 3)), axis=0, mode="nearest")
corr = (suave - p) * k
t = np.arange(len(p)) / FPS
peso = np.clip((ate + rampa - t) / rampa, 0, 1); peso = peso * peso * (3 - 2 * peso)  # rampa suave
corr = corr * peso[:, None]
W, H = 1920, 1080
need = max(2 * np.abs(corr[:, 0]).max() / W, 2 * np.abs(corr[:, 1]).max() / H)
zmax = 1 + need + 0.004
z = 1 + (zmax - 1) * peso
res = p + corr
def vel(a): return np.linalg.norm(np.diff(a, axis=0), axis=1)
dentro = [i for i in range(len(p) - 1) if salto[i] <= LIMIAR and t[i] < ate]
print("cortes secos (s):", [round(c / FPS, 2) for c in cortes[1:-1]])
print(f"velocidade media do rosto 0-{ate}s (sem os cortes): antes {vel(p)[dentro].mean():.2f}  depois {vel(res)[dentro].mean():.2f} px/quadro")
print(f"correcao max x {np.abs(corr[:,0]).max():.1f}px y {np.abs(corr[:,1]).max():.1f}px  zoom max {zmax:.3f}")
json.dump({"_comentario": "A-019 (11/11/2026): correcao de balanco do JR no inicio. Por quadro: dx, dy em px do quadro 1920x1080 e z = zoom. Gerado por scripts/estabilizar-calcular.py.",
           "quadros": [[round(float(a), 1), round(float(b), 1), round(float(c), 4)] for (a, b), c in zip(corr, z)]},
          open(sys.argv[2], "w"))
