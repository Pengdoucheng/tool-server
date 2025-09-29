
(function(){
<<<<<<< HEAD
  const LS_KEY = "crProgressV1";
  const todayStr = () => new Date().toISOString().slice(0,10);
  const defaultState = () => ({version:1,days:{},streak:0,goals:{weekISO:"",items:[]},badges:{}});
  function load(){ try{ return JSON.parse(localStorage.getItem(LS_KEY)) || defaultState(); }catch(e){ return defaultState(); } }
  function save(st){ localStorage.setItem(LS_KEY, JSON.stringify(st)); document.dispatchEvent(new CustomEvent("cr:progress-updated",{detail:st})); }
  function getISOWeek(d){ const date=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())); const dayNum=date.getUTCDay()||7; date.setUTCDate(date.getUTCDate()+4-dayNum); const yStart=new Date(Date.UTC(date.getUTCFullYear(),0,1)); const weekNo=Math.ceil((((date-yStart)/86400000)+1)/7); return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2,"0")}`; }
  const cr = window.cr = window.cr || {};
  cr.updateToday = function({completedDelta=0,totalDelta=0}){
    const st = load(); const key=todayStr(); if(!st.days[key]) st.days[key]={completed:0,total:0};
    const prev=st.days[key]; st.days[key]={completed:Math.max(0,prev.completed+completedDelta), total:Math.max(0,prev.total+totalDelta)};
    const today=new Date(); const y=new Date(today); y.setDate(today.getDate()-1); const yKey=y.toISOString().slice(0,10);
    const isTodayDone=st.days[key].completed>0; const wasYesterdayDone = st.days[yKey]?.completed>0;
    if(isTodayDone){ st.streak = (wasYesterdayDone ? st.streak+1 : 1); }
    checkBadges(st); save(st); return st;
  };
  cr.setWeeklyGoals = function(goals){ const st=load(); st.goals.weekISO=getISOWeek(new Date()); st.goals.items=(goals||[]).slice(0,7).map(x=> (typeof x==="string"?{text:x,done:false}:x)); save(st); return st; };
  cr.toggleGoal = function(i, done){ const st=load(); if(st.goals.items[i]) st.goals.items[i].done = (done ?? !st.goals.items[i].done); save(st); return st; };
  cr.getMonthlyStats = function(y, m){ const st=load(); const mk=`${y}-${String(m+1).padStart(2,"0")}`; let c=0,t=0,d=0; Object.entries(st.days).forEach(([day,v])=>{ if(day.indexOf(mk)===0){ c+=v.completed; t+=(v.total||v.completed); d+=1; } }); const rate=t>0?Math.round((c/t)*100):0; return {completed:c,total:t,days:d,rate}; };
  function sumCompleted(st){ return Object.values(st.days).reduce((acc,v)=> acc+(v.completed||0),0); }
  function checkBadges(st){ const tot=sumCompleted(st); if(tot>=1) st.badges.firstBlood=true; if(tot>=10) st.badges.tenDone=true; if(tot>=50) st.badges.fiftyDone=true; if(tot>=100) st.badges.hundredDone=true; if(st.streak>=3) st.badges.streak3=true; if(st.streak>=7) st.badges.streak7=true; if(st.streak>=21) st.badges.streak21=true; const now=new Date(); const m=cr.getMonthlyStats(now.getFullYear(), now.getMonth()); if(m.rate>=80) st.badges.month80=true; if(m.rate>=95) st.badges.month95=true; }
  function render(){ const st=load(); const now=new Date(); const m=cr.getMonthlyStats(now.getFullYear(), now.getMonth()); const bar=document.querySelector('[data-cr-progress-bar]'); const label=document.querySelector('[data-cr-progress-label]'); if(bar) bar.style.width=m.rate+"%"; if(label) label.textContent=`${m.rate}%（${m.completed}/${m.total}）`; const streakEl=document.querySelector('[data-cr-streak]'); if(streakEl) streakEl.textContent=st.streak+" 天"; const badgeWrap=document.querySelector('[data-cr-badges]'); if(badgeWrap){ badgeWrap.innerHTML=""; const defs={ firstBlood:"完成第一個任務", tenDone:"累積完成 10 個任務", fiftyDone:"累積完成 50 個任務", hundredDone:"累積完成 100 個任務", streak3:"連續 3 天完成任務", streak7:"連續 7 天完成任務", streak21:"連續 21 天完成任務", month80:"本月完成率 ≧ 80%", month95:"本月完成率 ≧ 95%"}; Object.keys(defs).forEach(key=>{ const active=!!st.badges[key]; const div=document.createElement("div"); div.className="cr-badge"+(active?" is-active":""); div.textContent=defs[key]; badgeWrap.appendChild(div); }); } const goalsList=document.querySelector('[data-cr-goals]'); if(goalsList){ goalsList.innerHTML=""; st.goals.items.forEach((g,i)=>{ const li=document.createElement("li"); li.className="cr-goal"; const cb=document.createElement("input"); cb.type="checkbox"; cb.checked=!!g.done; cb.addEventListener("change", ()=> cr.toggleGoal(i, cb.checked)); const span=document.createElement("span"); span.textContent=g.text; li.appendChild(cb); li.appendChild(span); goalsList.appendChild(li); }); } }
  document.addEventListener("cr:progress-updated", render); document.addEventListener("DOMContentLoaded", render);
  window.cr.__debugAdd = function(){ cr.updateToday({completedDelta:1,totalDelta:1}); };
})();// ===== 使用者教學小卡 =====
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

=======
  const LS_KEY="crProgressV2";
  const todayStr=()=>new Date().toISOString().slice(0,10);
  const defaultState=()=>({version:2,days:{},streak:0,goals:{items:[]},badges:{}});
  function load(){try{return JSON.parse(localStorage.getItem(LS_KEY))||defaultState();}catch(e){return defaultState();}}
  function save(st){localStorage.setItem(LS_KEY,JSON.stringify(st));document.dispatchEvent(new CustomEvent("cr:progress-updated",{detail:st}));}
  const cr=window.cr=window.cr||{};
  cr.addTaskToday=function(text,done=false){const st=load();const key=todayStr();if(!st.days[key])st.days[key]={tasks:[],completed:0,total:0};st.days[key].tasks.push({text,done});st.days[key].total++;if(done)st.days[key].completed++;save(st);return st;};
  cr.toggleTask=function(date,i,done){const st=load();if(st.days[date]&&st.days[date].tasks[i]){const t=st.days[date].tasks[i];if(t.done!==done){t.done=done;st.days[date].completed+=done?1:-1;save(st);}}return st;};
  cr.getDay=function(date){const st=load();return st.days[date]||{tasks:[],completed:0,total:0};};
  cr.getStats=function(mode){const st=load();const base=new Date();let start,end;if(mode==="week"){const d=(base.getDay()+6)%7;start=new Date(base);start.setDate(start.getDate()-d);end=new Date(start);end.setDate(start.getDate()+6);}else{start=new Date(base.getFullYear(),base.getMonth(),1);end=new Date(base.getFullYear(),base.getMonth()+1,0);}const list=[];for(let d=new Date(start);d<=end;d.setDate(d.getDate()+1)){const key=d.toISOString().slice(0,10);const rec=st.days[key];if(rec)list.push({date:key,completed:rec.completed,total:rec.total});}const sum=list.reduce((a,v)=>{a.c+=v.completed;a.t+=v.total;return a;},{c:0,t:0});return{completed:sum.c,total:sum.t,rate:sum.t?Math.round(sum.c/sum.t*100):0,days:list};};
  function render(){const st=load();const m=cr.getStats("month");const bar=document.querySelector('[data-cr-progress-bar]');if(bar)bar.style.width=m.rate+"%";const lbl=document.querySelector('[data-cr-progress-label]');if(lbl)lbl.textContent=`${m.rate}%（${m.completed}/${m.total}）`;const goals=document.querySelector('[data-cr-goals]');if(goals){goals.innerHTML="";st.goals.items.forEach((g,i)=>{const li=document.createElement("li");li.className="cr-goal";const cb=document.createElement("input");cb.type="checkbox";cb.checked=!!g.done;cb.onchange=()=>{g.done=cb.checked;save(st);};const span=document.createElement("span");span.textContent=g.text;li.appendChild(cb);li.appendChild(span);goals.appendChild(li);});}};
  document.addEventListener("cr:progress-updated",render);document.addEventListener("DOMContentLoaded",render);
})();
>>>>>>> 93764f6 (feat: add achievements system and weekly goals)
