"""Mede o rosto do JR num vídeo e calcula as doses do filtro "rosto saudável" PARA AQUELE VÍDEO (A-021, 13/11/2026).

Pedido do Matheus: o filtro vale para todo vídeo, sem ele pedir, e tem que olhar o rosto do dia (noite mal
dormida, mancha nova, mais vermelho) e corrigir só o que precisar, mantendo a naturalidade aprovada em 11/11.

Como funciona (local, sem custo, sem IA generativa):
  1. Pega ~16 quadros espalhados pelo vídeo ORIGINAL (sem filtro) onde o rosto aparece grande.
  2. Mede na pele, do mesmo jeito que o filtro enxerga: vermelho (a*), amarelo (b*), tom desigual,
     manchas escuras, olheira e textura fina.
  3. Compara com o "dia de referência" (scripts/rosto-referencia.json = o vídeo de 28/10, cujas doses
     o Matheus aprovou em 11/11). Igual à referência → doses iguais às aprovadas. Pior → dose sobe.
     Melhor → dose desce. Sempre dentro de limites (nunca vira "pele de plástico").

Uso (com o Python do projeto, .vc-audio/Scripts/python.exe):
  python scripts/medir-rosto.py video.mp4                      -> grava video.rosto.json (doses) e mostra o relatório
  python scripts/medir-rosto.py video.mp4 --ini 10 --fim 60    -> mede só esse trecho (segundos)
  python scripts/medir-rosto.py video.mp4 --referencia         -> grava as medidas como novo dia de referência
Depois: python scripts/filtro-rosto-natural.py entrada saida --doses video.rosto.json [--trilha ...]
"""
import json, os, subprocess, sys
import numpy as np
import cv2
import mediapipe as mp
from mediapipe.tasks.python import vision, BaseOptions


def opc(nome, padrao=None):
    return sys.argv[sys.argv.index(nome) + 1] if nome in sys.argv else padrao


ent = sys.argv[1]
# Tamanho real do vídeo (vertical ou horizontal); nunca amassar a imagem.
W, H = map(int, subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                                "stream=width,height", "-of", "csv=p=0", ent],
                               capture_output=True, text=True).stdout.strip().split(",")[:2])
N_QUADROS = int(opc("--amostras", 16))
AQUI = os.path.dirname(os.path.abspath(__file__))
REF = os.path.join(AQUI, "rosto-referencia.json")
MODELO = os.path.join(os.path.dirname(sys.executable), "..", "modelos", "face_landmarker.task")
# Doses aprovadas pelo Matheus em 11/11 (as padrão do filtro) = as doses do dia de referência.
DOSES_BASE = {"vermelho": 0.8, "amarelo": 1.5, "uniforme": 0.25, "manchas": 0.25, "olheira": 0.0, "nitidez": 0.25}

OVAL = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176,
        149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]
PROTEGER = [
    [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246],
    [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398],
    [70, 63, 105, 66, 107, 55, 65, 52, 53, 46], [300, 293, 334, 296, 336, 285, 295, 282, 283, 276],
    [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185],
]
OLHEIRAS = [[226, 31, 228, 229, 230, 231, 232, 233, 243, 133, 155, 154, 153, 145, 144, 163, 7, 33],
            [446, 261, 448, 449, 450, 451, 452, 453, 463, 362, 382, 381, 380, 374, 373, 390, 249, 263]]


def duracao(arq):
    s = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", arq],
                       capture_output=True, text=True).stdout.strip()
    if not s:
        sys.exit(f"ERRO: não consegui ler a duração de {arq} (o arquivo existe?)")
    return float(s)


def quadro(arq, t):
    r = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.3f}", "-i", arq, "-frames:v", "1", "-vf",
                        f"scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], capture_output=True)
    return np.frombuffer(r.stdout, np.uint8).reshape(H, W, 3) if len(r.stdout) == W * H * 3 else None


def medir(img, pts):
    """Mesmas contas do filtro (máscara de pele, camadas larga/média/fina), só que medindo em vez de mudar."""
    iod = float(np.hypot(*(pts[33] - pts[263])))
    m = np.zeros((H, W), np.float32)
    cv2.fillPoly(m, [np.int32(pts[OVAL])], 1.0)
    for g in PROTEGER:
        cv2.fillPoly(m, [cv2.convexHull(np.int32(pts[g]))], 0.0)
    lab = cv2.cvtColor(img.astype(np.float32) / 255.0, cv2.COLOR_BGR2LAB)
    L, A, B = lab[..., 0], lab[..., 1], lab[..., 2]
    cor_pele = np.clip((A - 3) / 5, 0, 1) * np.clip((B - 3) / 6, 0, 1) * np.clip((L - 8) / 10, 0, 1)
    m = m * cor_pele
    s1, s2 = iod * 0.012, iod * 0.07
    larga = cv2.GaussianBlur(L, (0, 0), s2)
    g1 = cv2.GaussianBlur(L, (0, 0), s1)
    media, fina = g1 - larga, L - g1
    mo = np.zeros((H, W), np.float32)
    for g in OLHEIRAS:
        cv2.fillPoly(mo, [cv2.convexHull(np.int32(pts[g]))], 1.0)
    for g in PROTEGER[:2]:
        cv2.fillPoly(mo, [cv2.convexHull(np.int32(pts[g]))], 0.0)
    boch = np.zeros((H, W), np.uint8)
    for i in (50, 280):
        cv2.circle(boch, tuple(np.int32(pts[i])), int(0.12 * iod), 1, -1)
    pele = (m > 0.5) & (mo < 0.5)
    if pele.sum() < 500 or not boch.any() or (mo > 0.5).sum() < 50:
        return None
    ref_l = float(np.median(larga[boch > 0]))
    return {
        "vermelho": float(np.median(A[pele])),                       # a* da pele
        "amarelo": float(np.median(B[pele])),                        # b* da pele
        "tom_desigual": float(np.std(larga[pele])),                  # manchas grandes de cor/luz
        "manchas": float(np.mean(np.clip(-media[pele], 0, None))),   # marcas escuras de tamanho médio
        "olheira": ref_l - float(np.median(larga[mo > 0.5])),        # quanto embaixo do olho é mais escuro que a bochecha
        "textura": float(np.std(fina[pele])),                        # nitidez fina da pele
    }


det = vision.FaceLandmarker.create_from_options(vision.FaceLandmarkerOptions(
    base_options=BaseOptions(model_asset_path=MODELO), running_mode=vision.RunningMode.IMAGE, num_faces=1))


def detectar(img):
    """Acha os pontos do rosto. Se o rosto for pequeno na imagem (vídeo vertical, JR longe), procura de novo
    em pedaços quadrados sobrepostos, como um zoom (o detector reduz a imagem inteira e perde rosto pequeno)."""
    lado = min(W, H)
    cortes = [(0, 0, W, H)] + [(x, y, lado // 2, lado // 2) for y in range(0, H - lado // 2 + 1, lado // 4)
                                for x in range(0, W - lado // 2 + 1, lado // 4)]
    for x, y, cw, ch in cortes:
        rec = img[y:y + ch, x:x + cw]
        r = det.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(
            cv2.cvtColor(rec, cv2.COLOR_BGR2RGB))))
        if r.face_landmarks:
            return np.array([[x + p.x * cw, y + p.y * ch] for p in r.face_landmarks[0]], np.float32)
    return None


dur = duracao(ent)
t0, t1 = float(opc("--ini", 0.5)), float(opc("--fim", dur - 0.5))
medidas, tempos = [], []
# Tenta o dobro de pontos: alguns caem em quadro sem rosto ou com o JR pequeno (janelinha).
for t in np.linspace(t0, t1, N_QUADROS * 2):
    img = quadro(ent, t)
    if img is None:
        continue
    pts = detectar(img)
    if pts is None:
        continue
    if np.hypot(*(pts[33] - pts[263])) < 70:  # rosto pequeno demais (menos de 70 px entre os olhos): não confiável
        continue
    v = medir(img, pts)
    if v:
        medidas.append(v); tempos.append(round(float(t), 1))

if len(medidas) < 4:
    sys.exit(f"ERRO: só {len(medidas)} quadros com rosto grande o bastante em {ent}. Use --ini/--fim num trecho com o JR em tela cheia.")
hoje = {k: float(np.median([m[k] for m in medidas])) for k in medidas[0]}

if "--referencia" in sys.argv:
    json.dump({"video": os.path.basename(ent), "medidas": hoje, "doses": DOSES_BASE, "quadros": tempos},
              open(REF, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    print(f"referência gravada em {REF} ({len(medidas)} quadros)")
    sys.exit(0)

ref = json.load(open(REF, encoding="utf-8"))["medidas"]
cl = lambda x, a, b: float(min(max(x, a), b))
# Zona morta: a variação normal dentro do MESMO vídeo (medida em 13/11: metade 1 x metade 2 do 28/10) não mexe
# na dose. Só conta o que passar disso. Cor: unidades de a*/b*. Demais: fração (0,06 = 6%).
def tirar_ruido(dif, folga):
    return 0.0 if abs(dif) <= folga else dif - np.sign(dif) * folga
dv = tirar_ruido(hoje["vermelho"] - ref["vermelho"], 0.6)
da = tirar_ruido(hoje["amarelo"] - ref["amarelo"], 0.6)
rel = lambda k: 1 + tirar_ruido(hoje[k] / ref[k] - 1, 0.06)
# Ganhos: quanto cada dose precisa mudar para compensar 1 unidade de diferença na medida.
# Vermelho e amarelo: medidos em 11/11 (0,8 de dose tirou ~0,9 de a*; 1,5 tirou ~0,6 de b*).
# Tom, manchas e textura: proporcionais ao dia de referência. Olheira: só entra se estiver mais funda que lá.
doses = {
    "vermelho": cl(DOSES_BASE["vermelho"] + 0.9 * dv, 0.0, 3.0),
    "amarelo": cl(DOSES_BASE["amarelo"] + 2.5 * da, 0.0, 4.0),
    "uniforme": cl(DOSES_BASE["uniforme"] * rel("tom_desigual"), 0.10, 0.50),
    "manchas": cl(DOSES_BASE["manchas"] * rel("manchas"), 0.10, 0.55),
    "olheira": cl(1 - 1 / rel("olheira"), 0.0, 0.45),   # olheira 20% mais funda que a referência -> tira ~17%
    "nitidez": cl(DOSES_BASE["nitidez"] / rel("textura"), 0.10, 0.45),
}
doses = {k: round(v, 3) for k, v in doses.items()}
saida = opc("--saida", os.path.splitext(ent)[0] + ".rosto.json")
json.dump({"video": os.path.basename(ent), "trecho_s": [t0, t1], "quadros": tempos, "medidas": hoje,
           "referencia": ref, "doses": doses}, open(saida, "w", encoding="utf-8"), indent=2, ensure_ascii=False)

nomes = {"vermelho": "vermelho (a*)", "amarelo": "amarelo (b*)", "tom_desigual": "tom desigual",
         "manchas": "manchas escuras", "olheira": "olheira", "textura": "textura fina"}
print(f"{os.path.basename(ent)}: {len(medidas)} quadros medidos")
for k, nome in nomes.items():
    dif = (hoje[k] / ref[k] - 1) * 100 if ref[k] else 0
    print(f"  {nome:16s} hoje {hoje[k]:6.2f} | referência {ref[k]:6.2f} | {dif:+5.0f}%")
print("  doses:", "  ".join(f"{k} {v}" for k, v in doses.items()))
print(f"  gravado: {saida}")
