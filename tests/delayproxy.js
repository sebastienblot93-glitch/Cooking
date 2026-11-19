// Proxy TCP qui ajoute une latence fixe dans chaque sens (simulation d'Internet).
const net=require('net');
const [,,listen,target,delay]=process.argv;
net.createServer(c=>{
  const s=net.connect(+target,'127.0.0.1');
  const pipe=(a,b)=>a.on('data',d=>setTimeout(()=>{if(!b.destroyed)b.write(d);},+delay));
  pipe(c,s);pipe(s,c);
  const end=()=>{c.destroy();s.destroy();};
  c.on('error',end);s.on('error',end);c.on('close',end);s.on('close',end);
}).listen(+listen);
