export class Anime {
    constructor({ id, titre, nbEpisode, nbSaison, statut, vu = 0 }) {
        Object.assign(this, { id, titre, nbEpisode, nbSaison, statut, vu });
    }

    // % de progression
    progress() {
        return Math.round((this.vu / this.nbEpisode) * 100);
    }

    isFinished() {
        return this.statut === "Terminé";
    }

    // marquer un épisode comme vu
    markOneSeen() {
        if (this.vu < this.nbEpisode) this.vu++;
    }
}