var loggedIn = false;
var username = localStorage.getItem("username");

if(username != null) {
  loggedIn = true;
  document.getElementById('signup').style.display = "none";
  document.getElementById('signin').innerHTML = "<p><i>Continue</i></p>";
  document.getElementById('username').style.display = "block";
  document.getElementById('username').innerHTML = username;
}
else {
  document.getElementById('signout').style.display = "none";
}

document.getElementById('signup').onmousedown = function (e) {
  window.location.href = "signup.html";
}

document.getElementById('signin').onmousedown = function (e) {
  if (loggedIn == false) {
    window.location.href = "signin.html";
  }
  else {
    window.location.href = "pages/main/index.html";
  }
}

document.getElementById('signout').onmousedown = function (e) {
  localStorage.removeItem('username');
  window.location.reload();
}

// Fetch the pfpImage upon login
if(loggedIn) {
  fetch('/accounts')
    .then(response => response.json())
    .then(accounts => {
      const userAccount = accounts.find(account => account.username === username);
      const pfpImage = userAccount.pfpImage;
      if(pfpImage != undefined) {
        document.getElementById('pfp').style.background = `url(${pfpImage})`;
      }
      document.getElementById('pfp').style.backgroundPosition = `center center`;
    })
    .catch(error => console.error('Error fetching pfpImage:', error));
}