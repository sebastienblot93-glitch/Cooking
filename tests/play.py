# Deux joueurs automatiques jouent un niveau au clavier, chacun dans son navigateur, via le serveur.
# Usage : python tests/play.py <niveau 0|1> <secondes réelles>
import asyncio, json, sys, time
LEVEL_NAMES=['1-1','1-2']
from playwright.async_api import async_playwright
import os, subprocess
HERE=os.path.dirname(os.path.abspath(__file__))
BOT=open(os.path.join(HERE,'bot.js')).read()
async def page(b):
  ctx=await b.new_context(viewport={'width':1100,'height':650}); pg=await ctx.new_page(); pg.errs=[]
  pg.on('pageerror',lambda e:pg.errs.append(str(e))); pg.on('console',lambda m:pg.errs.append(m.text) if m.type=='error' and 'Failed to load' not in m.text and 'ERR_' not in m.text else None)
  await pg.goto('http://localhost:3123/'); await pg.wait_for_timeout(400); await pg.evaluate(BOT); await pg.evaluate('()=>{window.__noRender=true}'); return pg
async def st(pg): return await pg.evaluate('()=>window.__cm.state')
async def main():
  lv=int(sys.argv[1]) if len(sys.argv)>1 else 0; secs=int(sys.argv[2]) if len(sys.argv)>2 else 200
  srv=subprocess.Popen(['node','server.js'],cwd=os.path.join(HERE,'..'),env={**os.environ,'PORT':'3123'},stdout=subprocess.DEVNULL); await asyncio.sleep(1)
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    A=await page(b);B=await page(b)
    await A.click('[data-act=create]'); await A.wait_for_timeout(400); code=await A.evaluate('()=>window.__cm.NET.code')
    await B.fill('#joinCode',code); await B.keyboard.press('Enter')
    await A.wait_for_selector('.chars',timeout=10000); await A.wait_for_timeout(200)
    await A.keyboard.press('Space'); await A.wait_for_selector('.levels',timeout=10000)
    await A.click(f'[data-act=brief][data-i="{lv}"]'); await B.wait_for_timeout(400)
    await B.wait_for_selector('#readyBtn',timeout=10000)
    await A.keyboard.press('Space'); await B.keyboard.press('Space'); await A.wait_for_timeout(800)
    await A.evaluate('()=>window.__bot.start()'); await B.evaluate('()=>window.__bot.start()')
    D='()=>{const G=window.__cm.G;return {t:Math.round(G.elapsed),score:G.score,served:G.served,lost:G.lost,orders:G.orders.map(o=>o.r).join(","),goalA:window.__bot.st.goal,held:G.players.map(p=>p.held?JSON.stringify(p.held):"-"),pots:G.tiles.flat().filter(t=>t.pot).map(t=>t.pot.c.length+(t.pot.done?"D":"")+(t.pot.burnt?"B":"")+(t.fire?"F":"")).join(" "),rack:G.tiles.flat().find(t=>t.type==="rack").cnt,dirty:G.tiles.flat().find(t=>t.type==="dirty").cnt,sink:G.tiles.flat().find(t=>t.type==="sink").dirty}}'
    t0=time.time()
    while time.time()-t0<secs:
      await A.wait_for_timeout(8000)
      a=await A.evaluate(D); gb=await B.evaluate('()=>window.__bot.st.goal')
      print(json.dumps(a),'| B:',gb,flush=True)
      if await st(A)=='result': break
    a=await A.evaluate(D)
    print(('OK  ' if a['served']>=4 and a['lost']<=2 and not A.errs and not B.errs else 'ÉCHEC ')+f"niveau {LEVEL_NAMES[lv]} : {a['served']} plats servis, {a['lost']} ratés, {a['score']} points")
    await b.close()
  srv.terminate()
asyncio.run(main())
