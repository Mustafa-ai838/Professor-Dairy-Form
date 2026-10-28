// ==============================================================
// ڈیری فارم مینجمنٹ سسٹم - کلائنٹ سائڈ جاوا اسکرپٹ (JavaScript)
// ==============================================================

document.addEventListener('DOMContentLoaded', function () {
  console.log("ڈیری فارم سسٹم جاوا اسکرپٹ تیار ہے (Dairy Farm JS Ready)");

  // خودکار نوٹیفکیشن بند کرنا (Auto dismiss alerts after 5 seconds)
  const alerts = document.querySelectorAll('.alert-dismissible');
  alerts.forEach(function (alert) {
    setTimeout(function () {
      alert.style.transition = 'opacity 0.5s ease';
      alert.style.opacity = '0';
      setTimeout(function () {
        alert.remove();
      }, 500);
    }, 6000);
  });
});

// فوری قیمت و مقدار کا ضرب خودکار کرنے کا فنکشن
function calculateTotal(qtyId, rateId, totalId) {
  const qty = parseFloat(document.getElementById(qtyId)?.value || 0);
  const rate = parseFloat(document.getElementById(rateId)?.value || 0);
  const totalElem = document.getElementById(totalId);
  if (totalElem) {
    totalElem.value = (qty * rate).toFixed(0);
  }
}

// متوقع تاریخ ولادت کا خودکار حساب (گائے 280 دن، بھینس 310 دن)
function autoCalculateCalving(tikaDateId, animalType, resultDateId) {
  const dateInput = document.getElementById(tikaDateId)?.value;
  if (!dateInput) return;

  const dt = new Date(dateInput);
  const daysToAdd = animalType.includes('بھینس') || animalType.includes('Buffalo') ? 310 : 280;
  dt.setDate(dt.getDate() + daysToAdd);

  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');

  const resultElem = document.getElementById(resultDateId);
  if (resultElem) {
    resultElem.value = `${yyyy}-${mm}-${dd}`;
  }
}
