function toggle(head) {
  const ep = head.closest('.endpoint');
  ep.classList.toggle('open');
}

function copyCode(btn, text) {
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = 'copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = 'copy url';
      btn.classList.remove('copied');
    }, 1800);
  });
}

// Sidebar active link tracking
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('[id]');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`.nav-link[href="#${e.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => observer.observe(s));

// Smooth anchor scroll
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const id = link.getAttribute('href').slice(1);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});