
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 644576c (feat: achievements system stable version)
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
<<<<<<< HEAD
=======
document.addEventListener("DOMContentLoaded",()=>{
  const setBtn=document.getElementById("crSetWeeklyGoals");
  if(setBtn)setBtn.onclick=()=>{const raw=prompt("輸入本週目標（逗號分隔）");if(!raw)return;window.cr&& (window.cr.setWeeklyGoals?window.cr.setWeeklyGoals(raw.split(",").map(s=>s.trim())):null);};
  const quick=document.getElementById("crQuickDone");
  if(quick)quick.onclick=()=>{window.cr&&window.cr.addTaskToday("(快速測試)",true);};
>>>>>>> 93764f6 (feat: add achievements system and weekly goals)
=======
document.addEventListener("DOMContentLoaded",()=>{
  const setBtn=document.getElementById("crSetWeeklyGoals");
  if(setBtn)setBtn.onclick=()=>{
    const raw=prompt("輸入本週目標（用逗號分隔）");
    if(!raw)return;
    window.cr.setWeeklyGoals(raw.split(",").map(s=>s.trim()));
  };
  const quick=document.getElementById("crQuickDone");
  if(quick)quick.onclick=()=>{window.cr.updateToday({completedDelta:1,totalDelta:1});};
>>>>>>> 6c78f29 (feat: achievements system stable version)
=======
>>>>>>> 644576c (feat: achievements system stable version)
});
