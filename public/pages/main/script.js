var loggedIn = false;
var username = localStorage.getItem("qmail");

if (username != null) {
  loggedIn = true;
} else {
  window.location.href = "/index.html";
}

if (loggedIn) {
  fetch("/accounts")
    .then((response) => response.json())
    .then((accounts) => {
      const userAccount = accounts.find(
        (account) => account.qmail === username,
      );
      const pfpImage = userAccount.pfpImage;
      const userQmails = userAccount.qmails;
      for (const qmail of userQmails) {
        const regexRecipients = /\(([^)]+)\)/;
        const matchesRecipients = qmail.match(regexRecipients);
        let withoutRecipients = matchesRecipients;
        const newElement = document.createElement("div");
        newElement.classList.add("viewQmail");
        newElement.innerHTML = `
        <span onmousedown="deleteQmail('${qmail}');" class="material-symbols-rounded">delete</span> 
        <p onmousedown="
        const regex = /{([^}]+)}/; 
        const matches = '${qmail}'.match(regex);
        localStorage.setItem('savedQmail', '${qmail}');
        localStorage.setItem('savedUsername', matches[1]);
        window.location.href = '/pages/viewQmail/index.html';
        ">${qmail.replaceAll('{', '').replaceAll('}', '').replaceAll('(', "<span class='hidden'>").replaceAll(')', "</span>")}</p>
        `;

        document.getElementById('inbox').appendChild(newElement);
      }
      document.getElementById('qmail').innerHTML = userAccount.qmail;
      document.getElementById('username').innerHTML = userAccount.username;
      if (pfpImage != undefined) {
        document.getElementById("pfp").style.backgroundImage = `url(${pfpImage})`;
      }
      document.getElementById("pfp").style.backgroundPosition = `center center`;
      document.getElementById("pfp").style.backgroundSize = `cover`;
    })
    .catch((error) => console.error("Error fetching pfpImage:", error));
}

document.onkeydown = (e) => {
  if (e.key == 123) {
    e.preventDefault();
  }
  if (e.ctrlKey && e.shiftKey && e.key == "I") {
    e.preventDefault();
  }
  if (e.ctrlKey && e.shiftKey && e.key == "C") {
    e.preventDefault();
  }
  if (e.ctrlKey && e.shiftKey && e.key == "J") {
    e.preventDefault();
  }
  if (e.ctrlKey && e.key == "U") {
    e.preventDefault();
  }
};

document.getElementById('newQmail').onmousedown = function (e) {
  document.getElementById('newQmailForm').style.display = 'block';
  document.getElementById('newQmailForm').style.animation = 'enlarge .7s ease-in-out';
  setTimeout(function(){
    document.getElementById('newQmailForm').style.transform = 'scale(100%)';
  }, 700);
}

document.getElementById('close').onmousedown = function (e) {
  document.getElementById('newQmailForm').style.animation = 'shrink .7s ease-in-out';
  setTimeout(function(){
    document.getElementById('newQmailForm').style.display = 'none';
  }, 650);
}

document.getElementById('submit').onmousedown = function (e) {
  const recipientUsername = document.getElementById('recipientInput').value;
  const qmailContent = document.getElementById('qmailContent').value;
  addQmail(recipientUsername, `{${username}} - ${qmailContent} (${recipientUsername})`);
}

const addQmail = async (username, qmail) => {
  const usernames = username.split(' ');
  try {
    const requests = usernames.map(async (curUsername) => {
      const response = await fetch('/addQmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: curUsername, qmail })
      });
      return response;
    });

    const responses = await Promise.all(requests);
    const successfulResponses = responses.filter(response => response.ok);
    if (successfulResponses.length === usernames.length) {
      notif('Qmail sent.');
      document.getElementById('qmailContent').value = '';
      document.getElementById('recipientInput').value = '';
    } else {
      notif('An error occurred. Please try again later.');
    }
  } catch (error) {
    console.error('An error occurred while sending qmail:', error);
  }
};


async function deleteQmail(qmail) {
  try {
    const response = await fetch('/deleteQmail', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ qmail })
    });
    const data = await response.json();
    console.log(data.message); 
    window.location.reload();
  } catch (error) {
    console.error('Error occurred while deleting qmail:', error);
  }
}

function notif(msg) {
  document.getElementById("notif").innerHTML = msg;
  document.getElementById("notif").style.opacity = "100%";
  setTimeout(() => {
    document.getElementById("notif").style.opacity = "0%";
  }, 3000);
}

// Frontend JS

document.getElementById('search').addEventListener('input', async function(event) {
  const input = event.target.value;
  const searchResults = await fetch(`/searchQmails/${input}`);
  const { result } = await searchResults.json();
  alert(JSON.stringify(result[1]));
});
