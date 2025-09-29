

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
});
