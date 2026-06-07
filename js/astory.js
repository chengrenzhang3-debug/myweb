const sectionButtons = Array.from(document.querySelectorAll("button[data-section]"));
const sections = Array.from(document.querySelectorAll("section[data-section]"));

function scrollToSection(sectionId) {
  const target = document.getElementById(sectionId);
  if (!target) return;

  target.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

sectionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    scrollToSection(button.dataset.section);
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    const activeId = visible.target.dataset.section;

    document.querySelectorAll(".archive-nav .nav-dot").forEach((button) => {
      button.classList.toggle("active", button.dataset.section === activeId);
    });
  },
  {
    threshold: [0.25, 0.45, 0.65]
  }
);

sections.forEach((section) => observer.observe(section));
