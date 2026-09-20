import { loginUser } from "../../data/api";
import { go, setMessage } from "../../utils";
import "../../components/loading";

const LoginPage = {
  async render() {
    return `<div class="auth-page"><div class="auth-card"><p class="eyebrow">CERITA KITA</p><h1>Selamat datang kembali</h1><p class="muted">Masuk untuk membaca dan berbagi cerita.</p><div id="feedback" class="feedback" role="alert" tabindex="-1"></div><form id="login-form" novalidate><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" required><small class="field-error" data-error="email"></small><label for="password">Kata sandi</label><input id="password" name="password" type="password" autocomplete="current-password" minlength="8" required><small class="field-error" data-error="password"></small><button class="primary-button" type="submit">Masuk</button></form><p class="auth-switch">Belum punya akun? <a href="#/register">Daftar</a></p></div></div>`;
  },
  async afterRender() {
    const form = document.querySelector("#login-form");
    const validate = () => {
      form
        .querySelectorAll(".field-error")
        .forEach((e) => (e.textContent = ""));
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
      button.textContent = "Memproses…";
      feedback.className = "feedback";
      feedback.innerHTML = "<loading-indicator></loading-indicator>";
      try {
        const result = await loginUser(
          form.email.value.trim(),
          form.password.value,
        );
        localStorage.setItem("story_token", result.loginResult.token);
        localStorage.setItem("story_name", result.loginResult.name);
        go("/home");
      } catch (error) {
        setMessage(error.message, "error");
      } finally {
        button.disabled = false;
        button.textContent = "Masuk";
      }
    });
  },
};
export default LoginPage;
