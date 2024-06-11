document.addEventListener('DOMContentLoaded', () => {
  const inputs = document.querySelectorAll(".input-field");
  const toggleBtn = document.querySelectorAll(".toggle");
  const main = document.querySelector("main");
  const bullets = document.querySelectorAll(".bullets span");
  const images = document.querySelectorAll(".image");

  inputs.forEach((inp) => {
    inp.addEventListener("focus", () => {
      inp.classList.add("active");
    });
    inp.addEventListener("blur", () => {
      if (inp.value != "") return;
      inp.classList.remove("active");
    });
  });

  toggleBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
      main.classList.toggle("sign-up-mode");
    });
  });

  function moveSlider() {
    let index = this.dataset.value;

    let currentImage = document.querySelector(`.img-${index}`);
    images.forEach((img) => img.classList.remove("show"));
    currentImage.classList.add("show");

    const textSlider = document.querySelector(".text-group");
    textSlider.style.transform = `translateY(${-(index - 1) * 2.2}rem)`;

    bullets.forEach((bull) => bull.classList.remove("active"));
    this.classList.add("active");
  }

  bullets.forEach((bullet) => {
    bullet.addEventListener("click", moveSlider);
  });

  const form = document.getElementById('musteriForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const ad = document.getElementById('ad').value;
      const soyad = document.getElementById('soyad').value;
      const cinsiyet = document.getElementById('cinsiyet').value;
      const email = document.getElementById('email').value;
      const telefon = document.getElementById('telefon').value;
      const sifre = document.getElementById('sifre').value;

      fetch('http://127.0.0.1:3001/musteri', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ad, soyad, cinsiyet, email, telefon, sifre }),
      })
        .then(async (response) => {
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || 'Kayıt sırasında bir hata oluştu');
          }
          return data;
        })
        .then((data) => {
          console.log(data);
          const message = document.getElementById('message').querySelector('span');
          message.innerText = 'Kayıt başarıyla tamamlandı';
          setTimeout(() => {
            window.location.href = '/login/index.html';
          }, 2000); // 2 saniye bekletme süresi
        })
        .catch((error) => {
          console.error('Error:', error);
          const message = document.getElementById('message').querySelector('span');
          if (error.message === 'Email address already exists.') {
            message.innerText = 'Bu mail zaten kullanılıyor';
          } else {
            message.innerText = 'Kayıt sırasında bir hata oluştu: ' + error.message;
          }
        });
    });
  }

  const loginForm = document.querySelector('.sign-in-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const email = loginForm.querySelector('input[type="email"]').value;
      const sifre = loginForm.querySelector('input[type="password"]').value;

      fetch('http://127.0.0.1:3001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, sifre })
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
          }
          return response.text();
        })
        .then(() => {
          window.location.href = '/public/index.html';
        })
        .catch(error => {
          console.error('Giriş işlemi başarısız:', error);
          alert('Giriş işlemi başarısız: ' + error.message);
        });
    });
  }
});
