// Footer year.
document.getElementById('year').textContent = new Date().getFullYear();

// If the photo hasn't been added yet, fall back to the initials behind it.
// The inline onerror in the markup does the real work, because the error
// fires while parsing, before this file runs. This just catches the case
// where the image failed but the attribute didn't run.
document.querySelectorAll('.avatar img').forEach(function (img) {
  if (img.complete && img.naturalWidth === 0) img.remove();
});

// Fade sections in once, unless the visitor prefers reduced motion.
var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!calm && 'IntersectionObserver' in window) {
  var targets = document.querySelectorAll('.section, .intro');
  targets.forEach(function (el) { el.classList.add('reveal'); });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('shown');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -60px 0px' });

  targets.forEach(function (el) { io.observe(el); });
}
