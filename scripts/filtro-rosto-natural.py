"""Filtro "rosto saudável" do JR (11/11/2026, A-018). Local, sem IA generativa, sem custo.

Calibrado para igualar o visual que o Matheus aprovou na cena gerada pela Higgsfield (Wan 2.7), medido
na pele do rosto (docs/higgsfield/guia.md): menos vermelho, menos amarelo, tom largo mais uniforme,
pele NÍTIDA (não amacia) e olheira com sombra natural (não "apaga").

Só mexe na pele (rosto + pescoço, por pontos do rosto + cor de pele). Olhos, sobrancelhas, boca, chapéu,
roupa e fundo ficam intactos. Tudo em Lab:
  - cor: tira vermelho e amarelo da pele (--vermelho, --amarelo, em unidades de a*/b*);
  - uniformizar: aproxima o tom "largo" (manchas grandes de cor e luz) de uma versão suave (--uniforme 0..1);
  - manchas: atenua só as marcas ESCURAS de tamanho médio (--manchas 0..1);
  - olheira: clareia um pouco embaixo dos olhos (--olheira 0..1; 0.25 = tira um quarto da sombra);
  - nitidez: realça a textura fina da pele (--nitidez; 0.15 = +15%).

Uso: python scripts/filtro-rosto-natural.py entrada saida [doses] [--quadro-ini N --quadros M] [--mascara]
Doses padrão = as calibradas em 11/11 contra a cena aprovada (medido em 3 quadros reais; alvo entre parênteses):
  vermelho a* 26,0 -> 25,1 (24,9) · amarelo b* 18,7 -> 18,1 (17,9) · olheira 3,8 -> 2,9 (3,9) ·
  nitidez fina 1,45 -> 1,60 (1,65) · tom desigual 5,35 -> 4,92 (5,06).
"""
import os, subprocess, sys
import numpy as np
import cv2
import mediapipe as mp
from mediapipe.tasks.python import vision, BaseOptions


def opc(nome, padrao=None):
    return sys.argv[sys.argv.index(nome) + 1] if nome in sys.argv else padrao


ent, sai = sys.argv[1], sys.argv[2]
# --doses video.rosto.json (feito por scripts/medir-rosto.py, A-021): doses medidas no rosto daquele vídeo.
# Ordem: dose escrita no comando > dose do arquivo > padrão aprovado em 11/11.
_DOSES = {}
if opc("--doses"):
    import json
    _DOSES = json.load(open(opc("--doses"), encoding="utf-8"))["doses"]
dose = lambda nome, padrao: float(opc("--" + nome, _DOSES.get(nome, padrao)))
VERM = dose("vermelho", 0.8); AMAR = dose("amarelo", 1.5)
UNIF = dose("uniforme", 0.25); MANC = dose("manchas", 0.25)
OLH = dose("olheira", 0.0); NIT = dose("nitidez", 0.25)
MASCARA = "--mascara" in sys.argv
ini, qtd = opc("--quadro-ini"), opc("--quadros")
# Tamanho real do vídeo (13/11: antes era fixo 1920x1080 e amassava vídeo vertical, como o 0926 de 2160x3872).
W, H = map(int, subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                                "stream=width,height", "-of", "csv=p=0", ent],
                               capture_output=True, text=True).stdout.strip().split(",")[:2])
FPS = 30
MODELO = os.path.join(os.path.dirname(sys.executable), "..", "modelos", "face_landmarker.task")

OVAL = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176,
        149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]
PROTEGER = [
    [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246],          # olho esq.
    [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398],     # olho dir.
    [70, 63, 105, 66, 107, 55, 65, 52, 53, 46], [300, 293, 334, 296, 336, 285, 295, 282, 283, 276],  # sobrancelhas
    [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185],    # boca
]
OLHEIRAS = [[226, 31, 228, 229, 230, 231, 232, 233, 243, 133, 155, 154, 153, 145, 144, 163, 7, 33],
            [446, 261, 448, 449, 450, 451, 452, 453, 463, 362, 382, 381, 380, 374, 373, 390, 249, 263]]

# Com --trilha (feita por scripts/rastrear-rosto.py), usa o rastreio pronto do vídeo inteiro: sem piscar
# quando o detector falha, e os pedaços processados em paralelo emendam sem diferença. Sem trilha, detecta aqui.
TRILHA = opc("--trilha")
if TRILHA:
    _t = np.load(TRILHA); T_PTS, T_PESO = _t["pts"], _t["peso"]
else:
    det = vision.FaceLandmarker.create_from_options(vision.FaceLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=MODELO), running_mode=vision.RunningMode.VIDEO, num_faces=1))

pedaco = ["-ss", f"{int(ini) / FPS:.6f}"] if ini else []
ler = subprocess.Popen(["ffmpeg", "-v", "error", *pedaco, "-i", ent, *(["-frames:v", qtd] if qtd else []),
                        "-vf", f"scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], stdout=subprocess.PIPE)
audio = [] if ini else ["-i", ent, "-map", "0:v", "-map", "1:a?", "-c:a", "copy"]
gravar = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}",
                           "-r", str(FPS), "-i", "-", *audio, "-c:v", "libx264", "-crf", "14", "-preset", "medium",
                           "-pix_fmt", "yuv420p", sai], stdin=subprocess.PIPE)

ESC = 4  # contas "largas" em 1/4 da resolução (rápido e liso)
pts_ant = None
n = 0
while True:
    buf = ler.stdout.read(W * H * 3)
    if len(buf) < W * H * 3:
        break
    img = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
    peso_q = 1.0
    if TRILHA:
        q = int(ini or 0) + n
        if q >= len(T_PTS) or np.isnan(T_PTS[q][0, 0]) or T_PESO[q] <= 0:
            gravar.stdin.write(img.tobytes()); n += 1
            continue
        pts = T_PTS[q].astype(np.float32); peso_q = float(T_PESO[q])
    else:
        r = det.detect_for_video(mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(img, cv2.COLOR_BGR2RGB)),
                                 int(n * 1000 / FPS))
        if not r.face_landmarks:
            gravar.stdin.write(img.tobytes()); n += 1; pts_ant = None
            continue
        pts = np.array([[p.x * W, p.y * H] for p in r.face_landmarks[0]], np.float32)
        # Suaviza os pontos entre quadros (máscara não "treme").
        pts = pts if pts_ant is None else 0.6 * pts_ant + 0.4 * pts
        pts_ant = pts
    iod = float(np.hypot(*(pts[33] - pts[263])))

    # Máscara da pele: oval do rosto + pescoço (abaixo do queixo), cortada pela cor de pele.
    m = np.zeros((H, W), np.float32)
    cv2.fillPoly(m, [np.int32(pts[OVAL])], 1.0)
    queixo = pts[152]
    e, d = pts[132], pts[361]  # laterais da mandíbula
    pescoco = np.int32([e - [0.15 * iod, 0], d + [0.15 * iod, 0], [d[0] + 0.15 * iod, queixo[1] + 1.2 * iod],
                        [e[0] - 0.15 * iod, queixo[1] + 1.2 * iod]])
    cv2.fillPoly(m, [pescoco], 1.0)
    # O pescoço some aos poucos para baixo (sem corte reto).
    yy = np.arange(H, dtype=np.float32)[:, None]
    m *= np.clip(1 - (yy - (queixo[1] + 0.5 * iod)) / (0.7 * iod), 0, 1)
    for g in PROTEGER:
        cv2.fillPoly(m, [cv2.convexHull(np.int32(pts[g]))], 0.0)
    f = img.astype(np.float32) / 255.0
    lab = cv2.cvtColor(f, cv2.COLOR_BGR2LAB)
    L, A, B = lab[..., 0], lab[..., 1], lab[..., 2]
    # Cor de pele: portão largo (pega o lado na sombra) e liso (sem furos).
    cor_pele = np.clip((A - 3) / 5, 0, 1) * np.clip((B - 3) / 6, 0, 1) * np.clip((L - 8) / 10, 0, 1)
    cor_pele = np.clip(cv2.GaussianBlur(cor_pele, (0, 0), iod * 0.03) * 1.6, 0, 1)
    m = cv2.GaussianBlur(m, (0, 0), iod * 0.05) * cor_pele
    for g in PROTEGER:  # olhos/boca: zero de novo, depois do desfoque da borda
        cv2.fillPoly(m, [cv2.convexHull(np.int32(pts[g]))], 0.0)
    m = cv2.GaussianBlur(m, (0, 0), 2) * peso_q

    # Camadas: larga (tom), média (marcas), fina (textura).
    s1, s2 = iod * 0.012, iod * 0.07
    pequeno = cv2.resize(lab, (W // ESC, H // ESC), interpolation=cv2.INTER_AREA)
    peso = cv2.resize(m, (W // ESC, H // ESC), interpolation=cv2.INTER_AREA) + 1e-4

    def borrar(sig):  # média só da pele (o chapéu e o fundo não entram na conta)
        num = cv2.GaussianBlur(pequeno * peso[..., None], (0, 0), sig / ESC)
        den = cv2.GaussianBlur(peso, (0, 0), sig / ESC)[..., None]
        return cv2.resize(num / den, (W, H), interpolation=cv2.INTER_LINEAR)

    larga = cv2.resize(cv2.GaussianBlur(pequeno, (0, 0), s2 / ESC), (W, H), interpolation=cv2.INTER_LINEAR)
    lisa = borrar(iod * 0.25)
    g1 = cv2.GaussianBlur(L, (0, 0), s1)
    media = g1 - larga[..., 0]
    fina = L - g1

    # Olheira: área embaixo dos olhos, suave.
    mo = np.zeros((H, W), np.float32)
    for g in OLHEIRAS:
        cv2.fillPoly(mo, [cv2.convexHull(np.int32(pts[g]))], 1.0)
    mo = cv2.GaussianBlur(mo, (0, 0), iod * 0.04)
    for g in PROTEGER[:2]:
        cv2.fillPoly(mo, [cv2.convexHull(np.int32(pts[g]))], 0.0)
    mo = cv2.GaussianBlur(mo, (0, 0), 2) * (m > 0.05)
    boch = np.zeros((H, W), np.uint8)
    for i in (50, 280):
        cv2.circle(boch, tuple(np.int32(pts[i])), int(0.12 * iod), 1, -1)
    ref_l = float(np.median(larga[..., 0][boch > 0])) if boch.any() else float(larga[..., 0].mean())

    larga2 = larga.copy()
    larga2 = larga2 + UNIF * (1 - mo)[..., None] * (lisa - larga2)       # tom largo mais uniforme (sem apagar a olheira)
    larga2[..., 0] += OLH * mo * np.clip(ref_l - larga2[..., 0], 0, None)       # olheira mais leve
    media2 = np.where(media < 0, media * (1 - MANC), media)                      # marcas escuras mais fracas
    L2 = larga2[..., 0] + media2 + fina * (1 + NIT)
    A2 = A + (larga2[..., 1] - larga[..., 1]) - VERM
    B2 = B + (larga2[..., 2] - larga[..., 2]) - AMAR
    novo = np.dstack([L2, A2, B2])
    lab_out = lab + m[..., None] * (novo - lab)

    if MASCARA:
        out = img.copy(); out[..., 2] = np.clip(out[..., 2] * 0.4 + m * 255 * 0.6, 0, 255).astype(np.uint8)
    else:
        out = (np.clip(cv2.cvtColor(lab_out.astype(np.float32), cv2.COLOR_LAB2BGR), 0, 1) * 255 + 0.5).astype(np.uint8)
    gravar.stdin.write(out.tobytes()); n += 1

gravar.stdin.close(); gravar.wait()
print(f"ok: {n} quadros | vermelho {VERM} amarelo {AMAR} uniforme {UNIF} manchas {MANC} olheira {OLH} nitidez {NIT}")
