document.addEventListener("DOMContentLoaded", async (e) => {
  const closeBtn = document.querySelector(".close-btn");
  const appVersionContainer = document.querySelector(".version");
  closeBtn.addEventListener("click", (e) => {
    window.close();
  });

  const linkUrl = document.querySelector(".site-link");
  linkUrl.addEventListener("click", async (e) => {
    e.preventDefault();
    await api.openUrl();
  });

  const copyRight = document.querySelector(".copyright");
  copyRight.innerHTML = `${
    new Date().getFullYear() - 1
  } - ${new Date().getFullYear()}`;

  const appVersion = await api.getAppVersion();
  appVersionContainer.textContent = appVersion;
});
