"""Filtro do JR v3: retoque de colorista (06/11/2026, A-018).
Separa o rosto em 3 camadas de "tamanho":
  - base  (luz e cor larga: olheira, sombra do sulco, manchas de cor)
  - média (marcas: manchinhas, sombra funda de ruga, poros dilatados)
  - fina  (poros, fios, textura real da pele)  -> NUNCA é mexida (é o que evita a cara de boneca)
Corrige a base com "pincel de cor" (leva as áreas cansadas para a cor da bochecha saudável dele)
e só atenua a camada média (mais as marcas escuras que as claras). Olhos, sobrancelhas e boca são
protegidos.

Uso: python filtro_rosto_v3.py entrada saida [--olheira 1] [--sulco 1] [--marcas 1] [--uniformizar 1]
                                [--vida 1] [--roxo 0.5] [--quadro-ini N --quadros M] [--mascara]
Cada controle vai de 0 (nada) a ~2 (forte). 1 = dose pensada para ficar natural.
"""
import os, subprocess, sys
import numpy as np
import cv2
import mediapipe as mp
from mediapipe.tasks.python import vision, BaseOptions

def opc(nome, padrao=None):
    return sys.argv[sys.argv.index(nome) + 1] if nome in sys.argv else padrao

ent, sai = sys.argv[1], sys.argv[2]
K_OLH = float(opc("--olheira", 1)); K_SUL = float(opc("--sulco", 1)); K_MAR = float(opc("--marcas", 1))
K_UNI = float(opc("--uniformizar", 1)); K_VIDA = float(opc("--vida", 1)); K_ROXO = float(opc("--roxo", 0.5))
MASCARA = "--mascara" in sys.argv
ini, qtd = opc("--quadro-ini"), opc("--quadros")
W, H, FPS = 1920, 1080, 30
MODELO = os.path.join(os.path.dirname(sys.executable), "..", "modelos", "face_landmarker.task")

det = vision.FaceLandmarker.create_from_options(vision.FaceLandmarkerOptions(
    base_options=BaseOptions(model_asset_path=MODELO), running_mode=vision.RunningMode.VIDEO, num_faces=1))

pedaco = ["-ss", f"{int(ini) / FPS:.6f}"] if ini else []
ler = subprocess.Popen(["ffmpeg", "-v", "error", *pedaco, "-i", ent, *(["-frames:v", qtd] if qtd else []),
                        "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], stdout=subprocess.PIPE)
audio = [] if ini else ["-i", ent, "-map", "0:v", "-map", "1:a?", "-c:a", "copy"]
gravar = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}",
                           "-r", str(FPS), "-i", "-", *audio, "-c:v", "libx264", "-crf", "14", "-preset", "medium",
                           "-pix_fmt", "yuv420p", sai], stdin=subprocess.PIPE)

# MediaPipe Face Mesh (índices oficiais dos contornos).
OLHO_E_BAIXO = [33, 7, 163, 144, 145, 153, 154, 155, 133]
OLHO_D_BAIXO = [263, 249, 390, 373, 374, 380, 381, 382, 362]
OLHO_E = OLHO_E_BAIXO + [173, 157, 158, 159, 160, 161, 246]
OLHO_D = OLHO_D_BAIXO + [398, 384, 385, 386, 387, 388, 466]
SOBR_E = [70, 63, 105, 66, 107, 55, 65, 52, 53, 46]
SOBR_D = [300, 293, 334, 296, 336, 285, 295, 282, 283, 276]
LABIOS = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185]
NARINAS = [98, 97, 2, 326, 327, 294, 278, 344, 440, 275, 4, 45, 220, 115, 48, 64]
SULCOS = [(98, 61), (327, 291)]
MANDIBULA = [172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365, 397]
BOCHECHAS = [50, 280]  # amostra da cor saudável
OVAL = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148,
        176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]


def poli(m, p, idx, valor=1.0):
    cv2.fillPoly(m, [p[idx].astype(np.int32)], valor)


def mascaras(p, x0, y0, w, h):
    """Máscaras macias no recorte do rosto. p em pixels do quadro inteiro."""
    q = p - np.array([x0, y0], np.float32)
    lr = np.linalg.norm(p[234] - p[454])  # largura do rosto
    s = lr / 300.0
    olh = np.zeros((h, w), np.float32); sul = np.zeros((h, w), np.float32)
    rosto = np.zeros((h, w), np.float32); prot = np.zeros((h, w), np.float32)
    pescoco = np.zeros((h, w), np.float32)
    for baixo, canto_a, canto_b in ((OLHO_E_BAIXO, 33, 133), (OLHO_D_BAIXO, 263, 362)):
        larg = np.linalg.norm(p[canto_a] - p[canto_b])
        lid = q[baixo]
        centro_x = lid[:, 0].mean()
        # Faixa da olheira: da pálpebra de baixo até ~55% da largura do olho para baixo,
        # um pouco mais larga para fora (a olheira "escorre" para a lateral).
        abaixo = lid.copy()
        abaixo[:, 1] += larg * 0.68
        abaixo[:, 0] = centro_x + (abaixo[:, 0] - centro_x) * 1.18
        cv2.fillPoly(olh, [np.vstack([lid, abaixo[::-1]]).astype(np.int32)], 1.0)
    for n, m in SULCOS:
        a, b = q[n], q[m]
        # Sulco fica um pouco por fora da linha nariz-boca.
        fora = (a - q[4]) * 0.12
        cv2.line(sul, tuple((a + fora).astype(int)), tuple((b + fora * 0.6).astype(int)), 1.0, max(2, int(lr * 0.06)))
    poli(rosto, q, OVAL)
    # Pescoço: faixa abaixo da mandíbula, só onde a cor é de pele (não pega a camiseta).
    queixo = q[MANDIBULA]
    desce = queixo.copy(); desce[:, 1] += lr * 0.55
    desce[:, 0] = queixo[:, 0].mean() + (desce[:, 0] - queixo[:, 0].mean()) * 0.85
    cv2.fillPoly(pescoco, [np.vstack([queixo, desce[::-1]]).astype(np.int32)], 1.0)
    for idx in (OLHO_E, OLHO_D, SOBR_E, SOBR_D, LABIOS, NARINAS):
        poli(prot, q, idx)
    prot = cv2.dilate(prot, np.ones((max(3, int(5 * s)),) * 2, np.uint8))
    prot = cv2.GaussianBlur(prot, (0, 0), 3.5 * s)
    olh = cv2.GaussianBlur(olh, (0, 0), 7 * s) * (1 - prot)
    sul = cv2.GaussianBlur(sul, (0, 0), 7 * s) * (1 - prot)
    rosto = cv2.GaussianBlur(cv2.erode(rosto, np.ones((max(3, int(9 * s)),) * 2, np.uint8)), (0, 0), 10 * s)
    pele = rosto * (1 - prot)
    pescoco = cv2.GaussianBlur(pescoco, (0, 0), 10 * s) * (1 - rosto)
    return olh, sul, pele, prot, s, pescoco


pts_m = None; alvo_m = None
n = 0
while True:
    buf = ler.stdout.read(W * H * 3)
    if len(buf) < W * H * 3:
        break
    img = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
    r = det.detect_for_video(mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(img, cv2.COLOR_BGR2RGB)),
                             int(n * 1000 / FPS))
    if r.face_landmarks:
        pts = np.array([[l.x * W, l.y * H] for l in r.face_landmarks[0]], np.float32)
        pts_m = pts if pts_m is None else 0.55 * pts_m + 0.45 * pts
    f = img.astype(np.float32) / 255.0

    if K_ROXO > 0:  # luz roxa do ambiente (imagem toda)
        hsv = cv2.cvtColor(f, cv2.COLOR_BGR2HSV)
        roxo = np.clip(1 - np.abs(hsv[..., 0] - 268) / 40, 0, 1)
        hsv[..., 1] *= 1 - 0.45 * K_ROXO * roxo
        f = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)

    if pts_m is not None:
        # Recorte do rosto com margem (só ali o trabalho pesado).
        lr = np.linalg.norm(pts_m[234] - pts_m[454])
        x0 = int(max(0, pts_m[:, 0].min() - lr * 0.25)); x1 = int(min(W, pts_m[:, 0].max() + lr * 0.25))
        y0 = int(max(0, pts_m[:, 1].min() - lr * 0.25)); y1 = int(min(H, pts_m[:, 1].max() + lr * 0.75))
        w, h = x1 - x0, y1 - y0
        mo, ms, mp_, prot, s, mpe = mascaras(pts_m, x0, y0, w, h)
        # Pescoço só onde é pele (cor), para não pegar camiseta nem fundo.
        ycc = cv2.cvtColor(img[y0:y1, x0:x1], cv2.COLOR_BGR2YCrCb).astype(np.float32)
        e_pele = np.clip((ycc[..., 1] - 135) / 6, 0, 1) * np.clip((128 - ycc[..., 2]) / 6, 0, 1)
        e_pele_m = cv2.GaussianBlur(e_pele, (0, 0), 4 * s)
        mpe = mpe * e_pele_m
        # Rosto também só onde é pele: protege aba do chapéu, cabelo e fundo (achado na revisão:
        # com a cabeça baixa, a aba do chapéu ganhava faixa rosada).
        e_pele_rosto = np.clip((ycc[..., 1] - 132) / 6, 0, 1) * np.clip((130 - ycc[..., 2]) / 6, 0, 1)
        mp_ = mp_ * cv2.GaussianBlur(e_pele_rosto, (0, 0), 4 * s)
        pele_toda = np.clip(mp_ + mpe, 0, 1)

        if MASCARA:
            vis = img.copy()
            cor = np.dstack([mp_ * 0.5 + mpe * 0.5, ms + mpe * 0.6, mo]) * 255
            vis[y0:y1, x0:x1] = cv2.addWeighted(img[y0:y1, x0:x1], 0.55, cor.astype(np.uint8), 0.8, 0)
            gravar.stdin.write(vis.tobytes()); n += 1; continue

        lab = cv2.cvtColor(f[y0:y1, x0:x1], cv2.COLOR_BGR2LAB)
        L, A, B = lab[..., 0], lab[..., 1], lab[..., 2]
        # Camadas: fina (σ ~1,2 px), média (até ~σ 6), base (o resto).
        sf, sb = 1.2 * s, 6.0 * s
        Lf_blur = cv2.GaussianBlur(L, (0, 0), sf)
        Lbase = cv2.GaussianBlur(L, (0, 0), sb)
        fina = L - Lf_blur
        media = Lf_blur - Lbase
        Ab = cv2.GaussianBlur(A, (0, 0), sb); Bb = cv2.GaussianBlur(B, (0, 0), sb)

        # Cor-alvo: mediana da bochecha (pele saudável dele), suavizada no tempo.
        amostras = []
        for i in BOCHECHAS:
            cx, cy = (pts_m[i] - [x0, y0]).astype(int); rr = max(4, int(lr * 0.04))
            ys, xs = slice(max(0, cy - rr), cy + rr), slice(max(0, cx - rr), cx + rr)
            amostras.append(np.stack([Lbase[ys, xs].ravel(), Ab[ys, xs].ravel(), Bb[ys, xs].ravel()], 1))
        alvo = np.median(np.vstack(amostras), 0)
        alvo_m = alvo if alvo_m is None else 0.9 * alvo_m + 0.1 * alvo
        tL, tA, tB = alvo_m

        # 1) Olheira: pincel de cor/luz na base, levando para a cor da bochecha (só clareia).
        k = np.clip(0.75 * K_OLH, 0, 1.2) * mo
        Lbase = Lbase + np.clip(tL - Lbase, 0, None) * k
        Ab = Ab + (tA - Ab) * k * 0.8
        Bb = Bb + (tB - Bb) * k * 0.8
        # 2) Sulco: mesma ideia, mais leve.
        k = np.clip(0.5 * K_SUL, 0, 1) * ms
        Lbase = Lbase + np.clip(tL - Lbase, 0, None) * k
        # 3) Uniformizar manchas de cor no rosto (vermelhidão/acinzentado), sem mexer na luz.
        k = np.clip(0.35 * K_UNI, 0, 0.8) * pele_toda
        Ab = Ab + (tA - Ab) * k
        Bb = Bb + (tB - Bb) * k
        # 4) Marcas (camada média): atenua mais o que é escuro (manchinha, ruga funda) que o claro.
        kd = np.clip(0.45 * K_MAR, 0, 0.85) * pele_toda
        kc = np.clip(0.15 * K_MAR, 0, 0.5) * pele_toda
        media = np.where(media < 0, media * (1 - kd), media * (1 - kc))
        # 5) Vida: um pouco mais quente e corado, e um tico de luz (só cor, sem alisar).
        k = 0.8 * K_VIDA * pele_toda
        Ab = Ab + 1.2 * k; Bb = Bb + 0.9 * k; Lbase = Lbase + 0.8 * k

        L2 = Lbase + media + fina  # a camada fina volta intacta
        A2 = Ab + (A - cv2.GaussianBlur(A, (0, 0), sb))
        B2 = Bb + (B - cv2.GaussianBlur(B, (0, 0), sb))
        f[y0:y1, x0:x1] = cv2.cvtColor(np.dstack([L2, A2, B2]).astype(np.float32), cv2.COLOR_LAB2BGR)

    out = (np.clip(f, 0, 1) * 255 + 0.5).astype(np.uint8)
    gravar.stdin.write(out.tobytes())
    n += 1

gravar.stdin.close(); gravar.wait()
print(f"ok: {n} quadros | olheira {K_OLH} sulco {K_SUL} marcas {K_MAR} uniformizar {K_UNI} vida {K_VIDA} roxo {K_ROXO}")
