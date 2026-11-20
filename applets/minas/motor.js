/* Copia literal del MOTOR del Duelo de divisibilidad (index.html, bloque «MOTOR (sin DOM)»).
   No editar aquí: si cambia el motor del duelo, volver a copiarlo. Lo usa facil.html. */
/* =====================================================================
   πCHU ROYALE 2 · El reino de la divisibilidad — MOTOR (sin DOM)
   Cada turno el rival lanza una CARTA DE RETO (divisores, factorización,
   MCD y mcm) y el jugador la resuelve con las cartas de su mano.
   Toda la aritmética es entera y exacta.
   ===================================================================== */
(function(root){
'use strict';
/* ---------- 1. Aritmética ---------- */
const mcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b)[a,b]=[b,a%b];return a;};
const mcm=(a,b)=>a&&b?Math.abs(a/mcd(a,b)*b):0;
const esPrimo=n=>{if(!Number.isInteger(n)||n<2)return false;for(let d=2;d*d<=n;d++)if(n%d===0)return false;return true;};
const factores=n=>{const out=[];for(let d=2;d*d<=n;d++)while(n%d===0){out.push(d);n/=d;}if(n>1)out.push(n);return out;};
const divisores=n=>{const out=[];for(let d=1;d<=n;d++)if(n%d===0)out.push(d);return out;};
const nDiv=n=>divisores(n).length;
const menorPrimo=n=>n<2?1:factores(n)[0];
/* 72 → «2³ · 3²» (con <sup> para la pantalla) */
function potencias(n,html=true){if(n<2)return String(n);const m=new Map();for(const p of factores(n))m.set(p,(m.get(p)||0)+1);return [...m].map(([p,e])=>e>1?(html?`${p}<sup>${e}</sup>`:`${p}^${e}`):`${p}`).join(' · ');}
const fichasCarta=n=>2*nDiv(n);
const azar=(a,rng)=>a[Math.floor(rng()*a.length)];
const barajar=(a,rng)=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const TAM_MANO=8,MAX_CARTA=999;

/* ---------- 2. Tipos de reto ---------- */
const RETOS={
 divisores:  {tema:'div',ico:'🎯',nombre:'Cazadivisores',fichas:20,mult:2},
 pareja:     {tema:'div',ico:'🤝',nombre:'Pareja de divisores',fichas:30,mult:3},
 cuantos:    {tema:'div',ico:'🔢',nombre:'¿Cuántos divisores?',fichas:40,mult:3,mental:true},
 intruso:    {tema:'div',ico:'🕵️',nombre:'El intruso',fichas:35,mult:3},
 factoriza:  {tema:'fac',ico:'🌳',nombre:'Factoriza',fichas:35,mult:3},
 primos:     {tema:'fac',ico:'💎',nombre:'Caza primos',fichas:20,mult:2},
 reconstruye:{tema:'fac',ico:'🧩',nombre:'Reconstruye el número',fichas:40,mult:3,mental:true},
 mcd:        {tema:'mm', ico:'🧠',nombre:'MCD mental',fichas:45,mult:3,mental:true},
 mcm:        {tema:'mm', ico:'🧠',nombre:'mcm mental',fichas:45,mult:3,mental:true},
 problema:   {tema:'mm', ico:'🤔',nombre:'¿MCD o mcm?',fichas:60,mult:4},
 comun:      {tema:'mm', ico:'🔗',nombre:'Múltiplo común',fichas:30,mult:2},
 secreto:    {tema:'mix',ico:'❓',nombre:'Número secreto',fichas:55,mult:4,mental:true}
};
const TEMAS={div:'Divisores',fac:'Primos y factorización',mm:'MCD y mcm',mix:'Mezcla'};

/* Elige valores de relleno que NO cumplen una condición, distintos entre sí y de los ya usados */
function rellenar(usados,candidatos,cuantos,malo,rng){
 const out=[],ya=new Set(usados);
 for(const v of barajar(candidatos,rng)){if(out.length>=cuantos)break;if(!ya.has(v)&&Number.isInteger(v)&&v>=1&&v<=MAX_CARTA&&!malo(v)){out.push(v);ya.add(v);}}
 for(let v=2;out.length<cuantos&&v<=MAX_CARTA;v++)if(!ya.has(v)&&!malo(v)){out.push(v);ya.add(v);}
 return out;
}
const unicos=a=>[...new Set(a)];

/* ---------- 3. Generadores (devuelven enunciado, mano y datos) ---------- */
const POOL={
 div:[[12,18,20,24,30,36],[40,42,48,54,56,60,72,84,90,96]],
 cuantos:[[6,8,10,12,14,15,16,18,20,21],[24,28,30,32,36,40,45,48,60,72]],
 intruso:[[24,30,36,40],[48,60,72,84,90]],
 factoriza:[[12,18,20,28,30,42,45,50],[24,36,40,54,60,63,72,84,90,98,100]],
 reconstruye:[[12,18,20,28,30,45,50],[60,72,84,90,100,120,126,150,180]],
 mcd:[[[12,18],[8,12],[15,20],[16,24],[10,25],[14,21],[18,24],[9,12]],[[24,36],[36,48],[30,45],[42,56],[48,72],[45,60],[60,90],[28,42]]],
 mcm:[[[4,6],[6,8],[6,9],[4,10],[3,5],[8,12],[10,15],[6,10]],[[12,18],[15,20],[12,16],[9,12],[10,12],[14,21],[18,24],[20,30]]]
};
const nv=n=>n>=2?1:0;
const GEN={
 divisores(nivel,rng){
  const N=azar(POOL.div[nv(nivel)],rng),ds=divisores(N),k=Math.min(ds.length,4+Math.floor(rng()*2));
  const sol=barajar(ds,rng).slice(0,k);
  const casi=[...unicos(factores(N).flatMap(p=>[p*5,p*7,p*9,p*11])),N+1,N-1,N+2,2*N,N/2+1,7,9,11,13,16,25].filter(v=>v>0);
  const otros=rellenar(sol,casi,TAM_MANO-sol.length,v=>N%v===0,rng);
  return {datos:{N},enunciado:`Juega <b>divisores de ${N}</b>`,instruccion:'2 o más cartas. ¡Cuantas más, más daño!',min:2,max:5,valores:[...sol,...otros],
   pista:`Un divisor de ${N} lo divide sin resto: ${N} ÷ d da un número entero. Prueba con 2, 3, 5…`};
 },
 pareja(nivel,rng){
  const N=azar(POOL.div[nv(nivel)],rng),ds=divisores(N).filter(d=>d>1&&d<N),pares=unicos(ds.map(d=>Math.min(d,N/d))).map(d=>[d,N/d]).filter(([a,b])=>a!==b);
  const elegidas=barajar(pares,rng).slice(0,2),sol=unicos(elegidas.flat());
  const otros=rellenar(sol,[N+1,N-1,N/2+1,2*N,...ds.map(d=>d+1),5,7,9,11,13,14,15,16].filter(v=>v>1),TAM_MANO-sol.length,v=>sol.some(s=>s*v===N)||v*v===N||v===1,rng);
  return {datos:{N},enunciado:`Encuentra <b>dos cartas que multiplicadas den ${N}</b>`,instruccion:'Exactamente 2 cartas: una pareja de divisores.',min:2,max:2,valores:[...sol,...otros],
   pista:`Busca un divisor pequeño de ${N} y piensa: ${N} ÷ ese número = ¿? Por ejemplo, ${N} = ${elegidas[0][0]} × ¿?`};
 },
 cuantos(nivel,rng){
  const N=azar(POOL.cuantos[nv(nivel)],rng),d=nDiv(N);
  const otros=rellenar([d],[d-1,d+1,d+2,d-2,d*2,N/2,factores(N).length,unicos(factores(N)).length,N].filter(v=>v>=1&&Number.isInteger(v)),TAM_MANO-1,v=>v===d,rng);
  return {datos:{N,d},enunciado:`¿<b>Cuántos divisores</b> tiene el <b>${N}</b>?`,instruccion:'Juega la carta con la respuesta.',min:1,max:1,valores:[d,...otros],
   pista:`Busca los divisores por parejas: 1 × ${N}, 2 × ${N%2?'¿?':N/2}… y cuéntalos todos.`};
 },
 intruso(nivel,rng){
  const N=azar(POOL.intruso[nv(nivel)],rng),ds=barajar(divisores(N),rng).slice(0,TAM_MANO-1);
  const intr=azar([...factores(N).flatMap(p=>[p*p*p*p,p*7,p*11]),N+2,N-2,N/2+1,9,14,16,25,27].filter(v=>v>1&&v<=MAX_CARTA&&N%v!==0&&!ds.includes(v)),rng);
  return {datos:{N,intruso:intr},enunciado:`¿Qué carta <b>NO es divisor de ${N}</b>?`,instruccion:'Juega solo el intruso.',min:1,max:1,valores:[...ds,intr],
   pista:`Divide ${N} entre cada carta: el intruso es la que deja resto.`};
 },
 factoriza(nivel,rng){
  const N=azar(POOL.factoriza[nv(nivel)],rng),f=factores(N);
  const comp=divisores(N).filter(d=>d>1&&d<N&&!esPrimo(d));
  const trampas=rellenar(f,[...comp,1,...[2,3,5,7,11,13].filter(p=>N%p!==0)],TAM_MANO-f.length,()=>false,rng);
  return {datos:{N},enunciado:`<b>Factoriza el ${N}</b>`,instruccion:`Juega sus factores primos (puedes repetir). Su producto debe ser ${N}.`,min:2,max:5,valores:[...f,...trampas],
   pista:`Divide ${N} entre el primo más pequeño que puedas (2, 3, 5…) y repite con el cociente hasta llegar a 1.`};
 },
 primos(nivel,rng){
  const P=nv(nivel)?[17,19,23,29,31,37,41,43,47,53]:[2,3,5,7,11,13],T=nv(nivel)?[1,27,33,39,49,51,57,63,77,87,91]:[1,4,6,8,9,10,15,21,25];
  const k=3+Math.floor(rng()*2),sol=barajar(P,rng).slice(0,k),otros=barajar(T,rng).slice(0,TAM_MANO-k);
  return {datos:{},enunciado:'<b>Caza los números primos</b>',instruccion:'2 o más primos. Si los cazas todos: ¡PERFECTO!',min:2,max:5,valores:[...sol,...otros],
   pista:'Un primo solo tiene dos divisores: el 1 y él mismo. Cuidado con el 1, el 51 = 3 · 17 o el 91 = 7 · 13.'};
 },
 reconstruye(nivel,rng){
  const N=azar(POOL.reconstruye[nv(nivel)],rng),f=factores(N),sinExp=unicos(f).reduce((a,b)=>a*b,1),suma=f.reduce((a,b)=>a+b,0);
  const otros=rellenar([N],[sinExp,suma,N*2,N/2,N+f[0],N-f[0],unicos(f).reduce((a,b)=>a+b,0)*2,N+10].filter(v=>Number.isInteger(v)&&v>1),TAM_MANO-1,v=>v===N,rng);
  return {datos:{N},enunciado:`¿Qué número es <b>${potencias(N)}</b>?`,instruccion:'Juega la carta con el resultado.',min:1,max:1,valores:[N,...otros],
   pista:`Una potencia es una multiplicación repetida: ${f[0]}<sup>2</sup> = ${f[0]} · ${f[0]}. Multiplica todos los factores.`};
 },
 mcd(nivel,rng){
  const [a,b]=azar(POOL.mcd[nv(nivel)],rng),g=mcd(a,b),l=mcm(a,b);
  const otros=rellenar([g],[l,a,b,...divisores(g).filter(d=>d<g&&d>1),g*2,a-b>0?a-b:b-a,g+1,a*b<=MAX_CARTA?a*b:l*2].filter(v=>v>=1),TAM_MANO-1,v=>v===g,rng);
  return {datos:{a,b,g,l},enunciado:`<b>MCD(${a}, ${b})</b> = ¿?`,instruccion:'Cálculo mental: juega el máximo común divisor.',min:1,max:1,valores:[g,...otros],
   pista:`Busca el mayor número que divide a la vez a ${a} y a ${b}. Prueba desde el más pequeño de los dos hacia abajo.`};
 },
 mcm(nivel,rng){
  const [a,b]=azar(POOL.mcm[nv(nivel)],rng),g=mcd(a,b),l=mcm(a,b);
  const otros=rellenar([l],[g,a*b,a+b,l*2,l+a,Math.max(a,b),l-g>0&&l-g!==l?l-g:l*3].filter(v=>v>=1&&v<=MAX_CARTA),TAM_MANO-1,v=>v===l,rng);
  return {datos:{a,b,g,l},enunciado:`<b>mcm(${a}, ${b})</b> = ¿?`,instruccion:'Cálculo mental: juega el mínimo común múltiplo.',min:1,max:1,valores:[l,...otros],
   pista:`Recorre la tabla del ${Math.max(a,b)}: ${Math.max(a,b)}, ${2*Math.max(a,b)}, ${3*Math.max(a,b)}… El primero que también esté en la tabla del ${Math.min(a,b)} es el mcm.`};
 },
 problema(nivel,rng){
  const usa=rng()<.5?'mcd':'mcm',[a,b]=azar(POOL[usa][nv(nivel)],rng),g=mcd(a,b),l=mcm(a,b),res=usa==='mcd'?g:l;
  const H=usa==='mcd'?HISTORIAS_MCD:HISTORIAS_MCM,h=azar(H,rng);
  const nums=rellenar([g,l],[a*b<=MAX_CARTA?a*b:l*2,a+b,Math.max(a,b),Math.min(a,b),l*2,g*2].filter(v=>v>=1),TAM_MANO-4,v=>v===g||v===l,rng);
  return {datos:{a,b,g,l,usa,res},enunciado:h.t(a,b),instruccion:'Juega la carta de operación (MCD o mcm) y la carta con el resultado.',min:2,max:2,ops:['MCD','mcm'],valores:[g,l,...nums],
   pista:usa==='mcd'?'¿Hay que <b>repartir o cortar</b> en partes iguales lo más grandes posible? Eso es dividir: piensa en divisores.':'¿Buscamos cuándo <b>vuelven a coincidir</b> dos cosas que se repiten? Eso es avanzar por tablas: piensa en múltiplos.',
   porque:h.p};
 },
 comun(nivel,rng){
  const [a,b]=azar(POOL.mcm[nv(nivel)],rng),l=mcm(a,b),sol=[l,2*l].filter(v=>v<=MAX_CARTA);
  const soloUno=unicos([a*3,a*5,b*3,b*5,a*7,b*7,a*b+a,l+a,l+b].filter(v=>v<=MAX_CARTA&&v%l!==0));
  const otros=rellenar(sol,soloUno,TAM_MANO-sol.length,v=>v%a===0&&v%b===0,rng);
  return {datos:{a,b,l},enunciado:`Juega <b>múltiplos comunes de ${a} y ${b}</b>`,instruccion:'1 o más cartas que estén en las dos tablas. Con el más pequeño (el mcm): ¡PERFECTO!',min:1,max:5,valores:[...sol,...otros],
   pista:`Un múltiplo común está en la tabla del ${a} y también en la del ${b}.`};
 },
 secreto(nivel,rng){
  const modo=azar(['entre','primo','tres'],rng);
  if(modo==='entre'){const [p,q]=azar(POOL.mcm[nv(nivel)],rng),l=mcm(p,q),k=1+Math.floor(rng()*2),x=l*k,lo=x-Math.ceil(l/2),hi=x+Math.floor(l/2);
   const conds=[v=>v%p===0,v=>v%q===0,v=>v>lo&&v<hi],ok=v=>conds.every(c=>c(v));
   const otros=rellenar([x],[p*Math.round(x/p)+p,q*Math.round(x/q)+q,p*Math.round(x/p)-p,q*Math.round(x/q)-q,x+l,x-l,x+p,x+q,x-p].filter(v=>v>1),TAM_MANO-1,ok,rng);
   return {datos:{modo,x,p,q,lo,hi},enunciado:`Número secreto: soy <b>múltiplo de ${p} y de ${q}</b> y estoy <b>entre ${lo} y ${hi}</b>.`,instruccion:'Juega el número secreto.',min:1,max:1,valores:[x,...otros],pista:`Los múltiplos comunes de ${p} y ${q} son los múltiplos de su mcm, ${l}.`};}
  if(modo==='primo'){const N=azar(nv(nivel)?[66,78,102,110,130,154,170,182]:[22,26,34,38,39,46,51,57],rng),fs=unicos(factores(N)),x=fs[fs.length-1],k=fs.length>1?fs[fs.length-2]:1;
   const ok=v=>esPrimo(v)&&N%v===0&&v>k;
   const otros=rellenar([x],[...fs.filter(f=>f!==x),N,N/x*2,x+2,x+4,x*2,1,9,15,21,x-1].filter(v=>v>=1&&Number.isInteger(v)),TAM_MANO-1,ok,rng);
   return {datos:{modo,x,N,k},enunciado:`Número secreto: soy <b>primo</b>, <b>divido a ${N}</b> y soy <b>mayor que ${k}</b>.`,instruccion:'Juega el número secreto.',min:1,max:1,valores:[x,...otros],pista:`Factoriza ${N} y quédate con el factor primo mayor que ${k}.`};}
  const top=nv(nivel)?60:30,cand=[4,9,25,49].filter(v=>v<top),x=azar(cand,rng),ok=v=>v<top&&nDiv(v)===3;
  const otros=rellenar([x],[2,3,5,6,8,10,12,16,18,27,x+1,x*2,36,top+top%2*0+4].filter(v=>v>=1),TAM_MANO-1,ok,rng);
  return {datos:{modo,x,top},enunciado:`Número secreto: tengo <b>exactamente 3 divisores</b> y soy <b>menor que ${top}</b>.`,instruccion:'Juega el número secreto.',min:1,max:1,valores:[x,...otros],pista:'Prueba con cuadrados de primos: 2 · 2 = 4 tiene los divisores 1, 2 y 4.'};
 }
};
const HISTORIAS_MCM=[
 {t:(a,b)=>`Dos faros se encienden cada <b>${a}</b> y cada <b>${b}</b> segundos. Acaban de encenderse a la vez. ¿Dentro de cuántos segundos vuelven a coincidir?`,p:'buscamos cuándo vuelven a coincidir dos cosas que se repiten: un múltiplo común, el más pequeño.'},
 {t:(a,b)=>`Lucía va a la piscina cada <b>${a}</b> días y Marcos cada <b>${b}</b>. Hoy han coincidido. ¿Dentro de cuántos días volverán a coincidir?`,p:'los días en que va cada uno son múltiplos; coinciden en el primer múltiplo común.'},
 {t:(a,b)=>`Apilamos cajas de <b>${a}</b> cm en una torre y de <b>${b}</b> cm en otra. ¿Cuál es la altura más pequeña en la que las dos torres miden lo mismo?`,p:'las alturas de cada torre son múltiplos de su caja; buscamos el primero que comparten.'},
 {t:(a,b)=>`Un autobús pasa cada <b>${a}</b> minutos y un tranvía cada <b>${b}</b>. Acaban de salir juntos. ¿Cuántos minutos faltan para que vuelvan a salir juntos?`,p:'es un encuentro que se repite: el mínimo común múltiplo.'}
];
const HISTORIAS_MCD=[
 {t:(a,b)=>`Tenemos <b>${a}</b> caramelos de fresa y <b>${b}</b> de limón. Queremos hacer bolsas iguales, con el mayor número posible de caramelos y sin mezclar sabores ni que sobre ninguno. ¿Cuántos caramelos lleva cada bolsa?`,p:'repartimos en grupos iguales lo más grandes posible: un divisor común, el mayor.'},
 {t:(a,b)=>`Queremos cortar dos cuerdas de <b>${a}</b> cm y <b>${b}</b> cm en trozos iguales, lo más largos posible y sin que sobre nada. ¿Cuánto mide cada trozo?`,p:'cortar en trozos iguales sin que sobre es dividir: el mayor divisor común.'},
 {t:(a,b)=>`Un suelo mide <b>${a}</b> dm por <b>${b}</b> dm. Queremos cubrirlo con baldosas cuadradas iguales, lo más grandes posible y sin cortar ninguna. ¿Cuántos dm mide el lado de cada baldosa?`,p:'el lado de la baldosa tiene que caber justo en los dos lados: es el mayor divisor común.'},
 {t:(a,b)=>`En el torneo hay <b>${a}</b> chicas y <b>${b}</b> chicos. Queremos formar el mayor número posible de equipos iguales (con las mismas chicas y los mismos chicos en cada uno). ¿Cuántos equipos formamos?`,p:'repartir en el mayor número de grupos iguales es buscar el mayor divisor común.'}
];

/* ---------- 4. Evaluación de una respuesta ---------- */
const ok=(explicacion,perfecto=false)=>({ok:true,perfecto,explicacion});
const mal=error=>({ok:false,error});
function evaluar(reto,cartas){
 const d=reto.datos,nums=cartas.filter(c=>c.n!==undefined).map(c=>c.n),ops=cartas.filter(c=>c.op).map(c=>c.op),k=cartas.length;
 if(!k)return mal('Elige alguna carta.');
 if(k<reto.min)return mal(reto.min===1?'Elige una carta.':`Este reto necesita al menos ${reto.min} cartas.`);
 if(k>reto.max)return mal(reto.max===1?'Este reto se responde con una sola carta.':`Este reto admite como mucho ${reto.max} cartas.`);
 if(ops.length&&reto.tipo!=='problema')return mal('Las cartas MCD y mcm solo sirven en los problemas.');
 const enMano=reto.mano?reto.mano.filter(c=>c.n!==undefined).map(c=>c.n):[];
 switch(reto.tipo){
  case 'divisores':{
   if(new Set(nums).size!==nums.length)return mal('Escoge divisores distintos.');
   const x=nums.find(v=>d.N%v!==0);if(x!==undefined)return mal(`${x} no es divisor de ${d.N}: ${d.N} ÷ ${x} = ${Math.floor(d.N/x)} y sobra ${d.N%x}.`);
   const todos=enMano.filter(v=>d.N%v===0);
   return ok(nums.slice().sort((a,b)=>a-b).map(v=>`${d.N} ÷ ${v} = ${d.N/v}`).join(' · '),nums.length>=3&&todos.every(v=>nums.includes(v)));}
  case 'pareja':{const [x,y]=nums;if(x*y!==d.N)return mal(`${x} × ${y} = ${x*y}, no ${d.N}.${d.N%x===0?` Para llegar a ${d.N} con el ${x} necesitas el ${d.N/x}.`:''}`);
   return ok(`${x} × ${y} = ${d.N}: ${x} y ${y} son una pareja de divisores de ${d.N}.`,x!==1&&y!==1);}
  case 'cuantos':{const [x]=nums;const lista=divisores(d.N).join(', ');if(x!==d.d)return mal(`${d.N} tiene ${d.d} divisores, no ${x}: ${lista}.`);return ok(`Divisores de ${d.N}: ${lista} → ${d.d} divisores.`);}
  case 'intruso':{const [x]=nums;if(d.N%x===0)return mal(`${x} sí es divisor de ${d.N}: ${d.N} = ${x} × ${d.N/x}. Busca otra.`);return ok(`${d.N} ÷ ${x} = ${Math.floor(d.N/x)} y sobra ${d.N%x}: ¡${x} es el intruso!`);}
  case 'factoriza':{const x=nums.find(v=>!esPrimo(v));if(x!==undefined)return mal(x===1?'El 1 no es primo: no forma parte de la factorización.':`${x} no es primo: ${x} = ${factores(x).join(' · ')}. Usa solo primos.`);
   const p=nums.reduce((a,b)=>a*b,1);if(p!==d.N)return mal(`${nums.join(' · ')} = ${p}, no ${d.N}.${d.N%p===0?` Te falta multiplicar por ${d.N/p}.`:''}`);
   return ok(`${d.N} = ${potencias(d.N)} = ${factores(d.N).join(' · ')}`);}
  case 'primos':{if(new Set(nums).size!==nums.length)return mal('Escoge primos distintos.');const x=nums.find(v=>!esPrimo(v));
   if(x!==undefined)return mal(x===1?'El 1 no es primo: solo tiene un divisor.':`${x} no es primo: ${x} = ${factores(x).join(' · ')}.`);
   return ok(nums.map(v=>`${v}: divisores 1 y ${v}`).join(' · '),enMano.filter(esPrimo).every(v=>nums.includes(v)));}
  case 'reconstruye':{const [x]=nums;if(x!==d.N){const f=factores(d.N);return mal(`${potencias(d.N)} = ${f.join(' · ')} = ${d.N}. ${x===unicos(f).reduce((a,b)=>a*b,1)?'¡Te has olvidado de los exponentes!':x===f.reduce((a,b)=>a+b,0)?'¡Cuidado! Los factores se multiplican, no se suman.':''}`);}return ok(`${potencias(d.N)} = ${factores(d.N).join(' · ')} = ${d.N}`);}
  case 'mcd':{const [x]=nums;if(x!==d.g)return mal(`${x===d.l?'Ese es el mcm, el más pequeño de los múltiplos comunes. ':''}MCD(${d.a}, ${d.b}) = ${d.g}: ${explicaMCD(d.a,d.b)}`);return ok(`MCD(${d.a}, ${d.b}) = ${d.g}: ${explicaMCD(d.a,d.b)}`);}
  case 'mcm':{const [x]=nums;if(x!==d.l)return mal(`${x===d.a*d.b&&d.a*d.b!==d.l?`${d.a} · ${d.b} = ${x} es un múltiplo común, pero no el menor. `:x===d.g?'Ese es el MCD. ':''}mcm(${d.a}, ${d.b}) = ${d.l}: ${explicaMCM(d.a,d.b)}`);return ok(`mcm(${d.a}, ${d.b}) = ${d.l}: ${explicaMCM(d.a,d.b)}`);}
  case 'problema':{
   if(ops.length!==1||nums.length!==1)return mal('Juega una carta de operación (MCD o mcm) y una carta de número.');
   const op=ops[0]==='MCD'?'mcd':'mcm',[x]=nums,nombre=d.usa==='mcd'?'MCD':'mcm';
   if(op!==d.usa)return mal(`Aquí no es ${ops[0]}: ${reto.porque} Por eso es el ${nombre}(${d.a}, ${d.b}) = ${d.res}.`);
   if(x!==d.res)return mal(`¡Bien elegido el ${nombre}! Pero ${nombre}(${d.a}, ${d.b}) = ${d.res}, no ${x}: ${d.usa==='mcd'?explicaMCD(d.a,d.b):explicaMCM(d.a,d.b)}`);
   return ok(`Es el ${nombre} porque ${reto.porque} ${nombre}(${d.a}, ${d.b}) = ${d.res}.`);}
  case 'comun':{if(new Set(nums).size!==nums.length)return mal('Escoge cartas distintas.');const x=nums.find(v=>v%d.a!==0||v%d.b!==0);
   if(x!==undefined)return mal(`${x} ${x%d.a===0?`es múltiplo de ${d.a}`:`no es múltiplo de ${d.a}`} y ${x%d.b===0?`es múltiplo de ${d.b}`:`no es múltiplo de ${d.b}`}: tiene que estar en las dos tablas.`);
   return ok(nums.map(v=>`${v} = ${d.a} · ${v/d.a} = ${d.b} · ${v/d.b}`).join(' · ')+(nums.includes(d.l)?` · ¡${d.l} es el mcm!`:''),nums.includes(d.l));}
  case 'secreto':{const [x]=nums;
   if(d.modo==='entre'){if(x===d.x)return ok(`${x} = ${d.p} · ${x/d.p} = ${d.q} · ${x/d.q} y está entre ${d.lo} y ${d.hi}.`);
    return mal(x%d.p?`${x} no es múltiplo de ${d.p}.`:x%d.q?`${x} no es múltiplo de ${d.q}.`:`${x} no está entre ${d.lo} y ${d.hi}.`);}
   if(d.modo==='primo'){if(x===d.x)return ok(`${d.N} = ${factores(d.N).join(' · ')} y ${x} es su factor primo mayor que ${d.k}.`);
    return mal(!esPrimo(x)?`${x} no es primo.`:d.N%x?`${x} no divide a ${d.N}.`:`${x} no es mayor que ${d.k}.`);}
   if(x===d.x)return ok(`${x} tiene exactamente 3 divisores: ${divisores(x).join(', ')}.`);
   return mal(x>=d.top?`${x} no es menor que ${d.top}.`:`${x} tiene ${nDiv(x)} divisores: ${divisores(x).join(', ')}.`);}
 }
 return mal('Reto desconocido.');
}
function explicaMCD(a,b){return `${a} = ${potencias(a)}, ${b} = ${potencias(b)} → factores comunes con el menor exponente.`;}
function explicaMCM(a,b){return `${a} = ${potencias(a)}, ${b} = ${potencias(b)} → factores comunes y no comunes con el mayor exponente.`;}

/* Mejor respuesta posible con la mano (pistas, solución revelada, jugador automático y pruebas) */
function resolver(reto,mano=reto.mano){
 let mejor=null;const n=mano.length;
 for(let m=1;m<(1<<n);m++){const sel=mano.filter((_,i)=>m>>i&1);if(sel.length<reto.min||sel.length>reto.max)continue;const e=evaluar(reto,sel);
  if(e.ok){const v=(e.perfecto?100:0)+sel.length;if(!mejor||v>mejor.v)mejor={v,ids:sel.map(c=>c.id),perfecto:e.perfecto};}}
 return mejor;
}
function solucionTexto(reto){const s=resolver(reto);if(!s)return '';return s.ids.map(id=>{const c=reto.mano.find(x=>x.id===id);return c.op||c.n;}).join(' + ');}

/* ---------- 5. Héroes ---------- */
const HEROES={
 gauss:{nombre:'Gauss',art:'gauss',titulo:'El estratega',color:'#3F8A6E',frase:'¡Factorizado!',texto:'×2 multiplicador en Factoriza y Reconstruye el número.'},
 hipatia:{nombre:'Hipatia',art:'hipatia',titulo:'La geómetra',color:'#A07B2E',frase:'¡Divisores a la vista!',texto:'+10 fichas por cada carta jugada en retos de divisores.'},
 ada:{nombre:'Ada Lovelace',art:'ada',titulo:'La visionaria',color:'#3D6A8F',frase:'¡Problema resuelto!',texto:'+3 multiplicador en ¿MCD o mcm? y Múltiplo común.'},
 turing:{nombre:'Alan Turing',art:'turing',titulo:'El descifrador',color:'#466E80',frase:'¡Primo descifrado!',texto:'+12 fichas por cada carta prima que juegas.'},
 ramanujan:{nombre:'Ramanujan',art:'ramanujan',titulo:'El intuitivo',color:'#8A6A1E',frase:'¡Lo vi en mi mente!',texto:'+40 fichas en los retos de cálculo mental (🧠, 🔢, 🧩, ❓).'},
 emmy:{nombre:'Emmy Noether',art:'emmy',titulo:'La guardiana de la simetría',color:'#6B5B95',frase:'¡La racha crece!',texto:'Tu racha suma el doble al multiplicador.'}
};
const INICIALES=['gauss','hipatia','ada'],MAX_HEROES=4;

/* ---------- 6. Rivales ---------- */
const RIVALES=[
 {id:'fracaso',nombre:'Fracaso',art:'fracaso',titulo:'El ladrón de trozos',retos:['divisores','pareja','cuantos','intruso','divisores','secreto'],vida:1000,color:'#E46D4D',
  habilidad:'Te reta con <b>divisores</b>. Cada fallo tuyo le devuelve vida.',
  frases:{entra:'¡Te voy a quitar trozos hasta dejarte en cero!',golpe:['¡Ay, mi porción!','¡Eso duele!','¡Me partes!'],burla:['¡Ja! ¡Te sobra un resto!','¡Ese no encaja!'],ko:'¡Me has hecho trizas…!',furia:'¡AHORA VERÁS DIVISORES DE VERDAD!',cura:'¡Gracias por el trocito!'}},
 {id:'glitch',nombre:'Glitch',art:'glitch',titulo:'El virus de los primos',retos:['factoriza','primos','reconstruye','factoriza','secreto','primos'],vida:1500,color:'#9B77AD',
  habilidad:'Esconde los números en <b>factores primos</b>. Cada fallo tuyo le devuelve vida.',
  frases:{entra:'¡01001! ¡Tus números están infectados!',golpe:['¡ERROR 404!','¡Mis píxeles!','¡Reiniciando…!'],burla:['¡Ese no es primo, ji, ji!','¡Bug detectado!'],ko:'¡Sistema… apagándose…!',furia:'¡MODO VIRUS ACTIVADO!',cura:'¡Parche instalado!'}},
 {id:'incognito',nombre:'Incógnito X',art:'incognito',titulo:'El vampiro del MCD y el mcm',retos:['mcd','mcm','problema','comun','problema','mcd','mcm','secreto'],vida:2000,color:'#5B6E8F',
  habilidad:'Pregunta <b>MCD y mcm</b>: de cabeza y en problemas. Cada fallo tuyo le devuelve vida.',
  frases:{entra:'¡Muajaja! ¿Sabrás cuándo usar el MCD y cuándo el mcm?',golpe:['¡Mi capa!','¡Despejado!','¡Aaargh!'],burla:['¡Confundiste MCD y mcm!','¡Incógnita sin resolver!'],ko:'¡Me has despejado…!',furia:'¡LA NOCHE DE LOS PROBLEMAS!',cura:'¡Delicioso error!'}},
 {id:'caos',nombre:'Caos Σ',art:'caos',titulo:'El rey del desorden',jefe:true,retos:Object.keys(RETOS),vida:3000,color:'#E8B04B',
  habilidad:'El jefe mezcla <b>todos los retos</b>. A mitad de combate se transforma y los retos se vuelven más difíciles.',
  frases:{entra:'¡Arrodíllate ante el Rey del Desorden!',golpe:['¡Mi corona!','¡Imposible!','¡Orden… no…!'],burla:['¡El caos siempre gana!','¡Desorden total!'],ko:'¡El orden… ha vuelto…!',furia:'¡SEGUNDA FASE: CAOS TOTAL!',cura:'¡Más caos para mí!'}}
];
const VARIANTES={normal:{nombre:'Clásico',texto:'La partida de siempre.'},leyenda:{nombre:'Leyenda',texto:'2 corazones por rival y rivales con un 20 % más de vida.'},grandes:{nombre:'Números grandes',texto:'Todos los retos en nivel 2, con números mayores, y rivales con un 40 % más de vida.'}};
const PERKS=['corazon','gracia','llamas','escudo','sabio'];
const RAYO_SEG=20;

/* ---------- 7. Estado de la partida ---------- */
function nuevaPartida(o={},rng=Math.random){
 const variante=VARIANTES[o.variante]?o.variante:'normal',perk=PERKS.includes(o.perk)?o.perk:null,heroe=HEROES[o.heroe]?o.heroe:'gauss';
 const S={version:2,id:o.id||Date.now().toString(36)+'-'+Math.floor(rng()*1e9).toString(36),variante,perk,ronda:0,heroes:[heroe],mejoras:{div:0,fac:0,mm:0},
  corazonesMax:(variante==='leyenda'?2:3)+(perk==='corazon'?1:0),uid:0,fase:'juego',premios:[false,false,false,false,false],liquidada:false,
  stats:{aciertos:0,fallos:0,mejor:0,mejorRacha:0,perfectos:0,porTipo:{}}};
 empezarRonda(S,rng);return S;
}
function empezarRonda(S,rng=Math.random){
 const R=RIVALES[S.ronda];
 S.vidaMax=Math.round(R.vida*(S.variante==='leyenda'?1.2:S.variante==='grandes'?1.4:1));S.vida=S.vidaMax;S.corazones=S.corazonesMax;S.racha=0;S.furia=false;S.escudo=S.perk==='escudo';
 S.saltos=2+(S.perk==='sabio'?2:0);S.respuestas=0;S.ultimoTipo=null;S.fase='juego';S.cofre=null;S.presentado=false;
 nuevoReto(S,rng);return S;
}
function nivelActual(S){return S.variante==='grandes'||S.furia?2:1;}
function nuevoReto(S,rng=Math.random){
 const R=RIVALES[S.ronda];let tipos=R.retos.filter(t=>t!==S.ultimoTipo);if(!tipos.length)tipos=R.retos;
 const tipo=azar(tipos,rng),nivel=nivelActual(S);let g=GEN[tipo](nivel,rng);
 const mano=barajar([...g.valores.map(n=>({id:++S.uid,n})),...(g.ops||[]).map(op=>({id:++S.uid,op}))],rng);
 S.reto={tipo,nivel,...g,mano:undefined,valores:undefined,ops:undefined,fallos:0,pistaUsada:false};delete S.reto.mano;delete S.reto.valores;delete S.reto.ops;
 S.mano=mano;S.ultimoTipo=tipo;return S.reto;
}
const retoConMano=S=>({...S.reto,mano:S.mano});

/* ---------- 8. Puntuación (con pasos para animarla) ---------- */
function puntuar(S,cartas,ev,o={}){
 const R=RETOS[S.reto.tipo],tema=R.tema,pasos=[];
 let fichas=R.fichas+(S.reto.nivel>=2?20:0),mult=R.mult+(S.reto.nivel>=2?1:0);
 const base={fichas,mult};
 for(const c of cartas){const f=c.op?10:fichasCarta(c.n);fichas+=f;pasos.push({tipo:'carta',id:c.id,fichas:f});}
 if(ev.perfecto){mult+=2;pasos.push({tipo:'extra',mult:2,texto:'¡PERFECTO!'});}
 const r=Math.min(S.racha,4);if(r>0){const extra=S.heroes.includes('emmy')?2*r:r;mult+=extra;pasos.push({tipo:S.heroes.includes('emmy')?'heroe':'extra',id:'emmy',mult:extra,texto:`Racha ×${S.racha+1}`});}
 if(tema!=='mix'&&S.mejoras[tema]){mult+=S.mejoras[tema];pasos.push({tipo:'extra',mult:S.mejoras[tema],texto:'Mejora de '+TEMAS[tema]});}
 for(const h of S.heroes){
  if(h==='hipatia'&&tema==='div'){const f=10*cartas.length;fichas+=f;pasos.push({tipo:'heroe',id:h,fichas:f});}
  if(h==='turing'){const p=cartas.filter(c=>c.n!==undefined&&esPrimo(c.n)).length;if(p){fichas+=12*p;pasos.push({tipo:'heroe',id:h,fichas:12*p});}}
  if(h==='ramanujan'&&R.mental){fichas+=40;pasos.push({tipo:'heroe',id:h,fichas:40});}
  if(h==='ada'&&(S.reto.tipo==='problema'||S.reto.tipo==='comun')){mult+=3;pasos.push({tipo:'heroe',id:h,mult:3});}
 }
 if(S.perk==='llamas'&&S.respuestas===0){mult+=3;pasos.push({tipo:'extra',mult:3,texto:'Primer golpe en llamas'});}
 if(S.perk==='gracia'&&S.vida<=S.vidaMax*.25){mult+=2;pasos.push({tipo:'extra',mult:2,texto:'Golpe de gracia'});}
 if(S.heroes.includes('gauss')&&(S.reto.tipo==='factoriza'||S.reto.tipo==='reconstruye')){mult*=2;pasos.push({tipo:'heroe',id:'gauss',por:2});}
 if(o.rapido){const f=Math.round(fichas*.5);fichas+=f;pasos.push({tipo:'rayo',fichas:f,texto:'⚡ ¡Rápido! +50 % fichas'});}
 const total=fichas*mult;
 let nivel=ev.perfecto?2:1;if(S.racha+1>=3)nivel=Math.max(nivel,2);if(total>=S.vidaMax*.35||(ev.perfecto&&S.racha+1>=3))nivel=3;
 return {base,pasos,fichas,mult,total,nivel};
}

/* ---------- 9. Responder, pista y saltar ---------- */
function responder(S,ids,o={},rng=Math.random){
 if(S.fase!=='juego')return {valido:false,motivo:'Ahora no se puede jugar.'};
 if(!Array.isArray(ids)||!ids.length||new Set(ids).size!==ids.length)return {valido:false,motivo:'Elige cartas distintas.'};
 const cartas=ids.map(id=>S.mano.find(c=>c.id===id));if(cartas.some(c=>!c))return {valido:false,motivo:'Esas cartas no están en tu mano.'};
 const reto=retoConMano(S),ev=evaluar(reto,cartas),R=RIVALES[S.ronda];
 /* Un error de formato (número de cartas) no cuesta corazones: solo se avisa */
 if(!ev.ok&&(cartas.length<reto.min||cartas.length>reto.max||(reto.tipo==='problema'&&(cartas.filter(c=>c.op).length!==1||cartas.filter(c=>c.n!==undefined).length!==1))))return {valido:false,motivo:ev.error};
 const tipo=S.reto.tipo;S.stats.porTipo[tipo]=S.stats.porTipo[tipo]||{a:0,f:0};
 if(ev.ok){
  const r=puntuar(S,cartas,ev,{rapido:!!o.rapido&&(!S.reto.pistaUsada||S.perk==='sabio')}),antes=S.vida;
  S.vida=Math.max(0,S.vida-r.total);S.racha++;
  let recupera=false;if(S.racha%3===0&&S.corazones<S.corazonesMax){S.corazones++;recupera=true;}S.respuestas++;S.stats.aciertos++;S.stats.porTipo[tipo].a++;if(ev.perfecto)S.stats.perfectos++;
  S.stats.mejor=Math.max(S.stats.mejor,r.total);S.stats.mejorRacha=Math.max(S.stats.mejorRacha,S.racha);
  let furia=false;if(!S.furia&&S.vida>0&&S.vida<=S.vidaMax/2){S.furia=true;furia=true;}
  let estado='sigue';if(S.vida===0){estado='ganada';ganarRonda(S,rng);}else nuevoReto(S,rng);
  return {valido:true,ok:true,ev,r,antes,furia,estado,tipo,recupera};
 }
 S.stats.fallos++;S.stats.porTipo[tipo].f++;S.racha=0;S.respuestas++;
 let protegido=false;if(S.escudo){S.escudo=false;protegido=true;}else S.corazones--;
 const cura=Math.min(S.vidaMax-S.vida,Math.round(S.vidaMax*.05));S.vida+=cura;
 S.reto.fallos++;let revelado=null,estado='sigue';
 if(S.corazones<=0){S.fase='derrota';estado='perdida';revelado=solucionTexto(reto);}
 else if(S.reto.fallos>=2){revelado=solucionTexto(reto);nuevoReto(S,rng);}
 return {valido:true,ok:false,ev,cura,protegido,revelado,estado,tipo,nuevoReto:!!revelado&&estado==='sigue'};
}
function pedirPista(S){if(S.fase!=='juego')return null;S.reto.pistaUsada=true;return S.reto.pista;}
function saltar(S,rng=Math.random){if(S.fase!=='juego'||S.saltos<=0)return false;S.saltos--;nuevoReto(S,rng);return true;}

/* ---------- 10. Rondas y cofre ---------- */
function ganarRonda(S,rng=Math.random){
 if(S.ronda===RIVALES.length-1){S.fase='victoria';return;}
 S.fase='cofre';S.cofre=prepararCofre(S,rng);
}
function prepararCofre(S,rng=Math.random){
 const opciones=[];const libres=barajar(Object.keys(HEROES).filter(h=>!S.heroes.includes(h)),rng);
 if(S.heroes.length<MAX_HEROES&&libres.length)opciones.push({tipo:'heroe',id:libres[0]});
 if(S.heroes.length<MAX_HEROES&&libres.length>1&&rng()<.5)opciones.push({tipo:'heroe',id:libres[1]});
 opciones.push({tipo:'corazon'});
 const temas=barajar(['div','fac','mm'],rng);while(opciones.length<3)opciones.push({tipo:'mejora',tema:temas.shift()});
 return opciones.slice(0,3);
}
function elegirCofre(S,i,rng=Math.random){
 if(S.fase!=='cofre'||!S.cofre||!S.cofre[i])return false;const o=S.cofre[i];
 if(o.tipo==='heroe'){if(S.heroes.length>=MAX_HEROES||S.heroes.includes(o.id))return false;S.heroes.push(o.id);}
 if(o.tipo==='corazon')S.corazonesMax++;
 if(o.tipo==='mejora')S.mejoras[o.tema]++;
 S.ronda++;empezarRonda(S,rng);return true;
}

/* Otra oportunidad: el mismo rival vuelve con toda su vida; se conservan héroes y mejoras */
function reintentar(S,rng=Math.random){if(S.fase!=='derrota')return false;S.reintentos=(S.reintentos||0)+1;empezarRonda(S,rng);return true;}

/* ---------- 11. Validación del guardado ---------- */
function validar(S){
 const cart=c=>c&&Number.isSafeInteger(c.id)&&((Number.isInteger(c.n)&&c.n>=1&&c.n<=MAX_CARTA)||c.op==='MCD'||c.op==='mcm');
 try{return !!S&&S.version===2&&typeof S.id==='string'&&!!VARIANTES[S.variante]&&(S.perk===null||PERKS.includes(S.perk))
  &&Number.isInteger(S.ronda)&&S.ronda>=0&&S.ronda<RIVALES.length&&Array.isArray(S.heroes)&&S.heroes.length>=1&&S.heroes.length<=MAX_HEROES&&S.heroes.every(h=>HEROES[h])&&new Set(S.heroes).size===S.heroes.length
  &&['juego','cofre','victoria','derrota'].includes(S.fase)&&Number.isInteger(S.vida)&&S.vida>=0&&Number.isInteger(S.vidaMax)&&S.vida<=S.vidaMax
  &&Number.isInteger(S.corazones)&&S.corazones>=0&&S.corazones<=S.corazonesMax&&Number.isInteger(S.racha)&&S.racha>=0
  &&!!S.reto&&!!RETOS[S.reto.tipo]&&Array.isArray(S.mano)&&S.mano.length>=1&&S.mano.length<=10&&S.mano.every(cart)&&new Set(S.mano.map(c=>c.id)).size===S.mano.length
  &&Array.isArray(S.premios)&&S.premios.length===5&&S.premios.every(p=>typeof p==='boolean');}catch(e){return false;}
}
root.PichuRoyale={mcd,mcm,esPrimo,factores,divisores,nDiv,menorPrimo,potencias,fichasCarta,RETOS,TEMAS,GEN,HISTORIAS_MCD,HISTORIAS_MCM,evaluar,resolver,solucionTexto,
 HEROES,INICIALES,MAX_HEROES,RIVALES,VARIANTES,PERKS,RAYO_SEG,TAM_MANO,nuevaPartida,empezarRonda,nuevoReto,retoConMano,nivelActual,puntuar,responder,pedirPista,saltar,ganarRonda,prepararCofre,elegirCofre,reintentar,validar};
})(typeof window!=='undefined'?window:globalThis);

