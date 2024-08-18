# Requirements

Pour installer le projet vous devez avoir:

- Node.js
- NPM
- PNPM

Note: Pour installer PNPM vous pouvez faire:

```bash
npm i pnpm -g
```

Puis relancer votre terminal ou IDE.

# Installation

Pour installer l’application en local, commencez par cloner le repository github :

```bash
git clone https://github.com/jason-heng/soigne-moi-mobile
```

Ensuite dupliquez le fichier .env.example et renommez le en .env puis remplissez les variables d’environements avec les votres.

<aside>
La variable d’environement “EXPO_PUBLIC_API_URL” est le lien vers l’api du site
Si vous faites tourner le site en local ca sera: http://localhost:3000/api
Sinon c’est: https://soigne-moi-web.vercel.app/api
</aside>
<br>
Apres ca, installez les modules necessaires a l’execution du site en faisant:

```bash
pnpm i
```

Finalement vous pouvez lancer le metro bundler via:

```bash
pnpm start
```

Vous pouvez scanner le QR Code qui s’affichera dans votre terminal avec l’application mobile Expo Go pour tester l’application 

Il faut que votre telephone soit dans le meme réseau que ordinateur sur lequel le metro bundler est lancé