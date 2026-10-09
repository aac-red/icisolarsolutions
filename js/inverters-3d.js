/* Solar Inverters page: three.js 3D inverter model + controls */
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

  (function(){
    var es=new T.Scene();
    es.add(new T.Mesh(new T.SphereGeometry(40,16,12),new T.MeshBasicMaterial({color:0xcfd6df,side:T.BackSide})));
    function soft(w,h,col,k,x,y,z){ var m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color(col).multiplyScalar(k),side:T.DoubleSide})); m.position.set(x,y,z); m.lookAt(0,0,0); es.add(m); }
    soft(18,18,0xffffff,5,0,18,2); soft(5,20,0xffa24d,4,-18,4,3); soft(5,20,0xffffff,3,18,4,-3); soft(14,6,0xfff2e0,3,0,3,-18); soft(12,5,0xffffff,2,2,2,18);
    var pm=new T.PMREMGenerator(renderer); scene.environment=pm.fromScene(es,.03,.1,120).texture;
  })();
  scene.add(new T.HemisphereLight(0xffffff,0xffd9b0,.5));
  var key=new T.DirectionalLight(0xfff4e6,1.6); key.position.set(-18,34,24); key.castShadow=true;
  key.shadow.mapSize.set(2048,2048); key.shadow.bias=-.0004; key.shadow.radius=3;
  var sc0=key.shadow.camera; sc0.left=-10;sc0.right=10;sc0.top=10;sc0.bottom=-10;sc0.near=1;sc0.far=100; scene.add(key);

  function cTex(w,h,draw){var c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);var t=new T.CanvasTexture(c);t.anisotropy=8;return t;}
  var glowTex=cTex(128,128,function(g,w,h){var r=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.3,'rgba(255,255,255,.7)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,w,h);});
  var fadeTex=cTex(256,256,function(g,w,h){var r=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);r.addColorStop(0,'#fff');r.addColorStop(.55,'#9a9a9a');r.addColorStop(1,'#000');g.fillStyle=r;g.fillRect(0,0,w,h);});
  var gridTex=cTex(128,128,function(g,w,h){g.clearRect(0,0,w,h);g.strokeStyle='rgba(245,138,43,.6)';g.lineWidth=2;g.strokeRect(0,0,w,h);});
  gridTex.wrapS=gridTex.wrapT=T.RepeatWrapping; gridTex.repeat.set(70,70);
  var grid=new T.Mesh(new T.CircleGeometry(60,64),new T.MeshBasicMaterial({map:gridTex,alphaMap:fadeTex,transparent:true,depthWrite:false,opacity:.5})); grid.rotation.x=-Math.PI/2; scene.add(grid);
  var sp=new T.Mesh(new T.CircleGeometry(60,32),new T.ShadowMaterial({opacity:.22})); sp.rotation.x=-Math.PI/2; sp.position.y=.004; sp.receiveShadow=true; scene.add(sp);

  /* materials */
  var bodyMat=new T.MeshStandardMaterial({color:0xf7f8fa,metalness:.2,roughness:.36,envMapIntensity:1.25});
  var grayMat=new T.MeshStandardMaterial({color:0x8a9099,metalness:.35,roughness:.5,envMapIntensity:1});
  var darkMetal=new T.MeshStandardMaterial({color:0x2a3342,metalness:.8,roughness:.4,envMapIntensity:1});
  var rubber=new T.MeshStandardMaterial({color:0x15181d,roughness:.8,metalness:.1});
  var wallMat=new T.MeshStandardMaterial({color:0xf0ebe5,roughness:.95,envMapIntensity:.2});
  var capMat=new T.MeshStandardMaterial({color:0x1d3f78,metalness:.5,roughness:.35,envMapIntensity:1.2});
  var copperMat=new T.MeshStandardMaterial({color:0xb87333,metalness:.85,roughness:.35,envMapIntensity:1.4});
  var ledMat=new T.MeshBasicMaterial({color:0xf58a2b});
  var pcbTex=cTex(256,384,function(g,w,h){g.fillStyle='#0f3b2c';g.fillRect(0,0,w,h);g.strokeStyle='rgba(255,200,90,.35)';g.lineWidth=2;for(var i=0;i<22;i++){var y=14+i*17;g.beginPath();g.moveTo(10,y);g.lineTo(60+(i*37)%150,y);g.lineTo(80+(i*53)%160,y+10);g.stroke();}g.fillStyle='rgba(255,255,255,.25)';for(var j=0;j<40;j++){g.fillRect(12+(j*47)%230,12+(j*71)%360,5,5);}});
  var pcbMat=new T.MeshStandardMaterial({map:pcbTex,roughness:.6,metalness:.2,envMapIntensity:.6});
  var logoTex=cTex(256,96,function(g,w,h){g.clearRect(0,0,w,h);g.strokeStyle='#f08a24';g.lineWidth=7;g.beginPath();g.arc(44,48,22,.5,5.8);g.stroke();g.fillStyle='#f08a24';g.beginPath();g.arc(44,48,7,0,6.3);g.fill();g.font='700 50px Arial';g.textBaseline='middle';g.fillText('solis',84,50);});
  var dispCv=document.createElement('canvas'); dispCv.width=256; dispCv.height=139; var dctx=dispCv.getContext('2d'); var dispTex=new T.CanvasTexture(dispCv);
  function drawDisplay(p,t){var g=dctx;g.fillStyle='#e8eef3';g.fillRect(0,0,256,139);g.fillStyle='#4a5b72';g.font='600 15px Arial';g.fillText('SOLAR OUTPUT',12,22);g.fillStyle='#2b2b2b';g.font='700 46px Arial';g.fillText(p+'%',12,74);
    for(var i=0;i<10;i++){var bh=6+30*(.5+.5*Math.sin(t*2+i*.7))*(p/100);g.fillStyle=i<8?'#2f5f8f':'#f58a2b';g.fillRect(12+i*23,130-bh,17,bh);}dispTex.needsUpdate=true;}
  drawDisplay(100,0);

  function rrShape(w,h,r){var s=new T.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
  function rrBox(w,h,d,r,bev){var rr=Math.max(r-bev,.01);var g=new T.ExtrudeGeometry(rrShape(w-2*bev,h-2*bev,rr),{depth:Math.max(d-2*bev,.01),bevelEnabled:true,bevelThickness:bev,bevelSize:bev,bevelSegments:3,curveSegments:8});g.translate(0,0,-(d-2*bev)/2);return g;}
  function mesh(geo,mat){return new T.Mesh(geo,mat);}
  function add(g,m,x,y,z,cast){m.position.set(x,y,z);m.castShadow=!!cast;m.receiveShadow=true;g.add(m);return m;}
  function box(w,h,d){return new T.BoxGeometry(w,h,d);}

  var specs={
    single:{cap:'Solis single phase PV inverter: LCD in the upper section and a wiring box below (3.6-10 kW models).',W:1.0,H:1.55,Dp:.42,r:.09,split:.38,lcd:true,logo:[-.2,1.08],dcRow:3,side:0},
    hybrid1:{cap:'Solis single phase energy storage (hybrid) inverter with status LED strip and red DC switch (3.8-11.4 kW).',W:1.05,H:1.72,Dp:.42,r:.09,split:.4,ledStrip:true,logo:[-.24,1.3],dcRow:2,hybrid:true,redSwitch:true,side:0},
    hybrid3:{cap:'Solis three phase energy storage (hybrid) inverter with LCD and red DC switch (30-60 kW models).',W:1.25,H:2.05,Dp:.44,r:.09,split:.42,lcd:true,logo:[-.3,1.7],dcRow:3,hybrid:true,redSwitch:true,side:0},
    three:{cap:'Solis three phase PV inverter with grey AC switch box on the side and a DC connector row (25-125 kW).',W:2.3,H:1.15,Dp:.46,r:.1,split:0,lcd:true,lcdX:.55,logo:[-.65,.3],feet:true,dcRow:10,acSwitch:true,side:.8},
    utility:{cap:'Solis utility scale PV inverter, 1500V class, with grey wiring section and DC cable connectors (up to 250 kW).',W:1.6,H:1.9,Dp:.6,r:.12,split:0,lcdOnSide:true,logo:[-.4,1.55],feet:true,dcRow:14,cableLen:.32,v1500:true,side:1.0}
  };

  function build(o){
    var g=new T.Group(), W=o.W,H=o.H,Dp=o.Dp,r=o.r,bev=.02,side=o.side||0,lift=o.feet?.1:.5;
    var body=new T.Group(); body.position.y=lift; g.add(body);
    var t1=Dp*.45, zf=Dp*.05+t1;
    add(body,mesh(rrBox(W,H,Dp*.55,r,bev),bodyMat),0,H/2,-Dp*.225,true);
    var nf=Math.max(6,Math.floor(W/.075));
    for(var i=0;i<nf;i++) add(body,mesh(box(.03,H*.88,.12),darkMetal),-W/2+.07+i*((W-.14)/(nf-1)),H/2,-Dp/2-.06,true);
    add(g,mesh(box(W+.9,H+.6,.08),wallMat),0,lift+H/2,-Dp/2-.16,false);
    var pcb=mesh(new T.PlaneGeometry(W*.86,H*.86),pcbMat); add(body,pcb,0,H/2,Dp*.05+.003,false);
    var ncap=W>1.5?5:3;
    for(var c=0;c<ncap;c++){var cr=Math.min(.09,W*.075);var cm=mesh(new T.CylinderGeometry(cr,cr,.16,20),capMat);cm.rotation.x=Math.PI/2;add(body,cm,-W*.32+c*(W*.6/(ncap-1)),H*.7,Dp*.05+.09,true);}
    add(body,mesh(box(Math.min(.36,W*.3),Math.min(.3,H*.25),.16),copperMat),W*.2,H*.5-H*.16,Dp*.05+.09,true);
    add(body,mesh(box(Math.min(.4,W*.3),Math.min(.28,H*.22),.1),darkMetal),-W*.2,H*.5-H*.18,Dp*.05+.07,true);

    var cover=new T.Group(); body.add(cover);
    var Hu=o.split?H*(1-o.split):H, Hl=o.split?H*o.split-.025:0;
    add(cover,mesh(rrBox(W,Hu,t1,r,bev),bodyMat),0,H-Hu/2,zf-t1/2,true);
    if(Hl>0) add(cover,mesh(rrBox(W,Hl,t1+.03,r,bev),bodyMat),0,Hl/2,zf-t1/2+.015,true);
    var logoPos=o.logo;
    add(cover,mesh(new T.PlaneGeometry(.38,.14),new T.MeshBasicMaterial({map:logoTex,transparent:true,depthWrite:false})),logoPos[0],logoPos[1],zf+.003,false);
    if(o.ledStrip){
      add(cover,mesh(box(.1,Hu*.55,.012),rubber),W*.32,H-Hu*.4,zf+.006,false);
      [0x38d27a,0x38a6ff,0x38d27a,0xffb347,0xff5a4a].forEach(function(cl,i){add(cover,mesh(box(.04,.04,.006),new T.MeshBasicMaterial({color:cl})),W*.32,H-Hu*.2-i*Hu*.1,zf+.015,false);});
    }
    add(cover,mesh(box(.22,.022,.01),ledMat),-W*.05,H-.1,zf+.005,false);
    if(o.lcd||o.lcdOnSide){
      var bw=Math.min(.82,W*.5), onSide=!!o.lcdOnSide, lx=onSide?(W/2+side/2):(o.lcdX||0), ly=onSide?H*.8:H-Hu*.4, par=onSide?body:cover, lz=onSide?(Dp*.455):zf;
      add(par,mesh(box(bw,bw*.6,.014),new T.MeshStandardMaterial({color:0xe6eaee,roughness:.5})),lx,ly,lz+.007,false);
      add(par,mesh(new T.PlaneGeometry(bw*.82,bw*.46),new T.MeshBasicMaterial({map:dispTex})),lx,ly+bw*.02,lz+.016,false);
      for(var b=0;b<4;b++) add(par,mesh(box(bw*.1,.035,.012),new T.MeshStandardMaterial({color:0xaab2bc,roughness:.5})),lx-bw*.27+b*bw*.18,ly-bw*.3-.045,lz+.01,false);
    }
    if(side>0){
      var Hs=H*.94, sx=W/2+side/2-.03;
      add(body,mesh(rrBox(side+.06,Hs,Dp*.95,r*.8,bev),grayMat),sx,H-Hs/2-.02,-Dp*.02,true);
      if(o.acSwitch){var sw=mesh(new T.CylinderGeometry(.17,.17,.06,32),rubber);sw.rotation.x=Math.PI/2;add(body,sw,sx,H*.4,-Dp*.02+Dp*.475+.03,true);
        add(body,mesh(new T.PlaneGeometry(.26,.26),new T.MeshBasicMaterial({map:cTex(128,128,function(g,w,h){g.fillStyle='#2b3037';g.fillRect(0,0,w,h);g.strokeStyle='#8e98a6';g.lineWidth=3;g.strokeRect(10,10,108,108);g.fillStyle='#e8edf2';g.font='700 18px Arial';g.textAlign='center';g.fillText('AC SWITCH',64,70);})})),sx,H*.4,-Dp*.02+Dp*.475+.062,false);}
      if(o.v1500) add(body,mesh(new T.PlaneGeometry(.5,.13),new T.MeshBasicMaterial({map:cTex(256,64,function(g,w,h){g.clearRect(0,0,w,h);g.fillStyle='#fff';g.font='700 46px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText('1500V',128,34);}),transparent:true,depthWrite:false})),sx,H*.2,-Dp*.02+Dp*.475+.003,false);
    }
    if(o.redSwitch){add(body,mesh(box(.12,.16,.14),rubber),W/2+.03,H*.2,.1,true);var rs=mesh(new T.CylinderGeometry(.05,.05,.08,16),new T.MeshStandardMaterial({color:0xd0342c,roughness:.4}));rs.rotation.z=Math.PI/2;add(body,rs,W/2+.11,H*.2,.1,true);}
    if(o.feet){[-W*.36,W/2+side*.55].forEach(function(fx){add(body,mesh(rrBox(.3,.16,.55,.05,.012),rubber),fx,-.02,0,true);});}

    var pz=zf+t1*.55, cl=o.cableLen||.14, nn=o.dcRow;
    for(var k=0;k<nn;k++){var cx=nn>1?-W*.4+k*(W*.8/(nn-1)):0;
      add(body,mesh(new T.CylinderGeometry(.026,.026,cl,10),new T.MeshStandardMaterial({color:0x151515,roughness:.6})),cx,-cl/2+.02,pz,true);
      if(k%2) add(body,mesh(new T.CylinderGeometry(.031,.031,.03,10),new T.MeshStandardMaterial({color:0xd0342c,roughness:.5})),cx,-.03,pz,false);}
    var acX=side>0?(W/2+side/2):W*.36;
    add(body,mesh(new T.CylinderGeometry(.04,.04,.12,12),new T.MeshStandardMaterial({color:0x8a929d,roughness:.5})),acX,-.04,pz,true);

    var extL=-W/2-1.5, extR=W/2+side, meterX=extR+(o.hybrid?2.25:1.4);
    var dcP=new T.Vector3(-W*.4,lift-cl+.02,pz), acP=new T.Vector3(acX,lift-.1,pz);
    var dcCurve=new T.CatmullRomCurve3([new T.Vector3(extL,.75,.9),new T.Vector3(extL+.9,.1,.9),new T.Vector3(dcP.x-.1,.1,.6),dcP]);
    var acCurve=new T.CatmullRomCurve3([acP,new T.Vector3(acP.x+.05,.1,.75),new T.Vector3(meterX-.4,.1,.75),new T.Vector3(meterX,.6,.4)]);
    var cabMat=new T.MeshStandardMaterial({color:0x0d1320,roughness:.6});
    g.add(mesh(new T.TubeGeometry(dcCurve,40,.03,6,false),cabMat)); g.add(mesh(new T.TubeGeometry(acCurve,40,.03,6,false),cabMat));
    add(g,mesh(rrBox(.55,.9,.3,.04,.01),new T.MeshStandardMaterial({color:0xdfe4ea,metalness:.3,roughness:.5,envMapIntensity:1})),meterX,.45,.4,true);
    var batX=extR+.85;
    if(o.hybrid){
      add(g,mesh(rrBox(.9,1.4,.34,.07,.015),new T.MeshStandardMaterial({color:0x151d2e,metalness:.6,roughness:.4,envMapIntensity:1.3})),batX,.7,.1,true);
      add(g,mesh(box(.7,.05,.01),new T.MeshBasicMaterial({color:0xf58a2b})),batX,1.05,.275,false);
      add(g,mesh(box(.7,.03,.01),new T.MeshBasicMaterial({color:0x2f5f8f})),batX,.4,.275,false);
    }
    var fit=Math.min(2.5/(H+lift),4.1/(W+side));
    return {g:g,cover:cover,dc:dcCurve,ac:acCurve,fit:fit,cx:(extL+meterX+.4)/2,hybrid:!!o.hybrid,fins:true,lift:lift,H:H,
      anchors:{main:new T.Vector3(W*.2,lift+H+.14,0),dc:new T.Vector3(extL+.5,.3,.9),ac:new T.Vector3(meterX-.3,.3,.8),bat:new T.Vector3(batX,1.55,.1),
        cover:new T.Vector3(-W*.15,lift+H*.86,zf),pe:new T.Vector3(W*.15,lift+H*.55,Dp*.2),fins:new T.Vector3(-W*.2,lift+H+.04,-Dp/2-.1)}};
  }

  var inv=new T.Group(); scene.add(inv);
  function flowPts(col){var gg=new T.BufferGeometry();gg.setAttribute('position',new T.BufferAttribute(new Float32Array(40*3),3));var m=new T.PointsMaterial({map:glowTex,size:.3,transparent:true,depthWrite:false,color:col});var p=new T.Points(gg,m);p.frustumCulled=false;scene.add(p);return {g:gg,m:m};}
  var dcF=flowPts(0xf58a2b), acF=flowPts(0x2f5f8f);
  var labsEl=document.getElementById('labels'), labs={};
  var labText={main:'Solis inverter',dc:'DC from solar panels',ac:'AC to your building',bat:'Battery storage',cover:'Front cover and display',pe:'Power electronics',fins:'Cooling fins'};
  Object.keys(labText).forEach(function(k){var el=document.createElement('div');el.className='lbl';el.textContent=labText[k];labsEl.appendChild(el);labs[k]=el;});

  var cur=null,curKey='',popT=1,openT=0,openCur=0,sol=1;
  var hint=document.getElementById('hint'), note=document.getElementById('note'), pctEl=document.getElementById('pct');
  function setModel(k){
    if(k===curKey)return; curKey=k;
    if(cur) inv.remove(cur.g);
    cur=build(specs[k]); inv.add(cur.g); popT=reduce?1:0;
    note.textContent=specs[k].cap+' Simplified 3D model built from the Solis reference photos.';
    [].forEach.call(document.querySelectorAll('#chips button'),function(b){b.setAttribute('aria-pressed',String(b.dataset.k===k));});
  }
  document.getElementById('chips').addEventListener('click',function(e){var b=e.target.closest('button');if(b){setModel(b.dataset.k);hint.style.opacity=0;}});
  var openSl=document.getElementById('open'), solSl=document.getElementById('sol');
  openSl.addEventListener('input',function(){openT=openSl.value/100;demoDone=true;});
  solSl.addEventListener('input',function(){sol=solSl.value/100;pctEl.textContent=solSl.value+'%';});

  var dragging=false,lx=0,ly=0,px=0,py=0,parX=0,parY=0,userYaw=0,userPitch=0,autoYaw=0,autoOn=!reduce,vw=1,vh=1,narrow=1;
  host.addEventListener('pointerdown',function(e){dragging=true;lx=e.clientX;ly=e.clientY;host.setPointerCapture(e.pointerId);hint.style.opacity=0;autoOn=false;});
  host.addEventListener('pointermove',function(e){var r=host.getBoundingClientRect();px=(e.clientX-r.left)/r.width-.5;py=(e.clientY-r.top)/r.height-.5;
    if(!dragging)return;userYaw-=(e.clientX-lx)*.006;userPitch=Math.max(-.12,Math.min(.8,userPitch+(e.clientY-ly)*.004));lx=e.clientX;ly=e.clientY;});
  function up(){dragging=false;} host.addEventListener('pointerup',up); host.addEventListener('pointercancel',up);
  function resize(){vw=host.clientWidth;vh=host.clientHeight;renderer.setSize(vw,vh,false);camera.aspect=vw/vh;if(vw>=900)camera.setViewOffset(vw,vh,-vw*.17,0,vw,vh);else if(vw<560)camera.setViewOffset(vw,vh,vw*.1,-vh*.26,vw,vh);else camera.clearViewOffset();camera.updateProjectionMatrix();narrow=vw<560?2.05:(vw<900?1.3:1);}
  if(window.ResizeObserver) new ResizeObserver(resize).observe(host); else window.addEventListener('resize',resize);
  resize(); setModel('single');

  function ease(t){return 1-Math.pow(1-t,3);}
  var clock=new T.Clock(), demoDone=reduce, tmp=new T.Vector3(), v=new T.Vector3(), lastDisp=-1, tgt=new T.Vector3(0,1.4,0), introK=reduce?1:0, NF=40;
  function frame(){
    var dt=Math.min(clock.getDelta(),.05), time=clock.elapsedTime, k=1-Math.exp(-dt*3.2);
    if(popT<1) popT=Math.min(1,popT+dt/1.1);
    if(introK<1) introK=Math.min(1,introK+dt/2);
    if(!demoDone&&time>2.6){demoDone=true;openT=.6;openSl.value=60;}
    if(autoOn) autoYaw+=dt*.12;
    var pk=ease(popT), iy=1-ease(introK);
    var s=cur.fit*(.15+.85*pk);
    inv.scale.setScalar(Math.max(s,.0001)); inv.rotation.y=(1-pk)*.9+iy*Math.PI;
    tgt.x+=((cur.cx*cur.fit)-tgt.x)*k; tgt.y+=((1.25*cur.fit+.3)-tgt.y)*k;
    openCur+=(openT-openCur)*(1-Math.exp(-dt*4));
    cur.cover.position.z=openCur*1.1; cur.cover.position.y=openCur*.15;

    var Y=-.5+autoYaw+userYaw, P=Math.max(.04,.2+userPitch), R=12.5*narrow+iy*4;
    camera.position.set(tgt.x+Math.sin(Y)*Math.cos(P)*R+parX*.8, tgt.y+Math.sin(P)*R+parY*.6, Math.cos(Y)*Math.cos(P)*R);
    parX+=(px-parX)*.05; parY+=(py-parY)*.05; camera.lookAt(tgt);

    inv.updateMatrixWorld(true);
    var da=dcF.g.attributes.position.array, aa=acF.g.attributes.position.array;
    for(var n=0;n<NF;n++){var u=(n/NF+time*.2)%1;
      cur.dc.getPoint(u,tmp);cur.g.localToWorld(tmp);da[n*3]=tmp.x;da[n*3+1]=tmp.y;da[n*3+2]=tmp.z;
      cur.ac.getPoint(u,tmp);cur.g.localToWorld(tmp);aa[n*3]=tmp.x;aa[n*3+1]=tmp.y;aa[n*3+2]=tmp.z;}
    dcF.g.attributes.position.needsUpdate=true; acF.g.attributes.position.needsUpdate=true;
    dcF.m.opacity=acF.m.opacity=(.1+.9*sol)*pk; dcF.m.size=acF.m.size=(.14+.2*sol)*cur.fit;
    var pulse=.55+.45*Math.sin(time*3)*(.3+.7*sol); ledMat.color.setRGB(pulse,.46*pulse,.12*pulse);
    if(time-lastDisp>.3){lastDisp=time;drawDisplay(Math.round(sol*100),time);}

    function place(name,show,dz,dy){var el=labs[name];if(!show||pk<.95){el.style.opacity=0;return;}
      v.copy(cur.anchors[name]);v.z+=dz||0;v.y+=dy||0;cur.g.localToWorld(v);v.project(camera);
      el.style.transform='translate('+((v.x*.5+.5)*vw+12)+'px,'+((-v.y*.5+.5)*vh-12)+'px)';el.style.opacity=1;}
    place('main',true);place('dc',true);place('ac',true);place('bat',cur.hybrid);
    place('cover',openCur>.25,openCur*1.1,openCur*.15);place('pe',openCur>.3);place('fins',openCur>.3&&cur.fins);

    renderer.render(scene,camera);
    requestAnimationFrame(frame);
  }
  frame();
})();
