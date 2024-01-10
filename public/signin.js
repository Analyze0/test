document.getElementById('signin').addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = document.getElementById('usernameInput').value;
  const password = document.getElementById('passwordInput').value;
  try {
    const response = await fetch('/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    if (!response.ok) {
      notif('Invalid username or password.');
      console.error('Sign in failed:', response.status);
    } else {
      const data = await response.json();
      localStorage.setItem('username', username);
      window.location.href = "index.html";
    }
  } catch (error) {
    console.error('Error signing in:', error);
    notif("An error occured while attempting to sign in.");
  }
});

function notif(msg) {
  document.getElementById("notif").innerHTML = msg;
  document.getElementById("notif").style.opacity = "100%";
  setTimeout(() => {
    document.getElementById("notif").style.opacity = "0%";
  }, 3000);
}

document.getElementById('back').onmousedown = function(e) {
  window.location.href = "index.html";
}