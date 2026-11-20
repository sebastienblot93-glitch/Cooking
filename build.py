# Assemble les fichiers de src/ en un seul index.html (aucune dépendance).
import os
H=os.path.dirname(os.path.abspath(__file__));S=os.path.join(H,'src')
js='\n'.join(open(os.path.join(S,f),encoding='utf8').read() for f in ['engine.js','game.js','view.js','hud.js','ui.js'])
open(os.path.join(H,'index.html'),'w',encoding='utf8').write(open(os.path.join(S,'shell.html'),encoding='utf8').read().replace('/*SCRIPTS*/',js))
print('index.html reconstruit')
