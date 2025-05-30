export function createAnimeCard(anime) {
    const card = document.createElement("article");
    card.className = "card-anime";

    card.innerHTML = `
    <img src="https://placehold.co/240x320/png" alt="">
    <div class="card-body">
      <h2 class="card-title">${anime.titre}</h2>
      <span class="status">${anime.statut}</span>
      <div class="progress-bar" style="--progress:${anime.progress()}%"></div>
      <p>${anime.vu}/${anime.nbEpisode} épisodes vus</p>
      <button class="btn">+1 épisode</button>
    </div>
  `;

    // petit listener qui met à jour l’affichage
    card.querySelector("button").addEventListener("click", () => {
        anime.markOneSeen();
        card.querySelector(".progress-bar").style.setProperty(
            "--progress",
            `${anime.progress()}%`
        );
        card.querySelector("p").textContent =
            `${anime.vu}/${anime.nbEpisode} épisodes vus`;
    });

    return card;
}