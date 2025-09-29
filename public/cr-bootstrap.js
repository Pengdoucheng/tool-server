
document.addEventListener("DOMContentLoaded", () => {
  const $ = (s) => document.querySelector(s);
  const setBtn = $("#crSetWeeklyGoals");
  if (setBtn) setBtn.addEventListener("click", () => {
    const raw = prompt("輸入本週目標（用逗號分隔，最多 7 項）：\n例如：早睡、喝水2000ml、練字20分鐘");
    if (!raw) return;
    const arr = raw.split(",").map(s => s.trim()).filter(Boolean);
    window.cr && window.cr.setWeeklyGoals(arr);
  });
  const quick = $("#crQuickDone");
  if (quick) quick.addEventListener("click", () => { window.cr && window.cr.updateToday({completedDelta:1,totalDelta:1}); });
});// ===== 使用者教學小卡 =====
document.addEventListener("DOMContentLoaded", () => {
  const onboardKey = "crOnboardingDone";
  const onboardEl = document.getElementById("crOnboarding");
  const btn = document.getElementById("crOnboardBtn");

  if (!localStorage.getItem(onboardKey) && onboardEl && btn) {
    onboardEl.style.display = "flex"; // 顯示小卡
    btn.addEventListener("click", () => {
      onboardEl.style.display = "none";
      localStorage.setItem(onboardKey, "1"); // 確保下次不再顯示
    });
  } else if (onboardEl) {
    onboardEl.style.display = "none";
  }
});
// ====== 時間工具（Pomodoro / 倒數 / 碼錶）======
(function(){
  const LS_KEY = "timeToolsV1";
  const el = s => document.querySelector(s);
  const els = s => Array.from(document.querySelectorAll(s));
  const fmtMMSS = (t) => {
    t = Math.max(0, Math.floor(t));
    const m = Math.floor(t/60), s = t%60;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };
  const fmtMS = (ms) => {
    const t = Math.floor(ms/100);
    const m = Math.floor(t/600), s = Math.floor((t%600)/10), ds = t%10;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${ds}`;
  };
  const todayKey = () => new Date().toISOString().slice(0,10);
  const bell = () => { try{
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = "sine"; o.frequency.value = 880;
    o.connect(g); g.connect(ctx.destination);
    o.start(); g.gain.setValueAtTime(0.2, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    setTimeout(()=>{o.stop();ctx.close();}, 650);
  }catch(e){} };

  const load = ()=> { try{ return JSON.parse(localStorage.getItem(LS_KEY)) || {}; }catch(e){ return {}; } };
  const save = (st)=> localStorage.setItem(LS_KEY, JSON.stringify(st));

  document.addEventListener("DOMContentLoaded", () => {
    // ===== 面板開關 & 分頁 =====
    const panel = el("#tools-panel");
    const toggle = el("#tools-toggle");
    const closeBtn = el("#tools-close");
    if (toggle) toggle.onclick = () => panel.classList.add("is-open");
    if (closeBtn) closeBtn.onclick = () => panel.classList.remove("is-open");
    els(".tools-tab").forEach(b=>{
      b.onclick = ()=>{
        els(".tools-tab").forEach(x=>x.classList.remove("is-active"));
        b.classList.add("is-active");
        const tab = b.dataset.tab;
        els(".tools-pane").forEach(p=> p.style.display = "none");
        el(`#pane-${tab}`).style.display = "block";
      };
    });

    // ===== Pomodoro =====
    const s = { mode:"focus", remain:25*60, running:false, roundsDone:0, focus:25, brk:5, long:15, rounds:4, autoNext:true, todayPomos:0 };
    const dP = el("#pomo-display"), mLabel = el("#pomo-mode"), rDone = el("#pomo-done"), tToday = el("#pomo-today");
    const iF = el("#pomo-focus"), iB = el("#pomo-break"), iL = el("#pomo-long"), iR = el("#pomo-rounds"), iAuto = el("#pomo-autonext");

    function savePomo(st){ const all = load(); all.pomo = st ?? {mode:s.mode, remain:s.remain, running:s.running, roundsDone:s.roundsDone, focus:s.focus, brk:s.brk, long:s.long, rounds:s.rounds, autoNext:s.autoNext, todayPomos:s.todayPomos, today: todayKey()}; save(all); }
    function loadPomo(){
      const st = load().pomo || {};
      Object.assign(s, st);
      if(iF){ iF.value = s.focus; iB.value = s.brk; iL.value = s.long; iR.value = s.rounds; iAuto.checked = !!s.autoNext; }
      renderPomo();
    }
    function renderPomo(){
      if(dP) dP.textContent = fmtMMSS(s.remain);
      if(mLabel) mLabel.textContent = s.mode==="focus"?"專注":(s.mode==="break"?"短休":"長休");
      if(rDone) rDone.textContent = s.roundsDone;
      if(tToday){
        const p = (load().pomo || {});
        tToday.textContent = (p.today===todayKey()? (p.todayPomos||0): 0);
      }
    }
    function setPhase(phase){
      s.mode = phase;
      s.remain = (phase==="focus"? s.focus : phase==="break"? s.brk : s.long) * 60;
      renderPomo(); savePomo();
    }
    [iF,iB,iL,iR].forEach(inp=> inp && (inp.onchange = ()=>{
      s.focus = parseInt(iF.value)||25; s.brk=parseInt(iB.value)||5; s.long=parseInt(iL.value)||15; s.rounds=parseInt(iR.value)||4;
      if(s.mode==="focus") s.remain = s.focus*60;
      renderPomo(); savePomo();
    }));
    if(iAuto) iAuto.onchange = ()=>{ s.autoNext = iAuto.checked; savePomo(); };

    let tickId=null;
    function tick(){
      if(!s.running) return;
      s.remain -= 1;
      if(s.remain <= 0){
        if(s.mode==="focus"){
          const all = load(); const p = all.pomo || {};
          if(p.today !== todayKey()){ p.today = todayKey(); p.todayPomos = 0; }
          p.todayPomos = (p.todayPomos||0) + 1;
          all.pomo = p; save(all);
        }
        bell();
        if(s.mode==="focus"){
          s.roundsDone++;
          if(s.roundsDone % s.rounds === 0){ setPhase("long"); }
          else { setPhase("break"); }
        }else{
          setPhase("focus");
        }
        if(!s.autoNext){ s.running=false; savePomo(); renderPomo(); return; }
      }
      renderPomo(); savePomo();
      tickId = setTimeout(tick, 1000);
    }

    el("#pomo-start")?.addEventListener("click", ()=>{ if(!s.running){ s.running=true; savePomo(); tick(); }});
    el("#pomo-pause")?.addEventListener("click", ()=>{ s.running=false; savePomo(); if(tickId) clearTimeout(tickId); });
    el("#pomo-reset")?.addEventListener("click", ()=>{ s.running=false; s.roundsDone=0; setPhase("focus"); if(tickId) clearTimeout(tickId); });
    el("#pomo-skip")?.addEventListener("click", ()=>{
      s.running=false;
      if(s.mode==="focus"){
        s.roundsDone++;
        setPhase(s.roundsDone % s.rounds === 0 ? "long" : "break");
      }else{
        setPhase("focus");
      }
      savePomo(); renderPomo();
    });

    // ===== 倒數 =====
    const cd = { remain: 10*60, running:false, init: 10*60 };
    function loadCd(){
      const st = load().cd || {};
      Object.assign(cd, st);
      const m = Math.floor(cd.init/60), s = cd.init%60;
      const mEl = el("#cd-min"), sEl = el("#cd-sec");
      if(mEl) mEl.value = m; if(sEl) sEl.value = s;
      const disp = el("#cd-display"); if(disp) disp.textContent = fmtMMSS(cd.remain);
    }
    function saveCd(){ const all=load(); all.cd = cd; save(all); }
    let cdId=null;
    function cdTick(){
      if(!cd.running) return;
      cd.remain -= 1;
      if(cd.remain<=0){ cd.running=false; bell(); }
      el("#cd-display").textContent = fmtMMSS(cd.remain);
      saveCd();
      cdId = setTimeout(cdTick, 1000);
    }
    el("#cd-start")?.addEventListener("click", ()=>{
      const m = parseInt(el("#cd-min").value)||0;
      const s = parseInt(el("#cd-sec").value)||0;
      cd.init = m*60+s; if(cd.remain===0 || cd.remain===cd.init) cd.remain = cd.init;
      cd.running = true; saveCd(); cdTick();
    });
    el("#cd-pause")?.addEventListener("click", ()=>{ cd.running=false; saveCd(); if(cdId) clearTimeout(cdId); });
    el("#cd-reset")?.addEventListener("click", ()=>{
      const m = parseInt(el("#cd-min").value)||0;
      const s = parseInt(el("#cd-sec").value)||0;
      cd.init = m*60+s; cd.remain = cd.init; cd.running=false; saveCd();
      el("#cd-display").textContent = fmtMMSS(cd.remain);
    });

    // ===== 碼錶 =====
    const sw = { running:false, startAt:0, elapsed:0 };
    function loadSw(){ Object.assign(sw, load().sw||{}); el("#sw-display").textContent = fmtMS(sw.elapsed||0); }
    function saveSw(){ const all=load(); all.sw = sw; save(all); }
    let rafId=null;
    function swLoop(){
      if(!sw.running) return;
      const now = performance.now();
      const ms = sw.elapsed + (now - sw.startAt);
      el("#sw-display").textContent = fmtMS(ms);
      rafId = requestAnimationFrame(swLoop);
    }
    el("#sw-start")?.addEventListener("click", ()=>{
      if(sw.running) return;
      sw.running=true; sw.startAt = performance.now(); saveSw(); swLoop();
    });
    el("#sw-pause")?.addEventListener("click", ()=>{
      if(!sw.running) return;
      sw.running=false; sw.elapsed += performance.now() - sw.startAt; saveSw();
      if(rafId) cancelAnimationFrame(rafId);
    });
    el("#sw-reset")?.addEventListener("click", ()=>{
      sw.running=false; sw.elapsed=0; saveSw();
      el("#sw-display").textContent = "00:00.0";
      el("#sw-laps").innerHTML = "";
    });
    el("#sw-lap")?.addEventListener("click", ()=>{
      const text = el("#sw-display").textContent;
      const li = document.createElement("li"); li.textContent = text;
      el("#sw-laps").appendChild(li);
    });

    // 載入既有狀態
    (function initAll(){
      // 如果第一次載入，確保 Pomodoro 預設顯示 25:00
      loadPomo(); loadCd(); loadSw();
    })();
  });
})();


