/* =========================================================
   BEAUTY CONNECT – Landing page logic
   ========================================================= */

const CONFIG = {
  // URL Web App của Google Apps Script (điền sau khi triển khai backend).
  // Để trống = chế độ DEMO: không gửi dữ liệu, chỉ hiện bản xem trước bài đăng.
  SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzh1WST3aAjbug_oVpbibWIe0TnVBfmiubZ-JSwq4ntPbxMtJKlC9HhAEoYnNFAyY8A9Q/exec',
  GROUP_URL: 'https://www.facebook.com/groups/30shinevieclam',
  ZALO_URL: '#',
  MAX_IMAGES: 3,
  IMAGE_MAX_SIDE: 1600,
};

// Tên nghề dùng thống nhất ở mọi nơi: form, thẻ đầu trang, tiêu đề bài đăng, hashtag.
const PROFESSIONS = {
  'Barber / Stylist tóc nam': { skills: ['Fade', 'Undercut', 'Side part', 'Mohican', 'Uốn nam', 'Nhuộm nam', 'Cạo mặt', 'Tạo kiểu'] },
  'Stylist / Thợ tóc nữ': { skills: ['Cắt nữ', 'Layer', 'Bob', 'Uốn', 'Nhuộm', 'Duỗi', 'Phục hồi', 'Tạo kiểu'] },
  'Skinner / Thợ gội massage CVG': { skills: ['Gội dưỡng sinh', 'Massage cổ vai gáy', 'Lấy ráy tai', 'Chăm sóc da đầu', 'Rửa mặt – đắp mặt nạ'] },
  'Kỹ thuật viên Spa / Chăm sóc da': { skills: ['Chăm sóc da mặt', 'Trị mụn', 'Massage body', 'Peel da', 'Máy công nghệ cao', 'Triệt lông'] },
  'Nail': { skills: ['Sơn gel', 'Đắp bột', 'Úp móng', 'Vẽ nail art', 'Chăm sóc móng', 'Nail Mỹ'] },
  'Nối mi': { skills: ['Mi classic', 'Mi volume', 'Mi Hàn', 'Uốn mi', 'Mi Katun'] },
  'Phun xăm thẩm mỹ': { skills: ['Phun mày', 'Điêu khắc chân mày', 'Phun môi', 'Phun mí', 'Xóa xăm'] },
  'Makeup': { skills: ['Makeup cô dâu', 'Makeup sự kiện', 'Makeup cá nhân', 'Làm tóc cô dâu', 'Makeup chụp ảnh'] },
  'Quản lý Salon / Spa': { skills: ['Quản lý vận hành', 'Quản lý nhân sự', 'Doanh số', 'Chăm sóc khách hàng', 'Đào tạo'] },
  'Trainer / Đào tạo': { skills: ['Đào tạo kỹ thuật', 'Xây giáo trình', 'Kèm thợ mới', 'Đánh giá tay nghề'] },
  'Lễ tân / CSKH': { skills: ['Đón tiếp khách', 'Đặt lịch', 'Thu ngân', 'Tư vấn dịch vụ', 'Telesale'] },
  'Khác': { skills: [] },
};

// 34 tỉnh/thành sau sáp nhập (từ 01/07/2025). Thành phố lớn lên đầu.
const PROVINCES = [
  'TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Huế',
  'An Giang', 'Bắc Ninh', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Điện Biên', 'Đồng Nai', 'Đồng Tháp',
  'Gia Lai', 'Hà Tĩnh', 'Hưng Yên', 'Khánh Hòa', 'Lai Châu', 'Lạng Sơn', 'Lào Cai', 'Lâm Đồng',
  'Nghệ An', 'Ninh Bình', 'Phú Thọ', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sơn La',
  'Tây Ninh', 'Thái Nguyên', 'Thanh Hóa', 'Tuyên Quang', 'Vĩnh Long',
];

const STATUS_ICON = { 'Đang tìm việc': '🟢', 'Sẵn sàng nghe offer': '🟡', 'Chỉ nhận offer tốt': '🔴' };

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ---------- Helpers ---------- */
function stripAccents(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
}
function toHashtag(s) {
  if (s === 'TP. Hồ Chí Minh') return '#HCM';
  return '#' + stripAccents(s).replace(/[^a-zA-Z0-9 ]/g, '').split(' ').filter(Boolean)
    .map(w => w[0].toUpperCase() + w.slice(1)).join('');
}
function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
function normalizePhone(v) { return v.replace(/[\s.\-]/g, '').replace(/^\+84/, '0'); }
function isValidPhone(v) { return /^0\d{9}$/.test(normalizePhone(v)); }

/* ---------- Populate selects ---------- */
$$('[data-professions]').forEach(sel => {
  sel.innerHTML = '<option value="">Chọn nghề…</option>' +
    Object.keys(PROFESSIONS).map(p => `<option>${p}</option>`).join('');
});
$$('[data-provinces]').forEach(sel => {
  sel.innerHTML = '<option value="">Chọn tỉnh/thành…</option>' +
    PROVINCES.map(p => `<option>${p}</option>`).join('');
});

$$('[data-profession-tags]').forEach(ul => {
  ul.innerHTML = Object.keys(PROFESSIONS).filter(p => p !== 'Khác').map(p => `<li>${p}</li>`).join('');
});

/* ---------- Links & year ---------- */
$$('[data-link="group"]').forEach(a => (a.href = CONFIG.GROUP_URL));
$$('[data-link="zalo"]').forEach(a => (a.href = CONFIG.ZALO_URL));
$$('[data-year]').forEach(el => (el.textContent = new Date().getFullYear()));

/* ---------- Tabs ---------- */
function activate(groupAttr, panelAttr, key) {
  $$(`[${groupAttr}]`).forEach(b => b.classList.toggle('is-active', b.getAttribute(groupAttr) === key));
  $$(`[${panelAttr}]`).forEach(p => (p.hidden = p.getAttribute(panelAttr) !== key));
}
$$('[data-how]').forEach(b => b.addEventListener('click', () => activate('data-how', 'data-how-panel', b.dataset.how)));
$$('[data-form]').forEach(b => b.addEventListener('click', () => activate('data-form', 'data-form-panel', b.dataset.form)));
$$('[data-open]').forEach(a => a.addEventListener('click', () => activate('data-form', 'data-form-panel', a.dataset.open)));

/* ---------- Skill chips ---------- */
const talentForm = $('#form-talent');
const skillInput = talentForm.elements.ky_nang;
const chipBox = $('[data-skill-chips]', talentForm);

function currentSkills() {
  return skillInput.value.split(',').map(s => s.trim()).filter(Boolean);
}
function renderChips() {
  const skills = PROFESSIONS[talentForm.elements.nghe.value]?.skills || [];
  if (!skills.length) { chipBox.innerHTML = '<small class="muted">Chọn nghề để xem gợi ý kỹ năng</small>'; return; }
  const on = currentSkills();
  chipBox.innerHTML = skills.map(s =>
    `<button type="button" class="chip${on.includes(s) ? ' is-on' : ''}" data-skill="${s}">${s}</button>`).join('');
}
talentForm.elements.nghe.addEventListener('change', renderChips);
skillInput.addEventListener('input', renderChips);
chipBox.addEventListener('click', e => {
  const s = e.target.dataset.skill;
  if (!s) return;
  let list = currentSkills();
  if (list.includes(s)) list = list.filter(x => x !== s);
  else if (list.length < 3) list.push(s);
  skillInput.value = list.join(', ');
  renderChips();
});

/* ---------- Image upload (resize client-side) ---------- */
function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, CONFIG.IMAGE_MAX_SIDE / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(img.src);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

const imageStore = new WeakMap(); // form -> [dataURL]
$$('[data-upload]').forEach(input => {
  const form = input.closest('form');
  const thumbs = $('[data-thumbs]', form);
  imageStore.set(form, []);

  const render = () => {
    thumbs.innerHTML = imageStore.get(form).map((src, i) =>
      `<div class="thumb"><img src="${src}" alt=""><button type="button" data-rm="${i}" aria-label="Xóa ảnh">×</button></div>`).join('');
  };
  thumbs.addEventListener('click', e => {
    if (e.target.dataset.rm === undefined) return;
    imageStore.get(form).splice(+e.target.dataset.rm, 1);
    render();
  });
  input.addEventListener('change', async () => {
    const list = imageStore.get(form);
    for (const f of [...input.files]) {
      if (list.length >= CONFIG.MAX_IMAGES) break;
      if (!f.type.startsWith('image/')) continue;
      try { list.push(await resizeImage(f)); } catch { /* bỏ qua ảnh lỗi */ }
    }
    input.value = '';
    render();
  });
});

/* ---------- Validation ---------- */
function validate(form) {
  const errors = [];
  $$('.is-invalid', form).forEach(el => el.classList.remove('is-invalid'));

  $$('[required]', form).forEach(el => {
    let bad = false;
    if (el.type === 'checkbox') bad = !el.checked;
    else if (el.type === 'radio') bad = !form.querySelector(`[name="${el.name}"]:checked`);
    else bad = !el.value.trim();
    if (bad) {
      (el.type === 'checkbox' ? el.closest('.consent') : el.type === 'radio' ? el.closest('.radio-pills, .radio-cards') : el)
        .classList.add('is-invalid');
      errors.push('missing');
    }
  });

  const phone = form.elements.sdt;
  if (phone.value && !isValidPhone(phone.value)) { phone.classList.add('is-invalid'); errors.push('Số điện thoại chưa đúng (cần 10 số).'); }

  if (form.id === 'form-talent' && currentSkills().length > 3) {
    skillInput.classList.add('is-invalid'); errors.push('Chỉ chọn tối đa 3 kỹ năng.');
  }
  if (form.id === 'form-employer') {
    const tu = +form.elements.luong_tu.value, den = +form.elements.luong_den.value;
    if (tu && den && den < tu) { form.elements.luong_den.classList.add('is-invalid'); errors.push('Thu nhập “đến” phải lớn hơn hoặc bằng “từ”.'); }
    if (!$$('[name="co_cau"]:checked', form).length) { $('[data-group="co_cau"]', form).classList.add('is-invalid'); errors.push('missing'); }
    if (!(imageStore.get(form) || []).length) { $('.upload__box', form).classList.add('is-invalid'); errors.push('Vui lòng tải lên ít nhất 1 ảnh nơi làm việc.'); }
    const url = form.elements.link_xac_minh;
    if (url.value && !/^https?:\/\//i.test(url.value.trim())) { url.classList.add('is-invalid'); errors.push('Link fanpage/Google Maps cần bắt đầu bằng https://'); }
  }

  const msgs = [...new Set(errors.filter(e => e !== 'missing'))];
  if (errors.includes('missing')) msgs.unshift('Vui lòng điền đầy đủ các mục có dấu *.');
  return msgs;
}

/* ---------- Build payload & post preview ---------- */
function collect(form) {
  const data = {};
  for (const el of form.elements) {
    if (!el.name || el.type === 'file') continue;
    if (el.type === 'checkbox' && el.name !== 'dong_y' && el.name !== 'cam_ket') {
      if (el.checked) (data[el.name] ||= []).push(el.value);
    } else if (el.type === 'checkbox') data[el.name] = el.checked;
    else if (el.type === 'radio') { if (el.checked) data[el.name] = el.value; }
    else data[el.name] = el.value.trim();
  }
  data.sdt = normalizePhone(data.sdt || '');
  data.loai = form.id === 'form-talent' ? 'TALENT' : 'JOB';
  data.anh = imageStore.get(form) || [];
  return data;
}

function talentPost(d, code) {
  const prof = d.nghe.toUpperCase();
  return [
    `${STATUS_ICON[d.trang_thai] || '🟢'} BEAUTY TALENT ${code} – ${prof}`,
    '',
    `📍 ${d.khu_vuc ? d.khu_vuc + ', ' : ''}${d.tinh}`,
    `⏳ Kinh nghiệm: ${d.kinh_nghiem}`,
    `✂️ Mạnh: ${d.ky_nang.split(",").map(s => s.trim()).filter(Boolean).join(' · ')}`,
    `💰 Mong muốn: ${d.thu_nhap} triệu/tháng`,
    d.ngay_nhan_viec ? `📅 Có thể nhận việc: ${formatDate(d.ngay_nhan_viec)}` : null,
    `📌 Trạng thái: ${d.trang_thai}`,
    d.link_tay_nghe ? `🎬 Tay nghề: ${d.link_tay_nghe}` : null,
    '',
    `👉 Nhà tuyển dụng quan tâm: inbox Admin kèm mã ${code}`,
    '',
    `#BeautyTalent ${toHashtag(d.nghe)} ${toHashtag(d.tinh)}`,
  ].filter(l => l !== null).join('\n');
}

function jobPost(d, code) {
  const qty = String(d.so_luong).padStart(2, '0');
  return [
    `💼 TUYỂN DỤNG ${code} – ${d.vi_tri.toUpperCase()} (${qty} người)`,
    '',
    `🏠 ${d.ten_co_so} – ✅ Đã xác minh`,
    `📍 ${d.dia_chi}, ${d.tinh}`,
    `💰 Thu nhập: ${d.luong_tu}–${d.luong_den} triệu/tháng (${(d.co_cau || []).join(' + ')})`,
    `🕘 ${d.thoi_gian}`,
    `📋 Yêu cầu: ${d.yeu_cau}`,
    d.quyen_loi?.length ? `🎁 Quyền lợi: ${d.quyen_loi.join(' · ')}` : null,
    '',
    `👉 Ứng tuyển: inbox Admin kèm mã ${code}`,
    '',
    `#ViecLam ${toHashtag(d.vi_tri)} ${toHashtag(d.tinh)}`,
  ].filter(l => l !== null).join('\n');
}

/* ---------- Modal ---------- */
const modal = $('[data-modal]');
function openModal(msg, preview) {
  $('[data-modal-msg]', modal).textContent = msg;
  $('[data-preview]', modal).textContent = preview;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeModal() { modal.hidden = true; document.body.style.overflow = ''; }
$$('[data-close]', modal).forEach(b => b.addEventListener('click', closeModal));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

/* ---------- Submit ---------- */
$$('form.form').forEach(form => {
  const errorBox = $('[data-error]', form);
  const btn = $('button[type=submit]', form);
  const label = btn.textContent;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const msgs = validate(form);
    if (msgs.length) {
      errorBox.textContent = msgs.join(' ');
      errorBox.hidden = false;
      $('.is-invalid', form)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    errorBox.hidden = true;

    const data = collect(form);
    btn.disabled = true;
    btn.textContent = 'Đang gửi…';

    let code = data.loai === 'TALENT' ? '#T____' : '#J____';
    try {
      if (CONFIG.SCRIPT_URL) {
        // text/plain để tránh CORS preflight với Google Apps Script
        const res = await fetch(CONFIG.SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(data),
        });
        const out = await res.json();
        if (!out.ok) throw new Error(out.error || 'Gửi không thành công');
        if (out.code) code = out.code;
        if (out.post) data.serverPost = out.post;
      } else {
        await new Promise(r => setTimeout(r, 600)); // DEMO
        code += ' (demo)';
      }

      const preview = data.serverPost || (data.loai === 'TALENT' ? talentPost(data, code) : jobPost(data, code));
      const msg = data.loai === 'TALENT'
        ? 'Hồ sơ của bạn đang chờ admin duyệt và sẽ được đăng trong vòng 24 giờ.'
        : 'Tin tuyển dụng đang chờ xác minh và sẽ được đăng trong vòng 24 giờ.';
      openModal(msg, preview);

      form.reset();
      imageStore.set(form, []);
      $('[data-thumbs]', form).innerHTML = '';
      if (form === talentForm) renderChips();
    } catch (err) {
      errorBox.textContent = 'Có lỗi khi gửi, vui lòng thử lại hoặc nhắn admin. (' + err.message + ')';
      errorBox.hidden = false;
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  });
});
