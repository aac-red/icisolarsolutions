/* Solar Panels page: three.js 3D viewer + controls */
(function(){
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var T=THREE, host=document.getElementById('stage'), renderer;
  try{ renderer=new T.WebGLRenderer({antialias:true,alpha:true}); }
  catch(e){ document.getElementById('nogl').style.display='flex'; return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.setClearColor(0x000000,0);
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=T.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);
  var scene=new T.Scene(), camera=new T.PerspectiveCamera(34,1,.1,300);

  /* bright studio reflections */
  (function(){
    var es=new T.Scene();
    es.add(new T.Mesh(new T.SphereGeometry(40,16,12),new T.MeshBasicMaterial({color:0xcfd6df,side:T.BackSide})));
    function soft(w,h,col,k,x,y,z){ var m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color(col).multiplyScalar(k),side:T.DoubleSide})); m.position.set(x,y,z); m.lookAt(0,0,0); es.add(m); }
    soft(18,18,0xffffff,5,0,18,2);
    soft(5,20,0xffa24d,4,-18,4,3);
    soft(5,20,0xffffff,3,18,4,-3);
    soft(14,6,0xfff2e0,3,0,3,-18);
    soft(12,5,0xffffff,2,2,2,18);
    var pm=new T.PMREMGenerator(renderer); scene.environment=pm.fromScene(es,.03,.1,120).texture;
  })();

  scene.add(new T.HemisphereLight(0xffffff,0xffd9b0,.7));
  var sunLight=new T.DirectionalLight(0xfff4e6,1.4); sunLight.castShadow=true;
  sunLight.shadow.mapSize.set(2048,2048); sunLight.shadow.bias=-.0004; sunLight.shadow.radius=3;
  scene.add(sunLight);

  function cTex(w,h,draw){var c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);var t=new T.CanvasTexture(c);t.anisotropy=8;return t;}
  var glowTex=cTex(128,128,function(g,w,h){var r=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.25,'rgba(255,214,140,.85)');r.addColorStop(.6,'rgba(245,138,43,.25)');r.addColorStop(1,'rgba(245,138,43,0)');g.fillStyle=r;g.fillRect(0,0,w,h);});
  var fadeTex=cTex(256,256,function(g,w,h){var r=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);r.addColorStop(0,'#fff');r.addColorStop(.55,'#9a9a9a');r.addColorStop(1,'#000');g.fillStyle=r;g.fillRect(0,0,w,h);});
  var gridTex=cTex(128,128,function(g,w,h){g.clearRect(0,0,w,h);g.strokeStyle='rgba(245,138,43,.6)';g.lineWidth=2;g.strokeRect(0,0,w,h);});
  gridTex.wrapS=gridTex.wrapT=T.RepeatWrapping; gridTex.repeat.set(70,70);

  /* floor */
  var floor=new T.Group(); scene.add(floor);
  var grid=new T.Mesh(new T.CircleGeometry(60,64),new T.MeshBasicMaterial({map:gridTex,alphaMap:fadeTex,transparent:true,depthWrite:false,opacity:.5}));
  grid.rotation.x=-Math.PI/2; floor.add(grid);
  var shadowPlane=new T.Mesh(new T.CircleGeometry(60,32),new T.ShadowMaterial({opacity:.22}));
  shadowPlane.rotation.x=-Math.PI/2; shadowPlane.position.y=.004; shadowPlane.receiveShadow=true; floor.add(shadowPlane);

  /* panel materials */
  var cellTex=cTex(640,384,function(g,w,h){
    g.fillStyle='#0a1430'; g.fillRect(0,0,w,h);
    var cols=10,rows=6,cw=w/cols,ch=h/rows,cut=7;
    for(var r=0;r<rows;r++)for(var c=0;c<cols;c++){
      var x=c*cw+3,y=r*ch+3,ww=cw-6,hh=ch-6;
      var gr=g.createLinearGradient(x,y,x+ww,y+hh); gr.addColorStop(0,'#1f4a94'); gr.addColorStop(.5,'#16346f'); gr.addColorStop(1,'#0f2552');
      g.fillStyle=gr; g.beginPath();
      g.moveTo(x+cut,y); g.lineTo(x+ww-cut,y); g.lineTo(x+ww,y+cut); g.lineTo(x+ww,y+hh-cut); g.lineTo(x+ww-cut,y+hh); g.lineTo(x+cut,y+hh); g.lineTo(x,y+hh-cut); g.lineTo(x,y+cut); g.closePath(); g.fill();
      g.strokeStyle='rgba(165,190,235,.10)'; g.lineWidth=1;
      for(var f=x+5;f<x+ww-3;f+=5){g.beginPath();g.moveTo(f,y+2);g.lineTo(f,y+hh-2);g.stroke();}
      g.strokeStyle='rgba(225,235,255,.65)'; g.lineWidth=1.6;
      for(var b=1;b<=3;b++){var by=y+hh*b/4;g.beginPath();g.moveTo(x+2,by);g.lineTo(x+ww-2,by);g.stroke();}
    }
  });
  var W=1.7,D=1.0;
  var frameMat=new T.MeshStandardMaterial({color:0xc9d1dc,metalness:1,roughness:.3,envMapIntensity:1.4});
  var cellMat=new T.MeshStandardMaterial({map:cellTex,metalness:.35,roughness:.28,envMapIntensity:1.3,side:T.DoubleSide});
  var backMat=new T.MeshStandardMaterial({color:0xeceff4,roughness:.65,metalness:0,envMapIntensity:.4});
  var glassMat=new T.MeshPhysicalMaterial({color:0xcfe0ff,metalness:0,roughness:.03,clearcoat:1,clearcoatRoughness:.02,transparent:true,opacity:.22,envMapIntensity:3,depthWrite:false,side:T.DoubleSide});

  /* hero module with layers */
  var panel=new T.Group(); scene.add(panel);
  var L={back:new T.Group(),cells:new T.Group(),glass:new T.Group(),frame:new T.Group()};
  var bk=new T.Mesh(new T.BoxGeometry(W-.04,.012,D-.04),backMat); bk.castShadow=bk.receiveShadow=true; L.back.add(bk);
  var jb=new T.Mesh(new T.BoxGeometry(.2,.045,.13),new T.MeshStandardMaterial({color:0x1b2230,roughness:.5})); jb.position.set(.35,-.03,0); L.back.add(jb);
  var cp=new T.Mesh(new T.PlaneGeometry(W-.1,D-.1),cellMat); cp.rotation.x=-Math.PI/2; cp.castShadow=cp.receiveShadow=true; L.cells.add(cp);
  var gp=new T.Mesh(new T.PlaneGeometry(W-.06,D-.06),glassMat); gp.rotation.x=-Math.PI/2; L.glass.add(gp);
  [[W,.05,.05,0,0,D/2-.025],[W,.05,.05,0,0,-D/2+.025],[.05,.05,D-.1,W/2-.025,0,0],[.05,.05,D-.1,-W/2+.025,0,0]].forEach(function(b){
    var m=new T.Mesh(new T.BoxGeometry(b[0],b[1],b[2]),frameMat); m.position.set(b[3],b[4],b[5]); m.castShadow=true; L.frame.add(m);
  });
  var base={back:-.03,cells:0,glass:.034,frame:0}, fac={back:-.75,cells:-.2,glass:.62,frame:0};
  for(var k in L) panel.add(L[k]);
  panel.scale.setScalar(1.45);
  var labelData=[['glass','Tempered glass'],['cells','Solar cells'],['back','Backsheet'],['frame','Aluminium frame']];
  var labelsEl=document.getElementById('labels');
  var labels=labelData.map(function(d){var el=document.createElement('div');el.className='lbl';el.textContent=d[1];labelsEl.appendChild(el);return {el:el,key:d[0]};});

  /* instanced array */
  var CAP=128, tilt=.42;
  var bodyGeo=new T.BoxGeometry(W,.05,D);
  var topGeo=new T.PlaneGeometry(W-.1,D-.1); topGeo.rotateX(-Math.PI/2);
  var legGeo=new T.BoxGeometry(.07,.62,.07);
  var iBody=new T.InstancedMesh(bodyGeo,frameMat,CAP), iTop=new T.InstancedMesh(topGeo,cellMat,CAP), iLeg=new T.InstancedMesh(legGeo,frameMat,CAP);
  [iBody,iTop,iLeg].forEach(function(m){m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;scene.add(m);});
  iTop.material=new T.MeshPhysicalMaterial({map:cellTex,metalness:.35,roughness:.2,clearcoat:1,clearcoatRoughness:.05,envMapIntensity:2});
  var tiers=[
    {n:'Home',kw:'5-12 kW',who:'Homes',cols:8,rows:2,R:13,d:'Designed for medium to larger homes with higher energy consumption.'},
    {n:'Business',kw:'15-20 kW',who:'Small businesses',cols:12,rows:4,R:21,d:'A great solution for small businesses, offices, retail stores, and commercial establishments.'},
    {n:'Industrial',kw:'>50 kW',who:'Large facilities',cols:20,rows:6,R:33,d:'Engineered for large commercial facilities, warehouses, schools, and industrial applications with significant daily power requirements.'}
  ];
  var tx=new Float32Array(CAP),tz=new Float32Array(CAP),cx=new Float32Array(CAP),cz=new Float32Array(CAP),pr=new Float32Array(CAP),wt=new Float32Array(CAP);
  var dummy=new T.Object3D(), nrm=new T.Vector3(0,Math.cos(tilt),Math.sin(tilt));
  var mode='inside', tier=1, activeCount=0;
  function layoutFor(ti){var t=tiers[ti];for(var i=0;i<t.cols*t.rows;i++){var c=i%t.cols,r=Math.floor(i/t.cols);tx[i]=(c-(t.cols-1)/2)*(W+.14);tz[i]=(r-(t.rows-1)/2)*1.55;}}
  function applyScene(){
    var ti=mode==='sun'?1:tier, prev=activeCount;
    layoutFor(ti);
    activeCount=mode==='inside'?0:tiers[ti].cols*tiers[ti].rows;
    for(var i=0;i<CAP;i++) wt[i]=(i>=prev&&i<activeCount)?(i-prev)*.012:0;
    var half=mode==='inside'?5:tiers[ti].cols*.95+4;
    var sc=sunLight.shadow.camera; sc.left=-half;sc.right=half;sc.top=half;sc.bottom=-half;sc.near=1;sc.far=120;sc.updateProjectionMatrix();
  }
  applyScene();

  /* sun + motes */
  var sunCore=new T.Sprite(new T.SpriteMaterial({map:glowTex,transparent:true,depthWrite:false,opacity:0,fog:false})); sunCore.scale.set(14,14,1); scene.add(sunCore);
  var M=70;
  var motePos=new Float32Array(M*3), motes=[];
  for(var m=0;m<M;m++) motes.push([Math.random()*16-8,Math.random()*6+.3,Math.random()*16-8,Math.random()*6.28]);
  var mg=new T.BufferGeometry(); mg.setAttribute('position',new T.BufferAttribute(motePos,3));
  var moteMesh=new T.Points(mg,new T.PointsMaterial({map:glowTex,size:.14,transparent:true,depthWrite:false,color:0xf58a2b,opacity:.35}));
  moteMesh.frustumCulled=false; scene.add(moteMesh);

  /* UI */
  var $=function(id){return document.getElementById(id);};
  var tabsEl=$('tabs'), rowIn=$('row-inside'), rowSc=$('row-scale'), rowSun=$('row-sun');
  var expl=$('expl'), sunSl=$('sun'), hint=$('hint');
  var explTarget=0, explCur=0, sunT=.48, E=1;
  function showTier(){var t=tiers[tier];$('kw').textContent=t.kw;$('who').textContent=t.who;$('tdesc').textContent=t.d+' (Illustrative layout, not a specific design.)';
    document.querySelectorAll('#seg button').forEach(function(b){b.setAttribute('aria-pressed',String(+b.dataset.t===tier));});}
  showTier();
  function setMode(m){
    mode=m; userPitch=0;
    tabsEl.querySelectorAll('button').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.m===m));});
    rowIn.hidden=m!=='inside'; rowSc.hidden=m!=='scale'; rowSun.hidden=m!=='sun';
    hint.style.opacity=0; applyScene(); updateSun();
  }
  tabsEl.addEventListener('click',function(e){var b=e.target.closest('button');if(b)setMode(b.dataset.m);});
  $('seg').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;tier=+b.dataset.t;showTier();applyScene();});
  expl.addEventListener('input',function(){explTarget=expl.value/100;});
  sunSl.addEventListener('input',function(){sunT=sunSl.value/100;updateSun();});

  var curDir=new T.Vector3(-.45,.75,.55).normalize(), tgtDir=new T.Vector3(), curInt=1.4, tgtInt=1.4;
  var lowCol=new T.Color('#ffb070'), highCol=new T.Color('#fff4e6'), curCol=new T.Color('#fff4e6'), tgtCol=new T.Color();
  var glowLow=new T.Color('#FFB070'), glowHigh=new T.Color('#FFF1E0'), glowDef=new T.Color('#FFE1C4'), glowCur=new T.Color('#FFE1C4'), glowTgt=new T.Color();
  function updateSun(){
    var a=Math.PI*sunT; E=Math.sin(a);
    if(mode==='sun'){ tgtDir.set(-Math.cos(a),E*.85+.12,.45).normalize(); tgtInt=.4+1.7*E; tgtCol.copy(lowCol).lerp(highCol,Math.min(1,E*1.3)); glowTgt.copy(glowLow).lerp(glowHigh,Math.min(1,E*1.2)); }
    else { tgtDir.set(-.45,.75,.55).normalize(); tgtInt=1.5; tgtCol.set('#fff4e6'); glowTgt.copy(glowDef); }
    var h=6+12*sunT, hh=Math.floor(h), mi=Math.round((h-hh)*60); if(mi===60){hh++;mi=0;}
    $('time').textContent=(((hh+11)%12)+1)+':'+(mi<10?'0':'')+mi+' '+(hh>=12?'PM':'AM');
    var pc=Math.round(E*100); $('pct').textContent=pc+'%'; $('out').style.width=pc+'%';
  }
  updateSun();

  /* orbit */
  var dragging=false,lx=0,ly=0,px=0,py=0,parX=0,parY=0,userYaw=0,userPitch=0,autoYaw=0,autoOn=!reduce,vw=1,vh=1,narrow=1;
  host.addEventListener('pointerdown',function(e){dragging=true;lx=e.clientX;ly=e.clientY;host.setPointerCapture(e.pointerId);hint.style.opacity=0;autoOn=false;});
  host.addEventListener('pointermove',function(e){var r=host.getBoundingClientRect();px=(e.clientX-r.left)/r.width-.5;py=(e.clientY-r.top)/r.height-.5;
    if(!dragging)return;userYaw-=(e.clientX-lx)*.006;userPitch=Math.max(-.35,Math.min(.7,userPitch+(e.clientY-ly)*.004));lx=e.clientX;ly=e.clientY;});
  function up(){dragging=false;} host.addEventListener('pointerup',up); host.addEventListener('pointercancel',up);
  function resize(){vw=host.clientWidth;vh=host.clientHeight;renderer.setSize(vw,vh,false);camera.aspect=vw/vh;if(vw>=900)camera.setViewOffset(vw,vh,-vw*.17,0,vw,vh);else if(vw<560)camera.setViewOffset(vw,vh,vw*.1,-vh*.26,vw,vh);else camera.clearViewOffset();camera.updateProjectionMatrix();narrow=vw<560?1.95:(vw<900?1.25:1);}
  if(window.ResizeObserver) new ResizeObserver(resize).observe(host); else window.addEventListener('resize',resize);
  resize();

  function ease(t){return 1-Math.pow(1-t,3);}
  function backOut(t){var c1=1.70158,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2);}
  var intro=reduce?1:0, demoDone=reduce, clock=new T.Clock(), tmp=new T.Vector3(), v=new T.Vector3();
  var curR=8,curP=.4,curTy=0,floorY=-1.35,panelS=1;
  if(reduce) explTarget=0;

  function frame(){
    var dt=Math.min(clock.getDelta(),.05), time=clock.elapsedTime, k=1-Math.exp(-dt*3.2);
    if(intro<1) intro=Math.min(1,intro+dt/2.4);
    if(!demoDone&&time>2.6){demoDone=true;expl.value=62;explTarget=.62;}
    if(autoOn&&mode==='inside') autoYaw+=dt*.18;

    var tR,tP,tY;
    if(mode==='inside'){tR=6.6*narrow;tP=.42;tY=0;}
    else if(mode==='scale'){tR=tiers[tier].R*narrow;tP=.5;tY=.4;}
    else {tR=tiers[1].R*narrow;tP=.3;tY=.9;}
    curR+=(tR-curR)*k; curP+=(tP-curP)*k; curTy+=(tY-curTy)*k;
    var iy=1-ease(intro);
    var yaw=autoYaw+userYaw+(mode==='inside'?0:-.35)+iy*-.8;
    var pit=Math.max(.05,curP+userPitch), R=curR+iy*5;
    camera.position.set(Math.sin(yaw)*Math.cos(pit)*R+parX*.8, curTy+Math.sin(pit)*R+parY*.6, Math.cos(yaw)*Math.cos(pit)*R);
    parX+=(px-parX)*.05; parY+=(py-parY)*.05;
    camera.lookAt(0,curTy,0);

    var fy=mode==='inside'?-1.35:0; floorY+=(fy-floorY)*k; floor.position.y=floorY;

    curDir.lerp(tgtDir,k).normalize(); curInt+=(tgtInt-curInt)*k; curCol.lerp(tgtCol,k);
    sunLight.position.copy(curDir).multiplyScalar(45).add(new T.Vector3(0,floorY,0));
    sunLight.target.position.set(0,floorY,0); sunLight.target.updateMatrixWorld();
    sunLight.intensity=curInt; sunLight.color.copy(curCol);
    sunCore.position.copy(curDir).multiplyScalar(80);
    var so=mode==='sun'?.35+.65*E:0; sunCore.material.opacity+=(so-sunCore.material.opacity)*k;
    glowCur.lerp(glowTgt,k);
    host.style.background='radial-gradient(120% 90% at 50% 100%,#'+glowCur.getHexString()+' 0%,#FFF8F0 55%,#fff 100%)';

    var tps=mode==='inside'?1:.0001; panelS+=(tps-panelS)*k;
    panel.visible=panelS>.02; panel.scale.setScalar(Math.max(1.45*panelS*ease(Math.min(1,intro*1.4)),.0001));
    panel.rotation.y=iy*Math.PI*1.4; panel.position.y=(1-ease(intro))*-1.2;
    explCur+=(explTarget-explCur)*(1-Math.exp(-dt*4));
    for(var key in L) L[key].position.y=base[key]+fac[key]*explCur;
    panel.updateMatrixWorld(true);
    labels.forEach(function(lb){
      if(!panel.visible||explCur<.2){lb.el.style.opacity=0;return;}
      v.set(W/2+.12,L[lb.key].position.y,0); panel.localToWorld(v); v.project(camera);
      lb.el.style.transform='translate('+((v.x*.5+.5)*vw+12)+'px,'+((-v.y*.5+.5)*vh-12)+'px)';
      lb.el.style.opacity=Math.min(1,(explCur-.2)*3);
    });

    var kk=1-Math.exp(-dt*5);
    for(var i=0;i<CAP;i++){
      var vis=i<activeCount;
      if(vis){ if(wt[i]>0) wt[i]-=dt; else pr[i]=Math.min(1,pr[i]+dt*1.7); }
      else pr[i]=Math.max(0,pr[i]-dt*3.2);
      if(pr[i]<=.001){cx[i]=tx[i];cz[i]=tz[i];}else{cx[i]+=(tx[i]-cx[i])*kk;cz[i]+=(tz[i]-cz[i])*kk;}
      var s=pr[i]<=.001?.0001:Math.max(.0001,backOut(pr[i])), by=.66*s;
      dummy.position.set(cx[i],by,cz[i]); dummy.rotation.set(tilt,0,0); dummy.scale.setScalar(s); dummy.updateMatrix(); iBody.setMatrixAt(i,dummy.matrix);
      dummy.position.set(cx[i]+nrm.x*.03*s,by+nrm.y*.03*s,cz[i]+nrm.z*.03*s); dummy.updateMatrix(); iTop.setMatrixAt(i,dummy.matrix);
      dummy.position.set(cx[i],.31*s,cz[i]); dummy.rotation.set(0,0,0); dummy.updateMatrix(); iLeg.setMatrixAt(i,dummy.matrix);
    }
    iBody.instanceMatrix.needsUpdate=iTop.instanceMatrix.needsUpdate=iLeg.instanceMatrix.needsUpdate=true;

    var ma=mg.attributes.position.array;
    for(var q=0;q<M;q++){var d=motes[q];ma[q*3]=d[0]+Math.sin(time*.25+d[3])*.5;ma[q*3+1]=floorY+((d[1]+time*.1)%6.5);ma[q*3+2]=d[2]+Math.cos(time*.2+d[3])*.5;}
    mg.attributes.position.needsUpdate=true;

    renderer.render(scene,camera);
    requestAnimationFrame(frame);
  }
  frame();
})();
