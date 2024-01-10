var profanity = ['bitch', 'Bitch', 'B1tch', 'b1tch', 'B!tch', 'b!tch', 'BITCH', 'B1TCH', 'B!TCH', 'cunt', 'Cunt', 'C1unt', 'c1unt', 'C!unt', 'c!unt', 'slut', 'Slut', 'S1lut', 's1lut', 'S!lut', 's!lut', 'whore', 'Whore', 'W1hore', 'w1hore', 'W!hore', 'fanny', 'Fanny', 'F1nny', 'f1nny', 'F!nny', 'fuck', 'Fuck', 'F1ck', 'f1ck', 'F!ck', 'f!ck', 'fvck', 'Fvck', 'F1vck', 'f1vck', 'F!vck', 'shit', 'Shit', 'S1hit', 's1hit', 'S!hit', 's!hit', 'dick', 'Dick', 'D1ck', 'd1ck', 'D!ck', 'd!ck', 'd1ck', 'D!ck', 'dickhead', 'Dickhead', 'D1ckhead', 'd1ckhead', 'D!ckhead', 'd!ckhead', 'd1ckhead', 'faggot', 'Faggot', 'F1aggot', 'f1aggot', 'F!aggot', 'fag', 'bullshit', 'Bullshit', 'B1ullshit', 'b1ullshit', 'B!ull', 'cum', 'Cum', 'C1um', 'c1um', 'C!um', 'c!um', 'cvm','penis','Penis','P1nis','p1nis','P!nis','p!nis','p3n1', 'b00b', 'boob', 'BOOB', 'B00B', 'tit', 't1t', 'T1T', 'TIT', 'Tit', 'T1t', 'cock', 'COCK', 'C0CK', 'c0ck', 'Cock', 'C0ck', 'ass', 'ASS', 'Ass', '4ss', 'douchebag', 'Douchebag', 'Kike', 'kike', 'k1ke', 'KIKE', 'K1KE', 'K1ke', 'pedophile', 'Pedophile', 'PEDOPHILE', 'KKK', 'kkk', 'Kkk', 'pussy', 'Pussy', 'PUSSY', 'PUssy', 'guzzler', 'Guzzler', 'GUZZLER', 'EDP', 'edp', 'Edp', 'retard', 'RETARD', 'Retard', 'suck', 'Suck', 'SUCK', 'Come', 'come', 'COME', '69', '420', 'svcker', 'Svcker', 'SUCKER', 'SVCKER'];

document
.getElementById("postaccount")
.addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = document.getElementById("usernameInput").value;
  const password = document.getElementById("passwordInput").value;
  const passwordVerify = document.getElementById("passwordVerify").value;
  let pfpImage = img;
  const age = document.getElementById("ageInput").value;
  if (username.length < 1) {
    notif("Invalid Username!");
    return;
  }
  length = profanity.length;
  while (length--) {
    if (username.indexOf(profanity[length]) != -1) {
      notif("Your username should not include profanity!");
      return;
    }
  }
  if (username.includes(' ')) {
    notif("Your username cannot include spaces.");
    return;
  }
  if (password.length < 9) {
    notif("Your password must be 9 letters or longer");
    return;
  }
  if (age < 13) {
    notif("You must be 13 or older to register");
    return;
  }
  if (age > 120) {
    notif("Invalid age.");
    return;
  }
  if (password != passwordVerify) {
    notif("Passwords do not match.");
    return;
  }
  const newaccount = { username, password, age, pfpImage };
  try {
    const response = await fetch("/accounts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newaccount),
    });
    if (!response.ok) {
      const data = await response.json();
      notif(data.error);
      console.error("Failed to add account:", response.status);
    } else {
      localStorage.setItem('username', username);
      window.location.href = "/index.html";
    }
  } catch (error) {
    console.error("Error adding account:", error);
    notif("An error occurred while adding your account.");
  }
});


function notif(msg) {
  document.getElementById("notif").innerHTML = msg;
  document.getElementById("notif").style.opacity = "100%";
  setTimeout(() => {
    document.getElementById("notif").style.opacity = "0%";
  }, 3000);
}

let img;
document.getElementById('imageInput').addEventListener('change', function(event) {
  img = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function(event) {
    const imageData = event.target.result;
    img = imageData;
  };

  reader.readAsDataURL(img);
});

document.getElementById('back').onmousedown = function(e) {
  window.location.href = "index.html";
}