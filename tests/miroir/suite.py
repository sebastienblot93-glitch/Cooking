import asyncio, json, sys, time, subprocess, os
from playwright.async_api import async_playwright

BOT = open(os.path.join(os.path.dirname(__file__),'bot.js')).read()
RESULTS = []

def report(name, ok, detail=''):
    RESULTS.append((name, ok, detail))
    print(('OK   ' if ok else 'FAIL ') + name + ('  — ' + detail if detail else ''), flush=True)

async def new_player(b, url, vp=(1366, 768)):
    ctx = await b.new_context(viewport={'width': vp[0], 'height': vp[1]})
    pg = await ctx.new_page()
    pg.errs = []
    pg.on('pageerror', lambda e: pg.errs.append(str(e)))
    pg.on('console', lambda m: pg.errs.append(m.text) if m.type == 'error' and 'Failed to load' not in m.text and 'ERR_' not in m.text else None)
    await pg.goto(url)
    await pg.wait_for_timeout(300)
    await pg.evaluate(BOT)
    return pg

async def state(pg):
    return await pg.evaluate('()=>window.__cm.state')

async def wait_state(pg, s, timeout=8):
    t0 = time.time()
    while time.time() - t0 < timeout:
        if await state(pg) == s:
            return True
        await pg.wait_for_timeout(100)
    return False

async def pair(b, url, vp=(1366, 768)):
    A = await new_player(b, url, vp)
    B = await new_player(b, url, vp)
    await A.click('[data-act=create]')
    await A.wait_for_timeout(400)
    code = await A.evaluate('()=>window.__cm.NET.code')
    await B.fill('#joinCode', code)
    await B.keyboard.press('Enter')
    ok = await wait_state(B, 'chars') and await wait_state(A, 'chars')
    return A, B, code, ok

async def play_level(A, B, i, timeout, shorten=None):
    await A.evaluate('()=>{window.__cm.OPTS.hints="always";}')
    st = await state(A)
    if st == 'chars':
        await A.keyboard.press('Space'); await A.wait_for_timeout(300)
    if await state(A)=='play':
        await A.evaluate('()=>{window.__cm.G.kitchens.forEach(K=>K.served=99);window.__cm.G.time=0.01;}'); await A.wait_for_timeout(600)
    if await A.locator(f'[data-act=brief][data-i="{i}"]').count()==0:
        await A.evaluate(f'()=>window.__cm.briefScreen&&0')
        await A.click('[data-act=menu]'); await A.wait_for_timeout(300)
    await A.click(f'[data-act=brief][data-i="{i}"]')
    okb = await wait_state(B, 'brief')
    await A.keyboard.press('Space'); await B.keyboard.press('Space')
    okp = await wait_state(A, 'play') and await wait_state(B, 'play')
    if not (okb and okp):
        return None
    if shorten:
        await A.evaluate(f'()=>{{window.__cm.G.time={shorten};}}')
    await A.evaluate('()=>{window.__idle=[0,0,0];clearInterval(window.__idleT);window.__idleT=setInterval(()=>{const G=window.__cm.G;if(window.__cm.state!=="play")return;window.__idle[2]++;G.players.forEach((p,i)=>{if(!p.hint&&!p.chopping&&!p.held)window.__idle[i]++;});},250);}')
    await A.evaluate('()=>window.__bot.start()'); await B.evaluate('()=>window.__bot.start()')
    t0 = time.time()
    while time.time() - t0 < timeout:
        if await state(A) == 'result':
            break
        await A.wait_for_timeout(500)
    await A.evaluate('()=>window.__bot.stop()'); await B.evaluate('()=>window.__bot.stop()')
    info = await A.evaluate('''()=>{const G=window.__cm.G;return {tot:G.served,lost:G.lost,served:G.kitchens.map(K=>K.served),score:G.score,el:Math.round(G.elapsed),found:G.links.filter(l=>l.found).length,total:G.links.length,state:window.__cm.state}}''')
    info['guest_state'] = await state(B)
    idl = await A.evaluate('()=>window.__idle')
    info['attente_soleil_%'] = round(100*idl[0]/max(1,idl[2])); info['attente_lune_%'] = round(100*idl[1]/max(1,idl[2]))
    info['secs'] = round(time.time() - t0)
    return info

async def main():
    srv = subprocess.Popen(['node', 'server.js'], cwd=os.path.join(os.path.dirname(__file__),'..','..'), env={**os.environ, 'PORT': '3123'}, stdout=subprocess.DEVNULL)
    prox = subprocess.Popen(['node', os.path.join(os.path.dirname(__file__),'..','delayproxy.js'), '3200', '3123', '45'])
    await asyncio.sleep(1)
    url = 'http://localhost:3123/miroir'
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--no-sandbox', '--autoplay-policy=no-user-gesture-required'])
        which = sys.argv[1] if len(sys.argv) > 1 else 'all'

        if which in ('all', 'edge'):
            # 1. mauvais code
            X = await new_player(b, url)
            await X.fill('#joinCode', 'ZZZZ'); await X.keyboard.press('Enter'); await X.wait_for_timeout(600)
            txt = await X.inner_text('#overlay')
            report('Code inconnu refusé avec message', 'introuvable' in txt.lower(), txt.split('\n')[-1][:60])
            await X.fill('#joinCode', 'AB'); await X.keyboard.press('Enter'); await X.wait_for_timeout(200)
            txt = await X.inner_text('#overlay')
            report('Code trop court refusé', '4 lettres' in txt, '')
            # 2. salle pleine
            A, B, code, ok = await pair(b, url)
            report('Création + connexion par code', ok, code)
            await X.fill('#joinCode', code); await X.keyboard.press('Enter'); await X.wait_for_timeout(600)
            txt = await X.inner_text('#overlay')
            report('3e joueur refusé (salle pleine)', 'complète' in txt, '')
            # 3. lien avec #code pré-rempli
            Y = await new_player(b, url + '#' + code)
            v = await Y.input_value('#joinCode')
            report('Lien partagé pré-remplit le code', v == code, v)
            await Y.context.close(); await X.context.close()
            # 4. choix de commis synchronisé
            await B.keyboard.press('ArrowRight'); await B.keyboard.press('ArrowRight'); await A.wait_for_timeout(400)
            ch = await A.evaluate('()=>{const s=document.querySelectorAll(".team.lune canvas");return s.length}')
            gsk = await B.evaluate('()=>window.__cm.NET&&JSON.parse(localStorage.getItem("cuisineMiroir.mySkin"))')
            report('Choix du commis de l’invité visible chez l’hôte', ch == 1 and gsk == 2, f'skin={gsk}')
            # 5. pause par l'invité, reprise par l'hôte, pendant la partie
            await A.keyboard.press('Space'); await A.wait_for_timeout(300)
            await A.click('[data-act=brief][data-i="0"]'); await wait_state(B, 'brief')
            await B.keyboard.press('Space'); await A.wait_for_timeout(300)
            s1 = await state(A)
            await A.keyboard.press('Space'); await wait_state(A, 'play'); await wait_state(B, 'play')
            report('La partie ne démarre que quand les deux sont prêts', s1 == 'brief', '')
            await B.keyboard.press('Escape'); await A.wait_for_timeout(400)
            pa, pb = await state(A), await state(B)
            t1 = await A.evaluate('()=>window.__cm.G.elapsed'); await A.wait_for_timeout(700); t2 = await A.evaluate('()=>window.__cm.G.elapsed')
            report('Pause de l’invité met les deux en pause et fige le jeu', pa == pb == 'pause' and abs(t2 - t1) < 0.01, '')
            await A.keyboard.press('Escape'); await A.wait_for_timeout(400)
            report('Reprise par l’hôte reprend chez les deux', await state(A) == 'play' and await state(B) == 'play', '')
            # 6. onglet caché -> pause
            await B.evaluate('()=>{Object.defineProperty(document,"hidden",{configurable:true,get:()=>true});document.dispatchEvent(new Event("visibilitychange"));}')
            await A.wait_for_timeout(400)
            report('Onglet caché met la partie en pause chez les deux', await state(A) == 'pause' and await state(B) == 'pause', '')
            await B.evaluate('()=>{Object.defineProperty(document,"hidden",{configurable:true,get:()=>false});}')
            await B.keyboard.press('Escape'); await A.wait_for_timeout(300)
            # 7. touche Espace ne déclenche pas les boutons de l'interface
            await A.click('#muteBtn'); await A.keyboard.press('Space'); await A.wait_for_timeout(200)
            mt = await A.inner_text('#muteBtn')
            report('Espace en jeu n’active pas un bouton cliqué avant', 'COUPÉ' in mt.upper(), mt)
            # 8. déconnexion de l'invité pendant la partie puis retour
            await B.context.close(); await A.wait_for_timeout(800)
            sa = await state(A); txt = await A.inner_text('#overlay')
            report('Départ de l’invité : l’hôte attend avec le même code', sa == 'lobby' and code in txt, '')
            B2 = await new_player(b, url)
            await B2.fill('#joinCode', code); await B2.keyboard.press('Enter')
            ok = await wait_state(B2, 'chars') and await wait_state(A, 'chars')
            report('L’invité peut revenir avec le même code', ok, '')
            # 9. départ de l'hôte
            await A.context.close(); await B2.wait_for_timeout(800)
            txt = await B2.inner_text('#overlay')
            report('Départ de l’hôte : salle fermée chez l’invité', 'FERMÉE' in txt.upper(), '')
            errs = B2.errs
            await B2.context.close()
            report('Aucune erreur JavaScript (tests de bord)', not errs and not A.errs and not B.errs, str((A.errs + B.errs + errs)[:3]))

        if which in ('all', 'campaign'):
            A, B, code, ok = await pair(b, url)
            import os as _o
            sel=_o.environ.get('LV')
            levels = [(0, 'Apéritif I', 150, None), (1, 'Apéritif II', 220, None), (2, 'Entrée I', 300, None), (3, 'Entrée II', 300, None), (4, 'Entrée III', 110, 90)]
            if sel: levels=[l for l in levels if str(l[0]) in sel.split(',')]
            for i, name, to, sh in levels:
                info = await play_level(A, B, i, to, sh)
                if info is None:
                    report(f'Campagne {name}', False, 'démarrage impossible'); continue
                goal = i <= 3
                need = [4,5,6,6][i] if goal else 3
                ok = info['state'] == 'result' and info['guest_state'] == 'result' and info['tot'] >= need
                report(f'Campagne {name} jouée au clavier par 2 joueurs', ok, json.dumps(info))
            bw = await B.evaluate('()=>0')
            report('Aucune erreur JavaScript (campagne)', not A.errs and not B.errs, str((A.errs + B.errs)[:3]))
            await A.context.close(); await B.context.close()

        if which in ('all', 'lag'):
            A, B, code, ok = await pair(b, 'http://localhost:3200/miroir')
            await A.wait_for_timeout(3500)
            ping = await B.evaluate('()=>window.__cm.NET.ping')
            info = await play_level(A, B, 1, 200, None)
            ok = info and info['state'] == 'result' and info['tot'] >= 5
            report(f'Apéritif II avec ~{ping} ms de latence réseau', bool(ok), json.dumps(info))
            # bande passante : taille moyenne d'un instantané
            size = await A.evaluate('()=>{const s=JSON.stringify(window.__cm.G?{}:{});return 0}')
            await A.context.close(); await B.context.close()

        if which in ('all', 'screens'):
            for vp in [(1280, 720), (1366, 768), (1920, 1080)]:
                A, B, code, ok = await pair(b, url, vp)
                await A.keyboard.press('Space'); await A.wait_for_timeout(200)
                await A.click('[data-act=brief][data-i="0"]'); await wait_state(B, 'brief')
                await A.keyboard.press('Space'); await B.keyboard.press('Space'); await wait_state(B, 'play')
                await B.wait_for_timeout(500)
                dims = await B.evaluate('()=>{const r=document.getElementById("game").getBoundingClientRect();const t=document.getElementById("tools").getBoundingClientRect();return [Math.round(r.width),Math.round(r.height),Math.round(t.bottom),innerHeight]}')
                await B.screenshot(path=f'vp_{vp[0]}.png')
                report(f'Écran {vp[0]}×{vp[1]} : jeu entièrement visible sans défiler', dims[2] <= dims[3] and dims[0] >= 900, str(dims))
                # taille des instantanés
                if vp[0] == 1366:
                    sz = await A.evaluate('''()=>new Promise(res=>{const ws=window.__cm.NET.ws;const orig=ws.send.bind(ws);let n=0,bytes=0;ws.send=d=>{if(d.includes('"snap"')){n++;bytes+=d.length;}orig(d);};setTimeout(()=>{ws.send=orig;res([n,bytes])},2000);})''')
                    report('Débit réseau raisonnable', sz[1] / 2 < 60000, f'{sz[0]/2:.0f} instantanés/s, {sz[1]/2/1024:.1f} Ko/s')
                await A.context.close(); await B.context.close()

        await b.close()
    srv.terminate(); prox.terminate()
    print('\nRÉSUMÉ :', sum(1 for r in RESULTS if r[1]), '/', len(RESULTS), 'OK')

if __name__=="__main__":
    asyncio.run(main())
