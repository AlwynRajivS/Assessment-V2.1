/* commerce-kit.js – Equation editor (MathLive) + Drive image upload for admin.html */
(function(){
  var MATHLIVE='https://cdn.jsdelivr.net/npm/mathlive@0.98.6/dist/mathlive.min.js';
  var loaded=false;
  function loadMathLive(cb){
    if(loaded||window.customElements&&customElements.get('math-field')){loaded=true;return cb();}
    var s=document.createElement('script');s.src=MATHLIVE;s.onload=function(){loaded=true;cb();};
    s.onerror=function(){alert('Could not load the equation editor (check internet).');};
    document.head.appendChild(s);
  }
  function target(){return document.getElementById(window.lastFocused||'aq-qtext')||document.getElementById('aq-qtext');}

  window.openEquationEditor=function(){
    loadMathLive(function(){
      var ov=document.createElement('div');
      ov.style.cssText='position:fixed;inset:0;background:#0007;z-index:99999;display:flex;align-items:center;justify-content:center;padding:14px';
      ov.innerHTML='<div style="background:#fff;border-radius:14px;padding:18px;max-width:640px;width:100%;max-height:92vh;overflow:auto">'+
        '<h3 style="margin:0 0 8px;color:#3567c4">∑ Equation Editor</h3>'+
        '<p style="font-size:12px;color:#6b7794;margin:0 0 8px">Type or use the on-screen keyboard (⌨ icon). Inserts into: <b>'+(window.lastFocused||'aq-qtext')+'</b></p>'+
        '<math-field id="ck-mf" style="width:100%;font-size:26px;border:1px solid #cfd7ea;border-radius:8px;padding:8px" virtual-keyboard-mode="onfocus"></math-field>'+
        '<div style="margin-top:8px;font-size:12px;color:#6b7794">LaTeX: <code id="ck-tex"></code></div>'+
        '<label style="font-size:13px;display:block;margin-top:8px"><input type="checkbox" id="ck-block"> Display (centered block, $$…$$)</label>'+
        '<div style="margin-top:12px;display:flex;gap:8px;justify-content:flex-end"><button id="ck-cancel" class="btn-secondary" type="button">Cancel</button><button id="ck-ok" class="btn-primary" type="button">Insert</button></div></div>';
      document.body.appendChild(ov);
      var mf=ov.querySelector('#ck-mf');
      mf.addEventListener('input',function(){ov.querySelector('#ck-tex').textContent=mf.value;});
      setTimeout(function(){mf.focus();},50);
      function close(){if(window.mathVirtualKeyboard)try{window.mathVirtualKeyboard.hide();}catch(e){}document.body.removeChild(ov);}
      ov.querySelector('#ck-cancel').onclick=close;
      ov.querySelector('#ck-ok').onclick=function(){
        var tex=(mf.value||'').trim();if(!tex){close();return;}
        var wrap=ov.querySelector('#ck-block').checked?'$$'+tex+'$$':'$'+tex+'$';
        var f=target(),a=f.selectionStart==null?f.value.length:f.selectionStart,b=f.selectionEnd==null?a:f.selectionEnd;
        f.value=f.value.slice(0,a)+wrap+f.value.slice(b);f.focus();f.selectionStart=f.selectionEnd=a+wrap.length;
        if(typeof livePreview==='function')livePreview();close();
      };
    });
  };

  function toBase64(file){return new Promise(function(res,rej){var r=new FileReader();r.onload=function(){res(r.result);};r.onerror=rej;r.readAsDataURL(file);});}
  // Downscale big photos in the browser so uploads stay below the 2 MB server limit
  function shrink(file){return new Promise(function(res){
    if(file.size<900*1024||!/image\/(png|jpeg|webp)/.test(file.type)) return res({data:null,file:file});
    var img=new Image(),u=URL.createObjectURL(file);
    img.onload=function(){var m=1400,sc=Math.min(1,m/Math.max(img.width,img.height)),c=document.createElement('canvas');
      c.width=img.width*sc;c.height=img.height*sc;c.getContext('2d').drawImage(img,0,0,c.width,c.height);
      URL.revokeObjectURL(u);res({data:c.toDataURL('image/jpeg',.85),mime:'image/jpeg'});};
    img.onerror=function(){res({data:null,file:file});};img.src=u;});}

  window.uploadQuestionImageFile=function(input){
    var f=input.files&&input.files[0];if(!f)return;
    var st=document.getElementById('aq-img-status');st.textContent='Uploading…';
    shrink(f).then(function(s){return s.data?{d:s.data,m:s.mime}:toBase64(f).then(function(d){return{d:d,m:f.type};});})
    .then(function(p){
      google.script.run.withSuccessHandler(function(r){
        document.getElementById('aq-image').value=r.url;st.textContent='✓ Uploaded to Drive';input.value='';
        if(typeof livePreview==='function')livePreview();
      }).withFailureHandler(function(e){st.textContent='❌ '+e.message;}).uploadQuestionImage(TOKEN,p.d,p.m,f.name);
    });
  };
})();
