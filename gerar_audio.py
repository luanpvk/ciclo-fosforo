"""Gera a narração da apresentação com voz neural (edge-tts).

Lê as frases (`lines`) de cada etapa em script.js e cria audio/s{etapa}_{frase}.mp3.
Rode de novo sempre que mudar algum texto da apresentação:

    python -m pip install edge-tts
    python gerar_audio.py
"""
import asyncio
import pathlib
import re

import edge_tts

VOZ = "pt-BR-FranciscaNeural"
AMOSTRA = "Olá, turma! Eu vou apresentar o ciclo do fósforo."

pasta = pathlib.Path(__file__).parent
saida = pasta / "audio"
js = (pasta / "script.js").read_text(encoding="utf-8")

# só o trecho das etapas da apresentação
inicio = js.index("const STEPS = [")
fim = js.index("\n];", inicio)
etapas = [re.findall(r'"((?:[^"\\]|\\.)*)"', bloco)
          for bloco in re.findall(r"lines: \[(.*?)\]", js[inicio:fim], re.S)]


async def gravar(texto, arquivo):
    await edge_tts.Communicate(texto, VOZ, rate="+5%").save(str(arquivo))


async def main():
    saida.mkdir(exist_ok=True)
    for velho in saida.glob("*.mp3"):
        velho.unlink()
    await gravar(AMOSTRA, saida / "amostra.mp3")
    for i, frases in enumerate(etapas):
        for j, frase in enumerate(frases):
            await gravar(frase, saida / f"s{i}_{j}.mp3")
    total = sum(len(f) for f in etapas)
    assert total == len(list(saida.glob("s*_*.mp3"))), "faltou gerar alguma frase"
    print(f"{len(etapas)} etapas, {total} frases gravadas em {saida}")


asyncio.run(main())
