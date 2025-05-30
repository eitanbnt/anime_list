import axios from 'axios';
import * as cheerio from 'cheerio';
import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';
import fs from 'fs';
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';


const USERNAME = 'eitanbnt@gmail.com';
const PASSWORD = 'Ebenita2?';

const jar = new CookieJar();
const client = wrapper(axios.create({ jar, withCredentials: true }));

async function login() {
    console.log('🔐 Connexion à TV Time...');
    const loginPage = await client.get('https://app.tvtime.com/email');//https://www.tvtime.com/login
    const $ = cheerio.load(loginPage.data);
    const csrfToken = $('meta[name="csrf-token"]').attr('content');

    const res = await client.post(
        'https://app.tvtime.com/email',
        new URLSearchParams({
            'user[email]': USERNAME,
            'user[password]': PASSWORD
        }),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Referer': 'https://app.tvtime.com/email',
                'X-CSRF-Token': csrfToken
            },
            maxRedirects: 0,
            validateStatus: status => status === 302 || status === 200
        }
    );

    if (res.status !== 302) {
        throw new Error('❌ Échec de connexion — vérifie tes identifiants.');
    }

    console.log('✅ Connecté avec succès.');
}

async function getUserId() {
    console.log('🔍 Récupération de ton ID utilisateur...');
    const res = await client.get('https://www.tvtime.com');
    const $ = cheerio.load(res.data);
    const userLink = $('a[href*="/user/"]').attr('href');
    const match = userLink && userLink.match(/\/user\/(\d+)/);
    if (!match) throw new Error('Impossible de trouver ton ID utilisateur.');

    const userId = match[1];
    console.log(`🆔 ID utilisateur : ${userId}`);
    return userId;
}

async function getFollowedShows(userId) {
    console.log('📺 Récupération des séries suivies...');
    const res = await client.get(`https://www.tvtime.com/en/user/${userId}/profile`);
    const $ = cheerio.load(res.data);
    const shows = [];

    $('.show-item').each((_, el) => {
        const name = $(el).find('.name').text().trim();
        const href = $(el).find('a').attr('href');
        const idMatch = href && href.match(/\/show\/(\d+)/);
        if (name && idMatch) {
            shows.push({ id: idMatch[1], name });
        }
    });

    console.log(`➡️ ${shows.length} séries trouvées.`);
    return shows;
}

async function getWatchedEpisodes(showId) {
    const res = await client.get(`https://www.tvtime.com/en/show/${showId}`);
    const $ = cheerio.load(res.data);
    const episodes = [];

    $('.episode-card.seen').each((_, el) => {
        const seasonEpisode = $(el).find('.episode-number').text().trim();
        const title = $(el).find('.episode-title').text().trim();
        if (seasonEpisode) {
            episodes.push({
                episode: seasonEpisode,
                title: title || 'Sans titre'
            });
        }
    });

    return episodes;
}

async function exportToFiles(data) {
    console.log('💾 Export des données...');

    // JSON
    fs.writeFileSync('tvtime_data.json', JSON.stringify(data, null, 2));
    console.log('✅ JSON sauvegardé : tvtime_data.json');

    // CSV
    const rows = data.flatMap(show =>
        show.episodes.map(ep => ({
            show: show.name,
            episode: ep.episode,
            title: ep.title
        }))
    );

    const csvWriter = createCsvWriter({
        path: 'tvtime_data.csv',
        header: [
            { id: 'show', title: 'Show' },
            { id: 'episode', title: 'Episode' },
            { id: 'title', title: 'Title' }
        ]
    });

    await csvWriter.writeRecords(rows);
    console.log('✅ CSV sauvegardé : tvtime_data.csv');
}

async function main() {
    try {
        await login();
        const userId = await getUserId();
        const shows = await getFollowedShows(userId);

        const fullData = [];
        for (const show of shows) {
            console.log(`🔍 ${show.name}...`);
            const episodes = await getWatchedEpisodes(show.id);
            fullData.push({
                id: show.id,
                name: show.name,
                episodes
            });
        }

        await exportToFiles(fullData);
        console.log('\n🎉 Terminé.');
    } catch (err) {
        console.error('💥 Erreur :', err.message);
    }
}

main();
