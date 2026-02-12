setInterval(() => {
  let time = document.getElementById("time");

  time.textContent = new Date().toDateString();
}, 1000);
