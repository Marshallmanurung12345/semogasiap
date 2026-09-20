import { registerUser } from "../../data/api";
import { go, setMessage } from "../../utils";
import "../../components/loading";

const RegisterPage = {
  async render() {
    return `<div class="auth-page"><div class="auth-card"><p class="eyebrow">CERITA KITA</p><h1>Buat akun baru</h1><p class="muted">Bagikan momen dan temukan cerita dari pengguna lain.</p><div id="feedback" class="feedback" role="alert" tabindex="-1"></div><form id="register-form" novalidate><label for="name">Nama</label><input id="name" name="name" type="text" autocomplete="name" minlength="3" required><small class="field-error" data-error="name"></small><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" required><small class="field-error" data-error="email"></small><label for="password">Kata sandi</label><input id="password" name="password" type="password" autocomplete="new-password" minlength="8" required><small class="field-error" data-error="password"></small><button class="primary-button" type="submit">Daftar</button></form><p class="auth-switch">Sudah punya akun? <a href="#/login">Masuk</a></p></div></div>`;
  },
  async afterRender() {
    const form = document.querySelector("#register-form");
    const validate = () => {
      form
        .querySelectorAll(".field-error")
        .forEach((e) => (e.textContent = ""));
      if (!form.name.validity.valid)
        form.querySelector("[data-error=name]").textContent =
          "Nama minimal 3 karakter.";
      if (!form.email.validity.valid)
        form.querySelector("[data-error=email]").textContent =
          "Masukkan email yang valid.";
      if (!form.password.validity.valid)
        form.querySelector("[data-error=password]").textContent =
          "Kata sandi minimal 8 karakter.";
      return form.checkValidity();
    };
    form.addEventListener("input", validate);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!validate()) return;
      const button = form.querySelector("button");
      const feedback = document.querySelector("#feedback");
      button.disabled = true;
      button.textContent = "Mendaftarkan…";
      feedback.className = "feedback";
      feedback.innerHTML = "<loading-indicator></loading-indicator>";
      try {
        await registerUser(
          form.name.value.trim(),
          form.email.value.trim(),
          form.password.value,
        );
        setMessage("Akun berhasil dibuat. Silakan masuk.", "success");
        setTimeout(() => go("/login"), 700);
      } catch (error) {
        setMessage(error.message, "error");
      } finally {
        button.disabled = false;
        button.textContent = "Daftar";
      }
    });
  },
};
export default RegisterPage;
