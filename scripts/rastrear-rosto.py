"""Rastreio do rosto do JR para o filtro de pele (11/11/2026, A-018). 1ª de 2 passadas.

Como os programas de cor profissionais (tracker + janela + chave de cor): primeiro se acha o rosto em
TODOS os quadros, depois se aplica o filtro com o rastreio já pronto (scripts/filtro-rosto-natural.py
--trilha). Assim o filtro nunca "pisca" quando o detector falha num quadro.

O que faz:
  1. procura os 478 pontos do rosto na imagem inteira;
  2. se não achar (rosto pequeno, ex.: o JR numa janelinha), amplia a região onde o rosto estava
     (ou varre a imagem em pedaços ampliados) e procura de novo;
  3. marca os cortes de cena (mudança brusca da imagem);
  4. preenche buracos de até --buraco segundos interpolando os pontos entre o antes e o depois, sem
     atravessar corte; perto do corte, segura a última posição por até --segurar segundos;
  5. suaviza os pontos no tempo (média centrada, sem atraso) e calcula o "peso" do efeito por quadro,
     que entra e sai em --rampa quadros (nada de efeito ligando/desligando de uma vez).

Uso: python scripts/rastrear-rosto.py video.mp4 trilha.npz [--buraco 2] [--segurar 0.5] [--rampa 6]
Saída: trilha.npz com pts (N x 478 x 2, px), peso (N), achado (N: 0 nada, 1 direto, 2 com zoom,
       3 interpolado, 4 segurado) e cortes (lista de quadros).
"""
import os, subprocess, sys
import numpy as np
import cv2
import mediapipe as mp
from mediapipe.tasks.python import vision, BaseOptions


def opc(nome, padrao=None):
    return sys.argv[sys.argv.index(nome) + 1] if nome in sys.argv else padrao


ent, sai = sys.argv[1], sys.argv[2]
BURACO = float(opc("--buraco", 2)); SEGURAR = float(opc("--segurar", 0.5)); RAMPA = int(opc("--rampa", 6))
W, H, FPS = 1920, 1080, 30
MODELO = os.path.join(os.path.dirname(sys.executable), "..", "modelos", "face_landmarker.task")
det = vision.FaceLandmarker.create_from_options(vision.FaceLandmarkerOptions(
    base_options=BaseOptions(model_asset_path=MODELO), running_mode=vision.RunningMode.IMAGE, num_faces=1,
    min_face_detection_confidence=0.3, min_face_presence_confidence=0.3))


def achar(rgb, x0=0, y0=0, esc=1.0):
    """Procura o rosto numa imagem (ou recorte ampliado) e devolve os pontos no quadro inteiro."""
    r = det.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(rgb)))
    if not r.face_landmarks:
        return None
    h, w = rgb.shape[:2]
    p = np.array([[q.x * w, q.y * h] for q in r.face_landmarks[0]], np.float32)
    return p / esc + [x0, y0]


def achar_com_zoom(rgb, ultimo):
    """Rosto pequeno: recorta em volta da última posição (ou varre a imagem) e amplia 2-3x."""
    regioes = []
    if ultimo is not None:
        c = ultimo.mean(0); iod = float(np.hypot(*(ultimo[33] - ultimo[263])))
        lado = int(np.clip(iod * 7, 360, 900))
        regioes.append((int(c[0] - lado / 2), int(c[1] - lado / 2), lado))
    for lado in (540, 720):  # varredura em pedaços sobrepostos
        for y in range(0, H - lado + 1, lado // 2):
            for x in range(0, W - lado + 1, lado // 2):
                regioes.append((x, y, lado))
    for x, y, lado in regioes:
        x = int(np.clip(x, 0, W - lado)); y = int(np.clip(y, 0, H - lado))
        esc = 1080 / lado
        rec = cv2.resize(rgb[y:y + lado, x:x + lado], (1080, 1080), interpolation=cv2.INTER_CUBIC)
        p = achar(rec, x, y, esc)
        if p is not None:
            return p
    return None


ler = subprocess.Popen(["ffmpeg", "-v", "error", "-i", ent, "-vf", f"scale={W}:{H}", "-f", "rawvideo",
                        "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
pts, achado, mini = [], [], []
ultimo = None
n = 0
while True:
    buf = ler.stdout.read(W * H * 3)
    if len(buf) < W * H * 3:
        break
    rgb = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
    p = achar(rgb); tipo = 1
    if p is None:
        p = achar_com_zoom(rgb, ultimo); tipo = 2
    if p is None:
        pts.append(np.full((478, 2), np.nan, np.float32)); achado.append(0)
    else:
        pts.append(p.astype(np.float32)); achado.append(tipo); ultimo = p
    mini.append(cv2.cvtColor(cv2.resize(rgb, (64, 36), interpolation=cv2.INTER_AREA), cv2.COLOR_RGB2GRAY).astype(np.float32))
    n += 1
    if n % 600 == 0:
        print(f"  {n} quadros ({n / FPS:.0f} s)", flush=True)

pts = np.array(pts); achado = np.array(achado); N = len(pts)
# Cortes de cena: imagem muda de uma vez (diferença média alta entre quadros vizinhos).
dif = np.array([0.0] + [float(np.mean(np.abs(mini[i] - mini[i - 1]))) for i in range(1, N)])
limiar = max(12.0, float(np.median(dif) * 6))
cortes = [i for i in range(1, N) if dif[i] > limiar]
tomada = np.zeros(N, int)
for c in cortes:
    tomada[c:] += 1

# Preenche buracos dentro da mesma tomada.
tem = ~np.isnan(pts[:, 0, 0])
i = 0
while i < N:
    if tem[i]:
        i += 1; continue
    j = i
    while j < N and not tem[j]:
        j += 1
    a, b = i - 1, j  # vizinhos com rosto (podem não existir)
    mesma_a = a >= 0 and tomada[a] == tomada[i]
    mesma_b = b < N and tomada[b] == tomada[j - 1]
    if mesma_a and mesma_b and tomada[a] == tomada[b] and (j - i) <= BURACO * FPS:
        for k in range(i, j):
            t = (k - a) / (b - a)
            pts[k] = (1 - t) * pts[a] + t * pts[b]; achado[k] = 3
    else:
        for k in range(i, j):
            if mesma_a and k - a <= SEGURAR * FPS:
                pts[k] = pts[a]; achado[k] = 4
            elif mesma_b and b - k <= SEGURAR * FPS:
                pts[k] = pts[b]; achado[k] = 4
    i = j

# Suaviza no tempo (centrado, sem atraso), só dentro de cada tomada e sem misturar buracos.
tem = ~np.isnan(pts[:, 0, 0])
suave = pts.copy()
RAIO = 2
for k in range(N):
    if not tem[k]:
        continue
    viz = [m for m in range(k - RAIO, k + RAIO + 1) if 0 <= m < N and tem[m] and tomada[m] == tomada[k]]
    suave[k] = pts[viz].mean(0)

# Peso do efeito: 1 com rosto, rampa nas pontas de cada trecho com rosto.
peso = np.zeros(N, np.float32)
i = 0
while i < N:
    if not tem[i]:
        i += 1; continue
    j = i
    while j < N and tem[j] and tomada[j] == tomada[i]:
        j += 1
    for k in range(i, j):
        entrada = 1.0 if (i > 0 and tomada[i] != tomada[i - 1]) or i == 0 else min(1.0, (k - i + 1) / RAMPA)
        saida = 1.0 if j >= N or tomada[j] != tomada[j - 1] else min(1.0, (j - k) / RAMPA)
        peso[k] = min(entrada, saida)
    i = j

np.savez_compressed(sai, pts=suave.astype(np.float32), peso=peso, achado=achado.astype(np.int8),
                    cortes=np.array(cortes, int))
conta = {nome: int((achado == v).sum()) for v, nome in ((1, "direto"), (2, "zoom"), (3, "interpolado"),
                                                         (4, "segurado"), (0, "sem rosto"))}
print(f"ok: {N} quadros | {conta} | cortes de cena: {len(cortes)}")
