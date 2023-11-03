function toggleClassById(id, className) {
    var element = document.getElementById(id);
    if (element) {
      if (element.classList.contains(className)) {
        element.classList.remove(className); // Si ya tiene la clase, quítala
      } else {
        element.classList.add(className); // Si no tiene la clase, agrégala
      }
    }
  }

window.onload = function() {
    var elementoToggle = document.querySelector('.icono-toggle');
    elementoToggle.addEventListener('click', function () {
        toggleClassById('nav-menu', 'visible');
    });
    document.getElementById('btnSend').addEventListener('click', () => {
      var input = document.getElementById('prompt');
      alert(input.value);      
    })
}
