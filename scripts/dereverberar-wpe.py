#!/usr/bin/env python
"""
dereverberar-wpe.py — reduz reverberação/eco de sala com WPE (nara_wpe), 04/11/2026.

Precisa do Python isolado em .vc-audio/ (venv local, fora do Git — ver docs/guia-edicao.md,
seção "Eco"). Rodar sempre com -I (isola do sistema, ignora PYTHONPATH):

  .vc-audio/Scripts/python.exe -I scripts/dereverberar-wpe.py <entrada.wav> <saida.wav> [--forca moderada|forte|maxima]

Testado em 04/11/2026 numa amostra de 30s do áudio de 28/10: a força "maxima" foi a única que
mudou o som de forma mensurável (reduziu a energia da cauda em ~12 dB; moderada e forte quase não
mexeram, ~28-32 dB abaixo da voz). Resultado ainda não confirmado por ouvido — ver
docs/alteracoes.md, pedido A-001.

Depois do WPE, passe o resultado por scripts/tratar-voz.mjs --gate (ou --gate-forte): o portão
reduz o que sobra nas pausas sem o problema do compressor, que REALÇA a cauda (achado de 04/11).
"""
import sys, time
import numpy as np
import soundfile as sf
from nara_wpe.wpe import wpe
from nara_wpe.utils import stft, istft

FORCAS = {
    # (tamanho da janela, passo, taps, atraso)
    "moderada": (2048, 512, 15, 3),
    "forte": (2048, 512, 25, 2),
    "maxima": (1024, 256, 40, 1),
}


def main():
    if len(sys.argv) < 3:
        print("Uso: python dereverberar-wpe.py <entrada.wav> <saida.wav> [--forca moderada|forte|maxima]")
        sys.exit(1)
    entrada, saida = sys.argv[1], sys.argv[2]
    forca = "maxima"
    if "--forca" in sys.argv:
        forca = sys.argv[sys.argv.index("--forca") + 1]
    if forca not in FORCAS:
        print(f"Força desconhecida: {forca}. Use: {list(FORCAS)}")
        sys.exit(1)
    size, shift, taps, delay = FORCAS[forca]

    x, sr = sf.read(entrada, dtype="float64")
    if x.ndim > 1:
        x = x.mean(axis=1)

    t0 = time.time()
    Y = stft(x[None, :], size=size, shift=shift).transpose(2, 0, 1)  # (F, D=1, T)
    Z = wpe(Y, taps=taps, delay=delay, iterations=3, statistics_mode="full")
    z = istft(Z.transpose(1, 2, 0), size=size, shift=shift)[0][: len(x)]
    z = z / max(1e-9, np.max(np.abs(z))) * np.max(np.abs(x))

    sf.write(saida, np.stack([z, z], axis=1), sr, subtype="PCM_24")
    print(f"ok: {saida} (força {forca}, {sr} Hz, {time.time() - t0:.1f}s)")


if __name__ == "__main__":
    main()
