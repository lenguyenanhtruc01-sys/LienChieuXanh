(() => {
  const KEY = "lien-chieu-xanh-demo-v1";
  const seed = {
    reports: [
      {id:"LCX-001",location:"Khu vực Âu Cơ",type:"Rác chưa được thu gom",description:"Rác sinh hoạt còn tại điểm tập kết sau giờ dự kiến.",severity:"medium",status:"waiting",created:"2026-09-26T18:25:00",x:26,y:35},
      {id:"LCX-002",location:"Khu vực Xuân Thiều",type:"Rác bỏ sai nơi",description:"Một số túi rác đặt gần lối đi chung.",severity:"low",status:"working",created:"2026-09-26T09:10:00",x:70,y:29},
      {id:"LCX-003",location:"Khu vực Đào Sư Tích",type:"Rác tại mương / cống",description:"Cần kiểm tra điểm rác gần cửa thu nước (tình huống giả định).",severity:"high",status:"waiting",created:"2026-09-25T15:40:00",x:62,y:73}
    ],
    bulky:[],
    joined:[], shifts:[]
  };
  const schedule = {
    auco:{name:"Khu vực Âu Cơ",days:["Thứ 2","Thứ 4","Thứ 6"],time:"18:00 – 20:00"},
    xuanchieu:{name:"Khu vực Xuân Thiều",days:["Thứ 3","Thứ 5","Thứ 7"],time:"17:30 – 19:30"},
    daosutich:{name:"Khu vực Đào Sư Tích",days:["Thứ 2","Thứ 5","Chủ nhật"],time:"18:30 – 20:30"}
  };
  const activities = [
    {id:"ACT-01",icon:"✳",title:"Buổi vệ sinh khu dân cư",desc:"Tập trung dọn rác thông thường tại nơi được phép, có người phụ trách và dụng cụ phù hợp.",date:"Lịch hẹn: chưa được xác nhận",people:"Hoạt động giả định",button:"Đánh dấu quan tâm"},
    {id:"ACT-02",icon:"♻",title:"Khảo sát điểm tồn đọng",desc:"Khảo sát tại chỗ, chụp ảnh đối chứng rồi chuyển việc vượt khả năng cho đơn vị phụ trách.",date:"Lịch hẹn: chưa được xác nhận",people:"Hoạt động giả định",button:"Đánh dấu quan tâm"}
  ];
  const $ = (sel) => document.querySelector(sel);
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  let data;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    data = saved && Array.isArray(saved.reports) && Array.isArray(saved.bulky) && Array.isArray(saved.joined) ? saved : structuredClone(seed);
  } catch { data = structuredClone(seed); }
  if (!Array.isArray(data.shifts)) data.shifts=[];
  // Earlier demo versions let any visitor mark a case complete. Reopen such cases until reviewed evidence exists.
  data.reports.forEach(r=>{ if(r.status==="done" && !r.verified) r.status="working"; });
  function save() { try { localStorage.setItem(KEY, JSON.stringify(data)); return true; } catch { toast("Bộ nhớ trình duyệt đã đầy. Hãy thử ảnh nhỏ hơn."); return false; } }
  let toastTimer;
  function toast(message) { const node=$("#toast"); node.textContent=message; node.classList.add("show"); clearTimeout(toastTimer); toastTimer=setTimeout(()=>node.classList.remove("show"),3800); }
  const statusLabel = {waiting:"Chờ tiếp nhận",working:"Đang xử lý",review:"Chờ duyệt kết quả",done:"Đã xử lý"};
  function badge(s) { return '<span class="badge '+esc(s)+'">'+(statusLabel[s]||"Chờ tiếp nhận")+'</span>'; }
  function dateText(s) { const d=new Date(s); return Number.isNaN(d.getTime()) ? "" : d.toLocaleString("vi-VN",{dateStyle:"short",timeStyle:"short"}); }
  function show(view) {
    if (!$("#view-"+view)) return;
    document.querySelectorAll(".view").forEach(node=>{ const on=node.id==="view-"+view;node.hidden=!on;node.classList.toggle("active",on); });
    document.querySelectorAll(".nav-item").forEach(node=>{const on=node.dataset.view===view;node.classList.toggle("active",on);if(on)node.setAttribute("aria-current","page");else node.removeAttribute("aria-current");});
    location.hash=view==="home"?"":view;
    window.scrollTo({top:0,behavior:"instant"});
    $("#main").focus({preventScroll:true});
    render();
  }
  function mapMarkup(items) {
    const coords=[[26,35],[70,29],[62,73],[35,69],[83,57],[15,74],[50,43]];
    return '<span class="map-street a">KHU VỰC ÂU CƠ</span><span class="map-street b">XUÂN THIỀU</span><span class="map-street c">ĐÀO SƯ TÍCH</span>'+items.slice(0,20).map((r,i)=>{const xy=Number.isFinite(r.x)&&Number.isFinite(r.y)?[r.x,r.y]:coords[i%coords.length];return '<span class="map-pin '+esc(r.status)+'" style="left:'+xy[0]+'%;top:'+xy[1]+'%" title="'+esc(r.location)+' · '+esc(statusLabel[r.status])+'"></span>';}).join("");
  }
  function renderHome() {
    const count=data.reports.length, done=data.reports.filter(r=>r.status==="done").length;
    const stats=[["Điểm được báo",count,"◉"],["Đã duyệt kết quả",done,"✓"],["Yêu cầu cồng kềnh",data.bulky.length,"▣"],["Ca sẵn sàng",data.shifts.length,"✳"]];
    $("#stats").innerHTML=stats.map(([label,num,icon])=>'<div class="stat"><div class="stat-top">'+label+'<span class="stat-icon" aria-hidden="true">'+icon+'</span></div><strong>'+num+'</strong><small>Số liệu trong bản demo</small></div>').join("");
    $("#navCount").textContent=count;
    $("#homeMap").innerHTML=mapMarkup(data.reports);
    $("#recentReports").innerHTML=[...data.reports].reverse().slice(0,3).map(r=>'<div class="recent-row"><span><b>'+esc(r.location)+'</b><small>'+esc(r.type)+'</small></span>'+badge(r.status)+'</div>').join("") || '<p class="empty">Chưa có điểm rác.</p>';
    const area=schedule[$("#homeArea").value]||schedule.auco;
    $("#homeSchedule").innerHTML='<div class="schedule-short">'+area.days.map(day=>'<div><b>'+day+'</b><small>'+area.time+'</small></div>').join("")+'</div>';
  }
  function renderReports() {
    const filter=$("#statusFilter").value;
    const items=[...data.reports].reverse().filter(r=>filter==="all"||r.status===filter);
    $("#reportCount").textContent=items.length+" ghi nhận · dữ liệu demo";
    $("#reportMap").innerHTML=mapMarkup(items);
    $("#reportCards").innerHTML=items.length ? items.map(r=>'<article class="report-card"><div class="report-card-header"><div><h3>'+esc(r.location)+'</h3><span class="meta">'+esc(r.id)+' · '+dateText(r.created)+'</span></div>'+badge(r.status)+'</div><p><b>'+esc(r.type)+'</b> · '+esc(r.description)+'</p>'+(r.assignee?'<p><b>Hướng xử lý:</b> '+esc(r.assignee)+'</p>':'')+(r.status==="review"?'<p class="review-note">Đã có kết quả đề xuất; đang chờ người trực kiểm tra.</p>':'')+(r.photo||r.verified&&r.afterPhoto?'<div class="photo-pair">'+(r.photo?'<figure><img src="'+esc(r.photo)+'" alt="Ảnh điểm rác do người dùng chọn"><figcaption>Hiện trường · demo</figcaption></figure>':'')+(r.verified&&r.afterPhoto?'<figure><img src="'+esc(r.afterPhoto)+'" alt="Ảnh kết quả đã được duyệt trong bản demo"><figcaption>Kết quả đã duyệt · demo</figcaption></figure>':'')+'</div>':'')+(r.verified&&r.confirmation?'<p><b>Xác nhận kết quả:</b> '+esc(r.confirmation)+'</p>':'')+'</article>').join("") : '<div class="empty">Không có điểm rác ở trạng thái này.</div>';
  }
  function renderSchedule() {
    const area=schedule[$("#scheduleArea").value]||schedule.auco;
    $("#scheduleDetail").innerHTML='<div class="day-grid">'+area.days.map(d=>'<div class="day-card"><small>NGÀY THU GOM MINH HỌA</small><strong>'+d+'</strong><span>'+area.time+'</span></div>').join("")+'</div><p class="schedule-disclaimer">Lịch mô phỏng cho '+esc(area.name)+'. Nơi tập kết và khung giờ thực tế cần được xác minh; không dùng lịch này để bỏ rác.</p>';
  }
  function renderBulky() {
    $("#bulkyCount").textContent=data.bulky.length+" yêu cầu demo";
    $("#bulkyList").innerHTML=data.bulky.length?[...data.bulky].reverse().map(r=>'<article class="mini-card"><h3>'+esc(r.type)+' · '+esc(r.quantity)+' món</h3><p>'+esc(r.address)+'</p><small>Thời gian thuận tiện: '+dateText(r.time)+'</small>'+(r.photo?'<img class="report-photo" src="'+esc(r.photo)+'" alt="Ảnh đồ vật do người dùng chọn">':'')+'<br><span class="badge waiting">Đã ghi nhận trong demo</span></article>').join(""):'<p class="empty">Chưa có yêu cầu. Điền biểu mẫu bên cạnh để thử quy trình.</p>';
  }
  function renderActivities() {
    $("#activityCards").innerHTML=activities.map(a=>'<article class="panel activity-card"><div class="activity-icon" aria-hidden="true">'+a.icon+'</div><h2>'+esc(a.title)+'</h2><p>'+esc(a.desc)+'</p><div class="activity-meta"><span>'+esc(a.date)+'</span><span>'+esc(a.people)+'</span></div><button class="'+(data.joined.includes(a.id)?"secondary":"primary")+'" type="button" data-join="'+a.id+'">'+(data.joined.includes(a.id)?"Đã quan tâm · bấm để hủy":a.button)+'</button></article>').join("");
    $("#shiftList").innerHTML=data.shifts.length?'<h3>Ca đã lưu trên thiết bị</h3>'+data.shifts.map(s=>'<div class="shift-entry"><span>'+esc(s.day)+' · '+esc(s.period)+'</span><button type="button" class="text-button" data-remove-shift="'+esc(s.id)+'">Xóa</button></div>').join(""):'<p class="form-note">Chưa có ca sẵn sàng được lưu.</p>';
  }
  function render() {renderHome();renderReports();renderSchedule();renderBulky();renderActivities();}
  function imageData(file) {
    if (!file || !file.size) return Promise.resolve("");
    if (!file.type.startsWith("image/")) return Promise.reject(new Error("Vui lòng chọn một tệp ảnh."));
    if (file.size>8*1024*1024) return Promise.reject(new Error("Ảnh cần nhỏ hơn 8 MB."));
    return new Promise((resolve,reject)=>{
      const img=new Image(), url=URL.createObjectURL(file);
      img.onload=()=>{try{const scale=Math.min(1,900/img.width,900/img.height), canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL("image/jpeg",.68));}catch(e){reject(e);}finally{URL.revokeObjectURL(url);}};
      img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error("Không đọc được ảnh."));};img.src=url;
    });
  }
  document.addEventListener("click",e=>{
    const view=e.target.closest("[data-view]"); if(view){show(view.dataset.view);return;}
    const report=e.target.closest('[data-action="report"]'); if(report){$("#reportDialog").showModal();return;}
    if(e.target.closest("[data-close]")){e.target.closest("dialog").close();return;}
    const remove=e.target.closest("[data-remove-shift]");if(remove){data.shifts=data.shifts.filter(s=>s.id!==remove.dataset.removeShift);save();render();return;}
    const join=e.target.closest("[data-join]");if(join){const id=join.dataset.join;if(data.joined.includes(id))data.joined=data.joined.filter(v=>v!==id);else data.joined.push(id);save();render();toast(data.joined.includes(id)?"Đã đánh dấu quan tâm trong bản demo; chưa có lịch tổ chức.":"Đã bỏ đánh dấu quan tâm.");}
  });
  $("#reportDialog").addEventListener("click",e=>{if(e.target===e.currentTarget)e.currentTarget.close();});
  $("#statusFilter").addEventListener("change",renderReports);
  $("#homeArea").addEventListener("change",renderHome);
  $("#scheduleArea").addEventListener("change",renderSchedule);
  $("#reminderOptIn").addEventListener("change",e=>{try{localStorage.setItem("lcx-reminder-demo",e.target.checked?"yes":"no");}catch{} toast(e.target.checked?"Đã lưu lựa chọn trên trình duyệt; chưa có thông báo tự động.":"Đã tắt lựa chọn nhắc giờ.");});
  $("#previewReminder").addEventListener("click",()=>{const area=schedule[$("#scheduleArea").value]||schedule.auco;$("#reminderMessage").textContent="Lời nhắc mẫu: "+area.name+" có lịch minh họa vào "+area.days.join(", ")+", "+area.time+". Hãy kiểm tra lịch chính thức và nơi tập kết trước khi mang rác ra.";});
  $("#reportForm").addEventListener("submit",async e=>{
    e.preventDefault();const form=e.currentTarget, button=form.querySelector('[type="submit"]');button.disabled=true;
    try{const fd=new FormData(form),photo=await imageData(fd.get("photo")),id="LCX-"+Date.now()+"-"+Math.floor(Math.random()*900+100),index=data.reports.length;data.reports.push({id,location:String(fd.get("location")).trim(),type:String(fd.get("type")),description:String(fd.get("description")).trim(),severity:String(fd.get("severity")),status:"waiting",created:new Date().toISOString(),photo,x:15+(index*23)%72,y:23+(index*19)%56});if(!save()){data.reports.pop();return;}form.reset();$("#reportDialog").close();show("reports");toast("Đã lưu điểm rác trên trình duyệt này.");}catch(err){toast(err.message||"Không thể đọc ảnh.");}finally{button.disabled=false;}
  });
  $("#bulkyForm").addEventListener("submit",async e=>{
    e.preventDefault();const form=e.currentTarget,button=form.querySelector('[type="submit"]');button.disabled=true;
    try{const fd=new FormData(form),photo=await imageData(fd.get("photo"));data.bulky.push({id:"BK-"+Date.now(),type:String(fd.get("type")),quantity:Number(fd.get("quantity")),address:String(fd.get("address")).trim(),time:String(fd.get("time")),contact:String(fd.get("contact")).trim(),photo});if(!save()){data.bulky.pop();return;}form.reset();render();toast("Đã ghi nhận yêu cầu trong bản demo; chưa gửi cho đơn vị thu gom.");}catch(err){toast(err.message||"Không thể đọc ảnh.");}finally{button.disabled=false;}
  });
  $("#shiftForm").addEventListener("submit",e=>{e.preventDefault();const fd=new FormData(e.currentTarget),day=String(fd.get("day")),period=String(fd.get("period")),today=new Date(),localDay=[today.getFullYear(),String(today.getMonth()+1).padStart(2,"0"),String(today.getDate()).padStart(2,"0")].join("-");if(day<localDay){toast("Hãy chọn ngày hiện tại hoặc ngày sắp tới.");return;}if(data.shifts.some(s=>s.day===day&&s.period===period)){toast("Ca này đã được lưu trên thiết bị.");return;}data.shifts.push({id:"SH-"+Date.now(),day,period});if(!save()){data.shifts.pop();return;}e.currentTarget.reset();render();toast("Đã lưu ca sẵn sàng trong bản demo.");});
  $("#violationForm").addEventListener("submit",e=>{e.preventDefault();const result=$("#violationResult");result.hidden=false;result.textContent="Đây chỉ là bước mô phỏng. Thông tin và tệp bạn chọn không được lưu hoặc gửi đi. Với sự việc thật, hãy dùng kênh Góp ý – Phản ánh Đà Nẵng; cơ quan có thẩm quyền sẽ xem xét. Mẫu đã được xóa trên thiết bị.";e.currentTarget.reset();});
  try{$("#reminderOptIn").checked=localStorage.getItem("lcx-reminder-demo")==="yes";}catch{}
  save(); // Make the illustrative starting cases visible on the coordination page in the same browser.
  const first=location.hash.slice(1);show($("#view-"+first)?first:"home");
})();
