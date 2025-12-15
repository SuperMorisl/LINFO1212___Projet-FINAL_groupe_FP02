async function openUserPopup(username) {
  const popup = document.getElementById('popUp');

  // On recup les données de l'utilisateur
  await fetch(`/api/user/${username}`)
    .then(res => res.json())
    .then(data => {
      popup.querySelector('.icon h1').textContent = data.username;
      popup.querySelector('span.grey').textContent = `Membre depuis ${data.userDate}`;
      popup.querySelector('.niveau h2').textContent = `Niveau ${data.userLevel}`;
      popup.querySelector('.level .shape').className = `shape xp-${data.userXp}`;


      // Remplisage des infos sur les stats principales (publi, visite, commentaire)
      const missions = popup.querySelectorAll('.missions .mission');
      missions[0].querySelector('h1').textContent = data.userMissions.commentaires;
      missions[1].querySelector('h1').textContent = data.userMissions.visites;
      missions[2].querySelector('h1').textContent = data.userMissions.publication;

      // Remplissage des trophées 
      const trophyContainer = document.getElementById('trophiesContainer');
      trophyContainer.innerHTML = ''; // <-- Efface les trophées précédents

      data.allTrophies.forEach(t => {
        const unlocked = data.userTrophies.includes(t.id);
        const div = document.createElement('div');
        div.className = `mission ${unlocked ? '' : 'locked-mission'}`;
        div.innerHTML = `<img src="${t.image}">
                         <h1>${t.title}</h1>
                         <span class="grey">${t.description}</span>`;
        trophyContainer.appendChild(div);
      });

      popup.style.display = 'flex';
    })
    .catch(err => console.error(err));
}

function closePopup() {
  document.getElementById('popUp').style.display = 'none';
}
