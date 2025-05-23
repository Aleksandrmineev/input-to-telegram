document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form');
  const successMessage = document.getElementById('formSuccess');

  // === Функция загрузки последних сообщений ===
  function loadLastMessages() {
    fetch('https://script.google.com/macros/s/AKfycbzsAAP6VT5wt86hDW8-YawzHebplWA7IKeMaVn8eXbKhRGFpWSBE1Pe15yQ_2kPPML-/exec')
      .then(res => res.json())
      .then(data => {
        const lastThree = data.reverse().slice(0, 3);
        const messagesEl = document.getElementById('messages');
        if (messagesEl) {
          messagesEl.innerHTML = lastThree.map(row => `
            <div class="message">
              <p><strong>${row[0]}</strong> — ${row[1]}</p>
              <p>${row[2]}</p>
              <p><em>${row[3]}</em></p>
            </div>
          `).join('');
        }
      });
  }

  // Загрузка сообщений при старте
  loadLastMessages();

  // === Обработка отправки формы ===
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = form.name.value.trim();
    const phone = form.phone.value.trim().replace(/\D/g, '');
    const email = form.email.value.trim();
    const messageText = form.message.value.trim();

    if (!name || phone.length < 10 || !email.includes('@') || !messageText) {
      alert('Please fill in all fields correctly');
      return;
    }

    const TOKEN = '8042188223:AAGiQLFwnSYK86FX0O3dMUbsj6dPK-1xwLc';
    const CHAT_ID = '303648524';
    const TELEGRAM_URL = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

    const message = `<b>New Client</b>
<b>Name:</b> ${name}
<b>Telefon:</b> ${phone}
<b>Email:</b> ${email}
<b>Nachricht:</b> ${messageText}`;

    // Отправка в Telegram
    fetch(TELEGRAM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    })
    .then(() => {
      // Отправка в Make.com Webhook
      const MAKE_WEBHOOK_URL = 'https://hook.eu2.make.com/1goqfnfbv28hf29qpkjxfdd00x9f639j';

      return fetch(MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          phone: phone,
          email: email,
          message: messageText
        })
      });
    })
    .then(() => {
      successMessage.style.display = 'block';
      form.reset();
      loadLastMessages(); // обновление сообщений на сайте
      setTimeout(() => {
        successMessage.style.display = 'none';
      }, 5000);
    })
    .catch(error => {
      console.error('Error occurred:', error);
      alert('An error occurred while sending.');
    });
  });
});
