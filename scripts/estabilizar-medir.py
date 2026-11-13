"""Mede o balanço do rosto do JR no início do v1 e grava a correção por quadro (11/11/2026, A-019).
Uso: .vc-audio/Scripts/python.exe scripts/estabilizar-medir.py video.mp4 saida.json [segundos 12]
Saída: lista por quadro {x, y} = posição do rosto (px, quadro 1920x1080)."""
import subprocess, sys, json
import numpy as np, cv2
ent, sai = sys.argv[1], sys.argv[2]
seg = float(sys.argv[3]) if len(sys.argv) > 3 else 12
W, H = 1920, 1080
p = subprocess.Popen(["ffmpeg","-v","error","-t",str(seg),"-i",ent,"-f","rawvideo","-pix_fmt","bgr24","-"],stdout=subprocess.PIPE)
ESC = 0.5; bx, by, bw, bh = 760, 230, 400, 300
pos = []; modelo = None; notas = []
while True:
    b = p.stdout.read(W*H*3)
    if len(b) < W*H*3: break
    img = np.frombuffer(b, np.uint8).reshape(H, W, 3)
    g = cv2.GaussianBlur(cv2.cvtColor(cv2.resize(img, None, fx=ESC, fy=ESC), cv2.COLOR_BGR2GRAY), (3,3), 0)
    if modelo is None:
        x0, y0 = int(bx*ESC), int(by*ESC)
        modelo = g[y0:y0+int(bh*ESC), x0:x0+int(bw*ESC)].copy(); atual = np.array([x0,y0], float)
        pos.append(atual.copy()); notas.append(1.0); continue
    r = 60
    x0, y0 = max(0,int(atual[0])-r), max(0,int(atual[1])-r)
    area = g[y0:y0+modelo.shape[0]+2*r, x0:x0+modelo.shape[1]+2*r]
    res = cv2.matchTemplate(area, modelo, cv2.TM_CCOEFF_NORMED)
    _, nota, _, mx = cv2.minMaxLoc(res)
    atual = np.array([x0+mx[0], y0+mx[1]], float); pos.append(atual.copy()); notas.append(nota)
    novo = g[int(atual[1]):int(atual[1])+modelo.shape[0], int(atual[0]):int(atual[0])+modelo.shape[1]]
    if novo.shape == modelo.shape: modelo = cv2.addWeighted(modelo, 0.9, novo, 0.1, 0)
pos = np.array(pos)/ESC
json.dump({"fps":30,"pos":pos.round(1).tolist(),"nota":np.round(notas,3).tolist()}, open(sai,"w"))
print(len(pos), "quadros; nota min", round(min(notas),3), "; quadros com nota<0.6:", [i for i,n in enumerate(notas) if n<0.6][:20])
