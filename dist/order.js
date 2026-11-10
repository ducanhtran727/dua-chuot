const form = document.querySelector('#order-form');
const status = document.querySelector('#status');
const submit = form.querySelector('button[type="submit"]');
const orderPopup = document.querySelector('#order-dialog');
const successPopup = document.querySelector('#success-dialog');

for (const id of ['w-jbwxzdpu', 'w-order-sticky', 'w-order-bottom']) {
  document.getElementById(id).addEventListener('click', () => {
    orderPopup.showModal();
    orderPopup.scrollTop = 0;
  });
}

for (const dialog of [orderPopup, successPopup]) {
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog &&
        (event.clientX < bounds.left || event.clientX > bounds.right ||
         event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
}

const gallery = document.querySelector('.com-gallery');
const slides = [...gallery.querySelectorAll('.gallery-view-item')];
const thumbnails = [...gallery.querySelectorAll('.gallery-controls-item')];
let currentSlide = 0;
function selectSlide(index) {
  currentSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, position) => slide.classList.toggle('active', position === currentSlide));
  thumbnails.forEach((item, position) => item.classList.toggle('active', position === currentSlide));
}
function galleryAction(element, label, callback) {
  element.tabIndex = 0;
  element.setAttribute('role', 'button');
  element.setAttribute('aria-label', label);
  element.addEventListener('click', callback);
  element.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  });
}
thumbnails.forEach((item, index) => galleryAction(item, 'Ảnh ' + (index + 1), () => selectSlide(index)));
for (const direction of ['next', 'prev']) {
  gallery.querySelectorAll('[class$="icon-' + direction + '"]').forEach((element) => {
    if (element.tagName !== 'DIV' || element.className === 'icon-' + direction) return;
    galleryAction(element, direction === 'next' ? 'Ảnh tiếp theo' : 'Ảnh trước', () => {
      selectSlide(currentSlide + (direction === 'next' ? 1 : -1));
    });
  });
}
let touchStart;
gallery.addEventListener('touchstart', (event) => { touchStart = event.changedTouches[0].clientX; }, { passive: true });
gallery.addEventListener('touchend', (event) => {
  const distance = event.changedTouches[0].clientX - touchStart;
  if (Math.abs(distance) > 40) selectSlide(currentSlide + (distance < 0 ? 1 : -1));
}, { passive: true });

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (typeof fbq === "function") fbq("track", "InitiateCheckout");
  if (submit.disabled) return;
  const endpoint = window.ORDER_SCRIPT_URL.trim();
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(endpoint)) {
    status.textContent = 'Cửa hàng chưa cấu hình nhận đơn.';
    return;
  }

  const fields = new FormData(form);
  const address = fields.get('address').trim();
  const body = new URLSearchParams({
    name: fields.get('name').trim(),
    phone: fields.get('phone'),
    quantity: fields.get('quantity'),
    address
  });
  if (!body.get('name') || !address) {
    status.textContent = 'Vui lòng nhập họ tên và địa chỉ.';
    return;
  }
  submit.disabled = true;
  status.textContent = 'Đang gửi thông tin…';
  try {
    const response = await fetch(endpoint, {
      method: 'POST', body, credentials: 'omit', signal: AbortSignal.timeout(20000)
    });
    const result = await response.json();
    if (!response.ok || result.ok !== true) throw new Error('Order not confirmed');
    form.reset();
    status.textContent = '';
    orderPopup.close();
    if (typeof fbq === "function") fbq("track", "Purchase", {
      value: 950000,
      currency: "VND",
    });
    successPopup.showModal();
  } catch {
    status.textContent = 'Chưa xác nhận được đơn. Vui lòng thử lại.';
  } finally {
    submit.disabled = false;
  }
});
