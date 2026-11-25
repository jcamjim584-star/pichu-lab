(function(){'use strict';
var D=window.GALOIS_CAMPINA,A=window.GaloisColeccion,ART=window.GaloisArte;if(!D||!A)return;
var $=function(id){return document.getElementById(id)}, esc=function(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var CATS=D.categorias,RAR=D.rarezas,cats=Object.keys(CATS),src={
'1':'https://www.andalucia.org/listing/fuentes-de-andaluc%C3%ADa/20016102/',
'2':'https://en.andalucia.org/listing/roman-towns-of-baetica-seville/21417101/',
'3':'https://www.andalucia.org/listing/ruta-de-las-once-torres-de-%C3%89cija/21482102/',
'4':'https://www.andalucia.org/listing/ruta-de-washington-irving/21470102/',
'5':'https://www.andalucia.org/listing/ruta-de-washington-irving/21470102/',
'6':'https://www.andalucia.org/listing/ruta-de-washington-irving/21470102/',
'7':'https://visitasevilla.es/semana-santa-en-los-barrios/',
'8':'https://www.andalucia.org/listing/ruta-de-washington-irving/21470102/',
'9':'https://en.andalucia.org/listing/roman-towns-of-baetica-seville/21417101/',
'10':'https://visitasevilla.es/basilica-y-murallas-de-la-macarena/'};
var REDUCIDO=matchMedia('(prefers-reduced-motion: reduce)').matches;
var VISTAS='galoisLegacy.album.vistas.v1';
function vistas(){try{var v=JSON.parse(localStorage.getItem(VISTAS)||'{}');return v&&typeof v==='object'?v:{}}catch(e){return {}}}
function marcarVistas(ids){var v=vistas();v[A.activo()]=ids;try{localStorage.setItem(VISTAS,JSON.stringify(v))}catch(e){}}
function art(c){return c.foto||(ART?ART.carta(c):'')}
function marcoFoto(c){return '<span class="sello" aria-hidden="true">'+esc(c.sello||'✦')+'</span><span class="marco" aria-hidden="true"><i></i><i></i><i></i><i></i></span>'}
function esFoto(c){return !!(c.foto||c.fotoPendiente)}
function estiloFoto(c){return esFoto(c)?'--tint:'+(c.color||'#326bbc')+';--crop:'+(c.crop||'50% 50%'):''}
function marcadorHTML(c){return '<span class="marcador"><b>Marcador temporal</b><small>'+esc(c.nombre)+'</small><small>Falta la fotografía</small></span>'}
/* Si una fotografía externa no carga, la carta queda con un marcador temporal
   y el álbum avisa de cuál falta (no se pierde ni el crédito ni el enlace). */
var fotosFallidas=[];
function nombreDe(id){var c=D.cartas.find(function(x){return x.id===id});return c?c.nombre:id}
function anotarPendientes(){D.cartas.forEach(function(c){if(c.fotoPendiente&&fotosFallidas.indexOf(c.id)<0)fotosFallidas.push(c.id)});avisarFallos()}
function avisarFallos(){var caja=$('fotosAviso');if(!caja)return;if(!fotosFallidas.length){caja.hidden=true;return}
 caja.hidden=false;caja.textContent=(fotosFallidas.length===1?'Falta por sustituir la fotografía de: ':'Faltan por sustituir las fotografías de: ')+fotosFallidas.map(nombreDe).join(' · ')+'.'}
function marcarFallo(im){var id=im.getAttribute('data-foto'),hueco=im.parentNode,tarjeta=im.closest('.card,.ficha-carta');
 if(id&&fotosFallidas.indexOf(id)<0)fotosFallidas.push(id);
 if(tarjeta)tarjeta.classList.add('sin-foto');
 if(hueco&&!hueco.querySelector('.marcador')){var m=document.createElement('span');m.className='marcador';m.innerHTML='<b>Marcador temporal</b><small>'+esc(nombreDe(id))+'</small><small>La fotografía no ha cargado</small>';hueco.appendChild(m)}
 im.remove();avisarFallos()}
function vigilarFotos(raiz){(raiz||document).querySelectorAll('img[data-foto]').forEach(function(im){
 if(im.dataset.vigilada)return;im.dataset.vigilada='1';
 im.addEventListener('error',function(){marcarFallo(im)});
 if(im.complete&&im.naturalWidth===0)marcarFallo(im)})}
function rev(m){return ART?ART.reverso(m):''}
function datosPerfil(){var db=A.leer();return db.perfiles[A.activo()]||{retos:{},cartas:[]}}
function guardadas(){var p=datosPerfil();return Array.isArray(p.cartas)?p.cartas:[]}

function pintarRPG(){
 if(!A.rpg)return;var e=A.rpg.estado(),pct=Math.round(100*(e.xp-e.xpNivel)/Math.max(1,e.xpSiguiente-e.xpNivel));
 $('rpg').innerHTML='<div class="nivel"><b>Nivel '+e.nivel+'</b><div class="barra" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+pct+'" aria-label="Experiencia hasta el siguiente nivel"><i style="width:'+pct+'%"></i></div><small>'+e.xp+' / '+e.xpSiguiente+' XP</small></div>'+
 '<div class="monedas"><span class="moneda" aria-hidden="true"></span><b>'+e.monedas+'</b> monedas · 🧪 '+e.inv.pocion+' pociones</div>'+
 '<div class="insignias" aria-label="Insignias de los mundos">'+D.mundos.map(function(w){var ok=e.insignias.indexOf(w.id)>=0;return '<span class="ins'+(ok?' ok':'')+'" title="'+esc(w.lugar+(ok?': superado':': pendiente'))+'">'+w.id+'</span>'}).join('')+'</div>';
 var L=A.LOGROS||{};$('logros').innerHTML=Object.keys(L).map(function(k){var ok=e.logros.indexOf(k)>=0;return '<li class="'+(ok?'ok':'')+'"><span aria-hidden="true">'+(ok?L[k].icono:'🔒')+'</span><b>'+esc(L[k].nombre)+'</b><small>'+esc(L[k].desc)+'</small></li>'}).join('');
}
function actualizar(){
 var ids=guardadas(),worlds=D.mundos.filter(function(w){return D.cartas.filter(function(c){return c.mundo===w.id}).every(function(c){return ids.indexOf(c.id)>=0})}).length;
 var vistasAntes=vistas()[A.activo()];var nuevas=Array.isArray(vistasAntes)?ids.filter(function(i){return vistasAntes.indexOf(i)<0}):[];
 $('nCards').textContent=ids.length+' / '+D.cartas.length;$('nWorlds').textContent=worlds+' de '+D.mundos.length+' reinos completos';$('progress').max=D.cartas.length;$('progress').value=ids.length;
 var fW=$('fWorld').value,fC=$('fCat').value,fS=$('fState').value,fR=$('fRar').value;
 var shown=D.cartas.filter(function(c){return (!fW||String(c.mundo)===fW)&&(!fC||c.categoria===fC)&&(!fR||c.rareza===fR)&&(!fS||(fS==='owned'?ids.indexOf(c.id)>=0:ids.indexOf(c.id)<0))});
 $('album').innerHTML=shown.map(function(c){var own=ids.indexOf(c.id)>=0,wc=D.mundos[c.mundo-1],nueva=nuevas.indexOf(c.id)>=0;
  return '<article class="card '+(own?'owned r-'+c.rareza:'locked')+(nueva&&!REDUCIDO?' nueva':'')+(esFoto(c)?' foto':'')+(c.fotoPendiente?' sin-foto':'')+'" style="'+estiloFoto(c)+'">'+(own&&esFoto(c)?marcoFoto(c):'')+'<button type="button" data-id="'+c.id+'" aria-label="'+(own?'Ver carta ':'Carta por descubrir: ')+esc(own?c.nombre:'mundo '+c.mundo)+'">'+
  '<div class="flip"><div class="cara frente">'+(own?(c.fotoPendiente?marcadorHTML(c):'<img loading="lazy" '+(c.foto?'data-foto="'+c.id+'" referrerpolicy="no-referrer" ':'')+'src="'+art(c)+'" alt="'+esc(c.foto?(c.alt||c.nombre):'Ilustración pixel art de '+c.nombre)+'">'):'<img loading="lazy" src="'+rev(c.mundo)+'" alt=""><span class="lock" aria-hidden="true">?</span>')+(own&&c.rareza==='legendaria'?'<span class="brillo" aria-hidden="true"></span>':'')+'</div><div class="cara dorso"><img src="'+rev(c.mundo)+'" alt=""></div></div>'+
  '<div class="tag">'+(own?esc(RAR[c.rareza]):'SIN DESCUBRIR')+(nueva?' · ¡NUEVA!':'')+'</div><h3>'+(own?esc(c.nombre):'Carta '+c.etapa+' · ???')+'</h3><span class="world">Mundo '+c.mundo+' · '+esc(wc.lugar)+'</span><p>'+(own?esc(c.familia||CATS[c.categoria]):'Supera aventuras para encontrarla')+'</p></button></article>'}).join('');
 $('feedback').textContent=shown.length+' cartas en esta vista · perfil: '+A.activo()+(nuevas.length?' · '+nuevas.length+' nuevas':'');
 vigilarFotos($('album'));anotarPendientes();marcarVistas(ids);pintarRPG();
}
function mostrar(id){var c=D.cartas.find(function(x){return x.id===id});if(!c)return;var ok=guardadas().indexOf(id)>=0,w=D.mundos[c.mundo-1];
 var av=w.aventuras&&w.aventuras.find(function(a){return a.carta===c.id});
 $('dialogContent').innerHTML='<div class="ficha-carta'+(ok?' r-'+c.rareza:'')+(esFoto(c)?' foto':'')+(c.fotoPendiente?' sin-foto':'')+'" style="'+estiloFoto(c)+'"><div class="flip grande" id="flipGrande"><div class="cara frente">'+(ok&&c.fotoPendiente?marcadorHTML(c):'<img '+(ok&&c.foto?'data-foto="'+c.id+'" referrerpolicy="no-referrer" ':'')+'src="'+(ok?art(c):rev(c.mundo))+'" alt="'+esc(ok?(c.foto?(c.alt||c.nombre):'Ilustración pixel art de '+c.nombre):'Reverso de carta')+'">')+(ok&&esFoto(c)?marcoFoto(c):'')+(ok&&c.rareza==='legendaria'?'<span class="brillo" aria-hidden="true"></span>':'')+'</div><div class="cara dorso"><img src="'+rev(c.mundo)+'" alt="Reverso de la carta"></div></div>'+
 (ok?'<button type="button" class="girar" id="girar">↻ Ver reverso</button>':'')+'</div><h2>'+(ok?esc(c.nombre):'Carta por descubrir')+'</h2>'+
 '<p class="fact">'+(ok?esc(c.descripcion):'Desbloquéala superando una aventura distinta en '+esc(w.lugar)+'. Las cinco primeras salen al azar; la sexta, legendaria, premia una victoria excelente contra el jefe.')+'</p>'+
 '<dl class="meta"><dt>Mundo</dt><dd>'+w.id+' · '+esc(w.nombre)+' ('+esc(w.lugar)+')</dd>'+(ok?'<dt>Familia</dt><dd>'+esc(CATS[c.categoria])+'</dd><dt>Rareza</dt><dd>'+esc(RAR[c.rareza])+'</dd>':'')+(ok&&av?'<dt>Aventura relacionada</dt><dd>'+esc(av.nombre)+'</dd>':'')+'</dl>'+
 (ok&&c.credito?'<p class="credito"><b>Fotografía:</b> '+esc(c.credito)+(c.enlace?' · <a href="'+c.enlace+'" target="_blank" rel="noopener noreferrer">ver en su fuente ↗</a>':'')+(c.licencia?' · <a href="'+c.licencia+'" target="_blank" rel="noopener noreferrer">licencia</a>':'')+(c.nota?'<small>'+esc(c.nota)+'</small>':'')+(c.notaFoto?'<small>'+esc(c.notaFoto)+'</small>':'')+'</p>':'')+
 (ok&&!c.credito?'<p><a href="'+src[String(w.id)]+'" target="_blank" rel="noopener noreferrer">Conocer el patrimonio del lugar ↗</a></p>':'');
 vigilarFotos($('dialogContent'));
 var g=$('girar');if(g)g.onclick=function(){$('flipGrande').classList.toggle('girada');g.textContent=$('flipGrande').classList.contains('girada')?'↻ Ver anverso':'↻ Ver reverso'};
 $('detalle').showModal()}
function exportar(){var data=datosPerfil();var out={app:'galoisLegacyColeccion',version:2,perfil:A.activo(),cartas:guardadas(),retos:data.retos||{},rpg:data.rpg||null};var blob=new Blob([JSON.stringify(out,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='galois-progreso-'+A.activo().replace(/[^a-z0-9-]/gi,'-')+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url)},300)}
function fusionarRPG(p,r){if(!r||typeof r!=='object')return;var m=p.rpg&&typeof p.rpg==='object'?p.rpg:{};
 m.xp=Math.max(+m.xp||0,Math.min(1e6,+r.xp||0));m.monedas=Math.max(+m.monedas||0,Math.min(1e6,+r.monedas||0));
 m.insignias=[...new Set((m.insignias||[]).concat((Array.isArray(r.insignias)?r.insignias:[]).filter(function(x){return x>=1&&x<=10})))];
 var L=A.LOGROS||{};m.logros=[...new Set((m.logros||[]).concat((Array.isArray(r.logros)?r.logros:[]).filter(function(x){return L[x]})))];
 m.aventuras=m.aventuras||{};if(r.aventuras&&typeof r.aventuras==='object')Object.keys(r.aventuras).forEach(function(k){if(/^(10|[1-9])-[1-5]$/.test(k)&&r.aventuras[k]&&r.aventuras[k].hecha)m.aventuras[k]={hecha:true,mejor:Math.max(0,+r.aventuras[k].mejor||0),dificultad:String(r.aventuras[k].dificultad||'aventurero').slice(0,12)}});
 m.cofres=m.cofres||{};if(r.cofres&&typeof r.cofres==='object')Object.keys(r.cofres).forEach(function(k){if(k.length<=40)m.cofres[k]=true});
 m.hitos=m.hitos||{};if(r.hitos&&typeof r.hitos==='object')Object.keys(r.hitos).forEach(function(k){if(k.length<=40&&r.hitos[k]===true)m.hitos[k]=true});
 m.inv=m.inv||{};m.inv.pocion=Math.max(+m.inv.pocion||0,Math.min(99,+(r.inv&&r.inv.pocion)||0));p.rpg=m}
function importar(file){if(!file)return;var r=new FileReader();r.onload=function(){try{var obj=JSON.parse(String(r.result)),known=new Set(D.cartas.map(function(x){return x.id}));if(obj.app!=='galoisLegacyColeccion'||!Array.isArray(obj.cartas))throw Error('Formato incorrecto');var db=A.leer(),key=A.activo(),p=db.perfiles[key]||{retos:{},cartas:[]};p.retos=p.retos||{};p.cartas=[...new Set((p.cartas||[]).concat(obj.cartas.filter(function(x){return known.has(x)})))];if(obj.retos&&typeof obj.retos==='object'){Object.entries(obj.retos).forEach(function(pair){if(!/^(10|[1-9])$/.test(pair[0])||!pair[1]||typeof pair[1]!=='object')return;var existing=p.retos[pair[0]]||{};Object.keys(pair[1]).filter(function(k){return k.length<=70}).forEach(function(k){if(pair[1][k]===true)existing[k]=true});p.retos[pair[0]]=existing})}fusionarRPG(p,obj.rpg);db.perfiles[key]=p;localStorage.setItem('galoisLegacy.coleccion.v1',JSON.stringify(db));actualizar();$('feedback').textContent='Progreso importado a '+key+' correctamente.'}catch(e){$('feedback').textContent='No se pudo importar: '+e.message}};r.readAsText(file)}
$('alias').value=A.activo();$('saveAlias').onclick=function(){A.seleccionar($('alias').value);$('alias').value=A.activo();actualizar()};
$('fWorld').innerHTML+=D.mundos.map(function(w){return '<option value="'+w.id+'">'+w.id+' · '+esc(w.lugar)+'</option>'}).join('');
$('fCat').innerHTML+=cats.map(function(k){return '<option value="'+k+'">'+esc(CATS[k])+'</option>'}).join('');
$('fRar').innerHTML+=Object.keys(RAR).map(function(k){return '<option value="'+k+'">'+esc(RAR[k])+'</option>'}).join('');
['fWorld','fCat','fState','fRar'].forEach(function(k){$(k).addEventListener('change',actualizar)});
$('album').addEventListener('click',function(e){var b=e.target.closest('[data-id]');if(b)mostrar(b.dataset.id)});
$('close').onclick=function(){$('detalle').close()};
$('export').onclick=exportar;$('importFile').addEventListener('change',function(e){importar(e.target.files[0]);e.target.value=''});actualizar();
})();
