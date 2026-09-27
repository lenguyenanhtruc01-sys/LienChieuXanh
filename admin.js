(() => {
  const KEY="lien-chieu-xanh-demo-v1";
  const $=selector=>document.querySelector(selector);
  const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const names={waiting:"Chờ tiếp nhận",working:"Đang xử lý",review:"Chờ duyệt kết quả",done:"Đã xử lý"};
  const routes={volunteer:"Tình nguyện viên theo ca",collector:"Đơn vị thu gom / chuyên môn",authority:"Cơ quan có thẩm quyền"};
  let data={reports:[],bulky:[],joined:[],shifts:[]};
  let timer;
  function toast(message){const el=$("#toast");el.textContent=message;el.classList.add("show");clearTimeout(timer);timer=setTimeout(()=>el.classList.remove("show"),4200);}
  function load(){try{const saved=JSON.parse(localStorage.getItem(KEY));if(saved&&Array.isArray(saved.reports)&&Array.isArray(saved.bulky)){data=saved;data.shifts=Array.isArray(saved.shifts)?saved.shifts:[];}}catch{}data.reports.forEach(r=>{if(r.status==="done"&&!r.verified)r.status="working";});}
  function persist(){try{localStorage.setItem(KEY,JSON.stringify(data));return true;}catch{toast("Không đủ dung lượng lưu dữ liệu demo. Hãy dùng ảnh nhỏ hơn.");return false;}}
  function badge(status){return '<span class="badge '+esc(status)+'">'+esc(names[status]||names.waiting)+'</span>';}
  function render(){
    const counts={waiting:0,working:0,review:0,done:0};data.reports.forEach(r=>{if(Object.hasOwn(counts,r.status))counts[r.status]++;});
    $("#adminStats").innerHTML=[["Chờ tiếp nhận",counts.waiting],["Đang xử lý",counts.working],["Chờ duyệt",counts.review],["Đã duyệt kết quả",counts.done]].map(([name,num])=>'<div class="stat"><div class="stat-top">'+name+'</div><strong>'+num+'</strong><small>Số liệu demo</small></div>').join("");
    const ordered=[...data.reports].sort((a,b)=>({review:0,waiting:1,working:2,done:3}[a.status]??4)-({review:0,waiting:1,working:2,done:3}[b.status]??4));
    $("#adminReports").innerHTML=ordered.length?ordered.map(r=>'<article class="report-card"><div class="report-card-header"><div><h3>'+esc(r.location)+'</h3><span class="meta">'+esc(r.id)+'</span></div>'+badge(r.status)+'</div><p><b>'+esc(r.type)+'</b> · '+esc(r.description)+'</p><p><b>Phân luồng:</b> '+esc(r.assignee||"Chưa phân công")+'</p>'+(r.photo?'<img class="report-photo" src="'+esc(r.photo)+'" alt="Ảnh hiện trường trong bản demo">':'')+(r.status==="review"?'<div class="review-box"><p><b>Kết quả đề xuất:</b> '+esc(r.confirmation||"Có ảnh sau xử lý")+'</p>'+(r.afterPhoto?'<img class="report-photo" src="'+esc(r.afterPhoto)+'" alt="Ảnh kết quả đang chờ duyệt">':'')+'<div class="review-actions"><button type="button" class="primary" data-approve="'+esc(r.id)+'">Duyệt và công bố</button><button type="button" class="secondary" data-reject="'+esc(r.id)+'">Trả lại để bổ sung</button></div></div>':'')+'</article>').join(""):'<p class="empty">Chưa có ghi nhận. Hãy mở trang người dân để thử gửi một điểm rác.</p>';
    const options='<option value="">Chọn mã ghi nhận</option>';
    const triageValue=$("#triageId").value,resultValue=$("#resultId").value;
    $("#triageId").innerHTML=options+data.reports.filter(r=>r.status!=="done").map(r=>'<option value="'+esc(r.id)+'">'+esc(r.id)+' · '+esc(r.location)+'</option>').join("");
    $("#resultId").innerHTML=options+data.reports.filter(r=>r.status==="working").map(r=>'<option value="'+esc(r.id)+'">'+esc(r.id)+' · '+esc(r.location)+'</option>').join("");
    if(data.reports.some(r=>r.id===triageValue&&r.status!=="done"))$("#triageId").value=triageValue;
    if(data.reports.some(r=>r.id===resultValue&&r.status==="working"))$("#resultId").value=resultValue;
    $("#adminBulky").innerHTML=data.bulky.length?data.bulky.map(b=>'<div class="mini-card"><b>'+esc(b.type)+'</b><p>'+esc(b.address)+'</p><small>Thời gian mong muốn: '+esc(b.time)+'</small></div>').join(""):'<p class="empty">Chưa có yêu cầu trong bản demo.</p>';
    $("#adminShifts").innerHTML=data.shifts.length?data.shifts.map(s=>'<div class="mini-card"><b>'+esc(s.day)+'</b><p>'+esc(s.period)+' · chưa liên hệ tình nguyện viên</p></div>').join(""):'<p class="empty">Chưa có ca sẵn sàng.</p>';
  }
  function imageData(file){
    if(!file||!file.size)return Promise.resolve("");
    if(!file.type.startsWith("image/"))return Promise.reject(new Error("Hãy chọn ảnh hợp lệ."));
    if(file.size>8*1024*1024)return Promise.reject(new Error("Ảnh phải nhỏ hơn 8 MB."));
    return new Promise((resolve,reject)=>{const img=new Image(),url=URL.createObjectURL(file);img.onload=()=>{try{const ratio=Math.min(1,900/img.width,900/img.height),canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(img.width*ratio));canvas.height=Math.max(1,Math.round(img.height*ratio));canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL("image/jpeg",.68));}catch(e){reject(e);}finally{URL.revokeObjectURL(url);}};img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error("Không đọc được ảnh."));};img.src=url;});
  }
  $("#triageForm").addEventListener("submit",e=>{
    e.preventDefault();const fd=new FormData(e.currentTarget),r=data.reports.find(v=>v.id===fd.get("id")),route=String(fd.get("to"));if(!r||!routes[route])return;
    if(route==="volunteer"&&(!$("#triageSafe").checked||r.severity==="high"||/cống|mương|nguy hại|vi phạm/i.test(r.type))){toast("Chỉ giao tình nguyện viên việc được đánh giá an toàn, không liên quan cống rãnh hoặc rác nguy hại.");return;}
    const old={status:r.status,assignee:r.assignee};r.status="working";r.assignee=routes[route];if(!persist()){Object.assign(r,old);return;}e.currentTarget.reset();render();toast("Đã phân luồng ghi nhận trong bản demo.");
  });
  $("#resultForm").addEventListener("submit",async e=>{
    e.preventDefault();const form=e.currentTarget,button=form.querySelector('[type="submit"]'),fd=new FormData(form),r=data.reports.find(v=>v.id===fd.get("id"));if(!r||r.status!=="working")return;button.disabled=true;
    try{const photo=await imageData(fd.get("photo")),confirmation=String(fd.get("confirmation")||"").trim();if(!photo&&!confirmation){toast("Thêm ảnh kết quả hoặc xác nhận trước khi gửi duyệt.");return;}const old={status:r.status,afterPhoto:r.afterPhoto,confirmation:r.confirmation,verified:r.verified};Object.assign(r,{status:"review",afterPhoto:photo,confirmation,verified:false});if(!persist()){Object.assign(r,old);return;}form.reset();render();toast("Đã gửi kết quả chờ người trực kiểm tra.");}catch(err){toast(err.message||"Không thể đọc ảnh.");}finally{button.disabled=false;}
  });
  document.addEventListener("click",e=>{
    const approve=e.target.closest("[data-approve]"),reject=e.target.closest("[data-reject]");if(!approve&&!reject)return;
    const r=data.reports.find(v=>v.id===(approve||reject).dataset[approve?"approve":"reject"]);if(!r||r.status!=="review")return;
    const old={status:r.status,verified:r.verified,afterPhoto:r.afterPhoto,confirmation:r.confirmation,reviewedAt:r.reviewedAt};
    if(approve){if(!r.afterPhoto&&!r.confirmation){toast("Chưa có bằng chứng hoặc xác nhận kết quả.");return;}r.status="done";r.verified=true;r.reviewedAt=new Date().toISOString();}
    else{r.status="working";r.verified=false;r.afterPhoto="";r.confirmation="";r.reviewedAt="";}
    if(!persist()){Object.assign(r,old);return;}render();toast(approve?"Đã duyệt kết quả trên bản demo.":"Đã trả lại để bổ sung kết quả.");
  });
  window.addEventListener("storage",e=>{if(e.key===KEY){load();render();}});
  load();render();
})();
