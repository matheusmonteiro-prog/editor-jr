"""Limpa o recorte de fundo feito pela IA (modnet) para ele ficar "liso como fundo verde" (13/11/2026).

A IA erra em dois tipos de lugar quando o fundo é claro e cheio de coisas: (1) some com partes claras do JR
(a aba do chapéu branco contra a parede clara) e (2) leva junto objetos do fundo (estante, estatueta, microfone).
Com a CÂMERA PARADA, dá para corrigir com uma técnica clássica de chroma-key sem tela verde, a "placa de fundo":

 1. PLACA: monta a foto da parede sem o JR, com a média de cada pixel nos quadros em que a IA diz que ele NÃO
    está ali.
 2. TIRAR: onde o quadro é igual à placa (diferença pequena), não é o JR -> alfa 0 (some estante e microfone).
 3. DEVOLVER: na faixa do chapéu, pixel CLARO e DIFERENTE da placa, perto do JR -> volta a ser JR (aba do chapéu).
 4. SOBRAS: pedaços soltos que não encostam na borda de baixo nem são grandes -> fora.
 5. BURACOS: furo dentro do JR (a aba com a cor da parede atrás, a camisa entre os dedos) -> tapado (13/11, 2a rodada).
 6. TEMPO: onde a imagem não se mexeu, o recorte não pode mudar -> mediana de 3 quadros (tira o "chiado").
 7. BORDA LISA: contorno alisado (tira fiapos de 1 a 3 px), transição curta, encolhe 1 px (tira o fio da cor
    da parede) e suaviza 0,7 px (sem serrilhado).
A cor vem do vídeo original (não do arquivo da IA). Saída: WebM VP9 com alfa.

Uso (Python do projeto): .vc-audio/Scripts/python.exe scripts/recorte-fundo/limpar-alfa.py original.mp4 ia-foreground.webm saida.webm
Opções: --sem-devolver (não recupera partes claras) | --relatorio (mostra números por segundo)
"""
import subprocess, sys
import numpy as np
import cv2

orig, fg, saida = sys.argv[1], sys.argv[2], sys.argv[3]
DEVOLVER = "--sem-devolver" not in sys.argv
w, h = map(int, subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
                                "-of", "csv=p=0", orig], capture_output=True, text=True).stdout.strip().split(","))


def ler_rgb():
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-i", orig, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    while True:
        b = p.stdout.read(w * h * 3)
        if len(b) < w * h * 3:
            return
        yield np.frombuffer(b, np.uint8).reshape(h, w, 3)


def ler_alfa():
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-c:v", "libvpx-vp9", "-i", fg, "-vf", f"alphaextract,format=gray,crop={w}:{h}:0:0",
                          "-f", "rawvideo", "-"], stdout=subprocess.PIPE)
    while True:
        b = p.stdout.read(w * h)
        if len(b) < w * h:
            return
        yield np.frombuffer(b, np.uint8).reshape(h, w).astype(np.float32) / 255.0


# 1. PLACA DE FUNDO (média dos pixels descobertos; a cada 3 quadros)
soma = np.zeros((h, w, 3), np.float64); cont = np.zeros((h, w), np.float64)
for i, (rgb, a) in enumerate(zip(ler_rgb(), ler_alfa())):
    if i % 3:
        continue
    livre = cv2.erode((a < 0.05).astype(np.uint8), np.ones((15, 15), np.uint8)).astype(bool)  # longe da borda do JR
    soma[livre] += rgb[livre]; cont[livre] += 1
conhecido = cont >= 3
placa = (soma / np.maximum(cont, 1)[..., None]).astype(np.float32)
print(f"placa de fundo: {conhecido.mean() * 100:.0f}% da imagem conhecida (o resto o JR nunca descobre)")

def tapar(a):
    """Furo no meio do JR (aba com a cor da parede, camisa entre os dedos) vira JR. Furo = pedaço de fundo
    pequeno que não encosta nos lados nem no topo; encostar EMBAIXO pode, porque o JR sai pela base da tela."""
    k2, rot2, est2, _ = cv2.connectedComponentsWithStats((a < 0.5).astype(np.uint8), 8)
    furos = [c for c in range(1, k2) if est2[c, 0] > 0 and est2[c, 1] > 0 and est2[c, 0] + est2[c, 2] < w
             and est2[c, 4] < 0.004 * w * h]
    if furos:
        a = a.copy(); a[np.isin(rot2, furos)] = 1.0
    return a, len(furos)


suave = lambda x, a, b: np.clip((x - a) / (b - a), 0, 1)
nucleo_h = cv2.getStructuringElement(cv2.MORPH_RECT, (301, 31))  # a aba se estende para os lados da copa
n = 0; tirado = devolvido = 0.0; tapado = 0
alfas = []  # 1a passada: alfa de cada quadro (uint8, ~0,5 GB para 10 s)
for rgb, a in zip(ler_rgb(), ler_alfa()):
    f = rgb.astype(np.float32)
    # Diferença para a placa, suavizada: o ruído de compressão faz pontos isolados da parede "parecerem" diferentes
    # e virarem pontinhos no recorte (teste de 13/11). Com a média da vizinhança, ponto solto não vence.
    dif = cv2.GaussianBlur(np.sqrt(((f - placa) ** 2).sum(axis=2)), (0, 0), 2.0)
    # 2. TIRAR o que é igual ao fundo
    igual = conhecido & (dif < 24)
    fator = np.where(conhecido, suave(dif, 10, 24), 1.0)
    antes = a.sum(); a = a * fator; tirado += antes - a.sum()
    # 3. DEVOLVER partes claras do chapéu: perto da copa, claras e diferentes do fundo
    if DEVOLVER:
        corpo = a > 0.5
        linhas = np.where(corpo.any(axis=1))[0]
        if len(linhas):
            topo = linhas[0]
            faixa = np.zeros_like(corpo); faixa[topo:min(h, topo + 260)] = True
            perto = cv2.dilate(corpo.astype(np.uint8), nucleo_h).astype(bool) & faixa
            # Só branco "de palha" (quente ou neutro), nunca o branco azulado da parede, e só áreas sólidas:
            # o teste de 13/11 mostrou que sem isso voltavam pontinhos azuis e brancos da parede.
            claro = (f.mean(axis=2) > 165) & (f[..., 2] <= f[..., 0] + 6)
            novo = np.where(perto & claro & conhecido, suave(dif, 22, 45), 0.0).astype(np.float32)
            solido = cv2.morphologyEx((novo > 0.5).astype(np.uint8), cv2.MORPH_OPEN, np.ones((7, 7), np.uint8))
            novo = novo * cv2.dilate(solido, np.ones((3, 3), np.uint8)).astype(np.float32)
            antes = a.sum(); a = np.maximum(a, novo); devolvido += a.sum() - antes
    # 4. SOBRAS soltas
    # Corta "pontes" de menos de 5 px antes de separar as peças: assim pontinhos grudados no corpo por um fio
    # viram peças soltas e saem (teste de 13/11: pontinhos brancos sob a aba e na beira da mão).
    m = cv2.morphologyEx((a > 0.5).astype(np.uint8), cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    k, rot, est, _ = cv2.connectedComponentsWithStats(m, 8)
    manter = np.zeros(k, bool)
    for c in range(1, k):
        y0, alt, area = est[c, cv2.CC_STAT_TOP], est[c, cv2.CC_STAT_HEIGHT], est[c, cv2.CC_STAT_AREA]
        manter[c] = (y0 + alt >= h - 3) or area > 0.02 * w * h
    fica = cv2.dilate(manter[rot].astype(np.uint8), np.ones((7, 7), np.uint8)).astype(np.float32)
    a = a * cv2.GaussianBlur(fica, (0, 0), 1.5)
    # 5. BURACOS fechados dentro do JR -> tapados
    a, nb = tapar(a); tapado += nb
    alfas.append((np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8)); n += 1
print(f"1a passada: {n} quadros | tirado (fundo) {tirado / n / (w * h) * 100:.2f}% por quadro | devolvido (chapéu) "
      f"{devolvido / n / (w * h) * 100:.3f}% | buracos tapados {tapado}")

# 6. TEMPO + 7. BORDA LISA (2a passada, com o quadro anterior e o seguinte em mãos)
grav = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{w}x{h}", "-r", "30", "-i", "-",
                         "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-crf", "16", "-b:v", "0", "-auto-alt-ref", "0",
                         "-row-mt", "1", "-deadline", "good", "-cpu-used", "2", saida], stdin=subprocess.PIPE)
cinza = lambda x: cv2.GaussianBlur(cv2.cvtColor(x, cv2.COLOR_RGB2GRAY).astype(np.float32), (0, 0), 1.5)
quadros = ler_rgb()
ant_rgb = None; atual = next(quadros); estavel_total = 0.0
for t in range(n):
    prox = next(quadros, None)
    a = alfas[t].astype(np.float32) / 255.0
    if 0 < t < n - 1 and prox is not None:
        g = cinza(atual)
        parado = (np.abs(g - cinza(ant_rgb)) < 6) & (np.abs(g - cinza(prox)) < 6)
        parado = cv2.erode(parado.astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool)
        med = np.median(np.stack([alfas[t - 1], alfas[t], alfas[t + 1]]), axis=0).astype(np.float32) / 255.0
        a = np.where(parado, med, a); estavel_total += parado.mean()
    # contorno alisado: fiapo/dente menor que ~3 px some, curva fica redonda; e tapa furo que a mediana abriu
    a = suave(cv2.GaussianBlur(a, (0, 0), 2.0), 0.35, 0.65)
    a, _ = tapar(a)
    a = cv2.erode(a, np.ones((3, 3), np.uint8))
    a = cv2.GaussianBlur(a, (0, 0), 0.7)
    out = np.dstack([atual, (np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8)])
    grav.stdin.write(out.tobytes())
    ant_rgb, atual = atual, prox
grav.stdin.close(); grav.wait()
print(f"ok: {n} quadros -> {saida} | área parada estabilizada: {estavel_total / max(1, n - 2) * 100:.0f}% da imagem")
