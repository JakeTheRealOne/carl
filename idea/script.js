const circles = document.querySelectorAll('.circle');
const smallCircle = document.querySelector('.small-center');
const topText = document.getElementById('top-text');
const laRoue = document.getElementById('LaRoue');

// Texte à afficher pour chaque cercle
const textMap = {
  'north': 'Changement d\'état civil',
  'north-east': 'Document',
  'east': 'Personne de contact',
  'south-east': 'Localisation d\'institution',
  'south': 'Signalement de problème communale',
  'south-west': 'Difficulté administrative en tant qu\'étranger',
  'west': 'Prise de rendez-vous',
  'north-west': 'Organisation d\'évènement',
  'center': 'Question générale'
};

const autofillMap = {
  'north': 'Je compte changer mon état civil à propos de ',
  'north-east': 'Je souhaite obtenir les documents suivant: ',
  'east': 'Comment contacter M/Mme ',
  'south-east': 'Où se trouve l\'institution ',
  'south': 'Je souhaite signaler un soucis dans mon quartier/la ville.',
  'south-west': 'Venant d\'un autre pays, j\'éprouve des difficultés dans les démarches de ',
  'west': 'Comment prendre rendez-vous pour',
  'north-west': 'Vers quel bureau dois-je me tourner pour organiser un évenement du type',
  'center': ''
};



function moveSmallCircle(e) {
  const circle = e.currentTarget;
  if (circle === smallCircle) return;

  // Position réelle à l'écran
  const rect = circle.getBoundingClientRect();
  const containerRect = document.querySelector('.container').getBoundingClientRect();

  const circleCenterX = rect.left + rect.width / 2 - containerRect.left;
  const circleCenterY = rect.top + rect.height / 2 - containerRect.top;

  smallCircle.style.left = `${circleCenterX}px`;
  smallCircle.style.top = `${circleCenterY}px`;

  // Affichage du texte
  const className = [...circle.classList].find(cls => textMap[cls]);
  if (className) {
    topText.textContent = textMap[className];
    topText.style.display = 'block';
  }
}

function handleMouseLeave(e) {
  const circle = e.currentTarget;
  if (circle !== smallCircle) {
    topText.style.display = 'none';
  }
}

function resetSmallCircle() {
  smallCircle.style.transform = `translate(-50%, -50%) scale(1)`;
}

function resetBall() {
  const circle = document.getElementById('DefaultCircle');
  if (circle === smallCircle) return;

  // Position réelle à l'écran
  const rect = circle.getBoundingClientRect();
  const containerRect = document.querySelector('.container').getBoundingClientRect();

  const circleCenterX = rect.left + rect.width / 2 - containerRect.left;
  const circleCenterY = rect.top + rect.height / 2 - containerRect.top;

  smallCircle.style.left = `${circleCenterX}px`;
  smallCircle.style.top = `${circleCenterY}px`;

  // Affichage du texte
  const className = [...circle.classList].find(cls => textMap[cls]);
  if (className) {
    topText.textContent = textMap[className];
    topText.style.display = 'block';
  }
}

laRoue.addEventListener('mouseleave', resetBall);

circles.forEach(circle => {
  if (circle !== smallCircle) {
    circle.addEventListener('mouseenter', moveSmallCircle);
    circle.addEventListener('mouseleave', handleMouseLeave);
    circle.addEventListener('click', () => {
      const className = [...circle.classList].find(cls => textMap[cls]);
      if (className && className !== 'center') {
        const phrase = encodeURIComponent(autofillMap[className]);
        window.location.href = `chat.html?phrase=${phrase}`;
      } else {
        window.location.href = 'chat.html';
      }
    });
  }
});


async function sendMessage() {
  const inputField = document.getElementById("user-input");
  const message = inputField.value.trim();
  if (message === "") return;

  addMessageToChat("user", message);
  inputField.value = "";

  const reply = await getReply(message);
  if (reply == undefined) {
    addMessageToChat("error", "Erreur de connexion");
  } else {
    console.log(reply.substring(0, 3));
    addMessageToChat("bot", reply);
  }
}

// const marked = require('marked');
// const renderer = new marked.Renderer();
// renderer.paragraph = (text) => {
//   return `<p>${text}</p>`;
// };
// renderer.list = (body, ordered) => {
//   const type = ordered ? 'ol' : 'ul';
//   return `<${type}>${body}</${type}>`;
// };
// renderer.listitem = (text) => {
//   return `<li>${text}</li>`;
// };
// marked.setOptions({
//   renderer: renderer,
// });

function addMessageToChat(sender, text) {
  const chatLog = document.getElementById("chat-log");
  const messageDiv = document.createElement("div");
  messageDiv.className = `chat-message ${sender}`;
  if (sender === "bot") {
    const htmlContent = marked.parse(text).replace(/\n/g, "<br>").replace(/<br>$/, "");;
    messageDiv.innerHTML = htmlContent;
  } else {
    messageDiv.textContent = text;
  }

  chatLog.appendChild(messageDiv);

  // // Vérifiez si le dernier caractère de la réponse est "o"
  // if (sender === "bot" && text.charAt(text.length - 1).toLowerCase() !== 'n') {
  //   const character  = text.charAt(text.length - 1).toLowerCase();
  //   // const infoDiv = document.createElement("div");
  //   // infoDiv.className = `chat-message ${sender}`;
  //   // infoDiv.textContent = character === 'p' ?  "Besoin d'un passeport ? Prends directement rendez-vous dans une de nos institution:" : character === 'c' ? "Accède au calendrier de la ville:" : character === 'i' ? "Carte d'iden" : character === 's' ? "SIGNALER UN PROBLÈME" : "VERS CHARELEROI.BE";
  //   // chatLog.appendChild(infoDiv);

  //   const button = document.createElement("button");
  //   button.textContent = character === 'p' ?  "RDV PASSEPORT" : character === 'c' ? "CALENDRIER DE CHARLEROI" : character === 'i' ? "RENOUVELER VOTRE CARTE D'IDENTITÉ" : character === 's' ? "SIGNALER UN PROBLÈME" : "VERS CHARLEROI.BE";
  //   button.className = character === 'p' ?  "passport-btn" : character === 's' ? 'signal-btn' : character === 'c' ? "calendrier-btn" : character === 'i' ? "id-btn" : "raw-btn"; // Ajoutez une classe CSS si vous souhaitez styliser ce bouton
  //   button.style.color = "white";
  //   button.style.padding = "3px 10px";
  //   button.style.border = "none";
  //   button.style.borderRadius = "9999px";
  //   button.style.cursor = "pointer";
  //   button.style.fontSize = "10pt";
  //   button.addEventListener("click", () => {
  //     window.location.href="https://charleroi.be";
  //   });
  //   chatLog.appendChild(button); // Ajoutez le bouton sous le message
    
  // }

  chatLog.scrollTop = chatLog.scrollHeight;
}

async function getReply(input) {
  try {
    const response = await fetch('http://127.0.0.1:5000/api/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: input }),
      withCredentials: true
    });

    const data = await response.json();
    return data.response;  // Retourne la réponse après avoir attendu la résolution de la promesse
  } catch (error) {
    console.error('Erreur:', error);
    return undefined;  // Retourne undefined en cas d'erreur
  }
}
