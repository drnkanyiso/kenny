(() => {
  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector("#site-navigation");

  if (menuButton && navigation) {
    menuButton.hidden = false;
    navigation.dataset.collapsed = "true";

    const closeMenu = () => {
      menuButton.setAttribute("aria-expanded", "false");
      navigation.dataset.collapsed = "true";
    };

    menuButton.addEventListener("click", () => {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      navigation.dataset.collapsed = String(isOpen);
    });

    navigation.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest("a")) closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
        closeMenu();
        menuButton.focus();
      }
    });

    document.addEventListener("click", (event) => {
      if (event.target instanceof Node && !navigation.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
    });

    document.addEventListener("focusin", (event) => {
      if (event.target instanceof Node && !navigation.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
    });

    window.matchMedia("(max-width: 800px)").addEventListener("change", closeMenu);
  }

  document.querySelectorAll(".contact-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!(form instanceof HTMLFormElement) || !form.reportValidity()) return;

      const data = new FormData(form);
      const subject = String(data.get("subject") || "Website enquiry");
      const message = [
        `Name: ${data.get("name")}`,
        `Email: ${data.get("email") || "Not provided"}`,
        `Phone: ${data.get("phone") || "Not provided"}`,
        "",
        String(data.get("message") || ""),
      ].join("\n");
      const recipient = form.dataset.recipient;

      if (!recipient) {
        const status = form.querySelector(".form-status");
        if (status) status.textContent = "Contact details are currently unavailable. Please check back later.";
        return;
      }

      window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
      const status = form.querySelector(".form-status");
      if (status) status.textContent = form.dataset.success || "";
    });
  });
})();
