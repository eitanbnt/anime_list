import axios from 'axios';
import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';

const USERNAME = 'eitanbnt@gmail.com';
const PASSWORD = 'Ebenita2?';

const jar = new CookieJar();
const client = wrapper(axios.create({ jar, withCredentials: true }));

async function loginToTVTime() {
  console.log('🔐 Étape 1 : Soumission de l’email...');
  const emailRes = await client.post('https://app.tvtime.com/email', {
    email: USERNAME
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (emailRes.status !== 200) {
    throw new Error(`Erreur lors de l'envoi de l'email : ${emailRes.status}`);
  }

  console.log('🔑 Étape 2 : Envoi du mot de passe...');
  const passwordRes = await client.post('https://app.tvtime.com/password', {
    password: PASSWORD
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (passwordRes.status !== 200) {
    throw new Error(`Erreur lors de l'envoi du mot de passe : ${passwordRes.status}`);
  }

  console.log('✅ Connexion réussie !');
  console.log('🍪 Cookies de session :');
  console.log(await jar.getCookies('https://app.tvtime.com'));
}

loginToTVTime().catch(err => {
  console.error('💥 Erreur :', err.message);
});
