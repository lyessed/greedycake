# Greedy Cake & Events — site vitrine

Site statique (aucun build, aucune dépendance hors Google Fonts) pour la micro-entreprise
Greedy Cake & Events (pâtisserie sur-mesure & décoration d'événements, Drancy 93).

## Structure

```
index.html              page d'accueil
devis.html               formulaire de devis multi-étapes (4 étapes) -> webhook n8n
mentions-legales.html    mentions légales / politique de confidentialité RGPD
images/                  logo + photos
```

## Développement local

Aucun build : ouvrir `index.html` dans un navigateur, ou servir le dossier avec
n'importe quel serveur statique, par ex. :

```bash
npx serve .
```

## Formulaire de devis → n8n

Dans `devis.html`, la constante `WEBHOOK_URL` (en haut du `<script>` en fin de fichier)
doit pointer vers l'URL de production du webhook n8n :

```js
var WEBHOOK_URL = "https://<ton-domaine-n8n>/webhook/devis-greedy-cake";
```

Tant qu'elle est vide (`""`), l'envoi est simulé (mode démo, aucune requête réseau).

**CORS** : sur le nœud Webhook n8n, activer « Allowed Origins (CORS) » avec :
- le domaine de production Vercel du site
- `http://localhost` (et le port du serveur local) pour les tests

Le payload envoyé est un POST JSON avec les objets `meta`, `evenement`, `prestations`,
`details` (`gateau`, `gourmandises` avec `parfums_cupcakes`, `decoration`), `contraintes`,
`inspiration`, `contact`, `consentement_rgpd` — ce schéma ne doit pas être modifié sans
mettre à jour le workflow n8n en parallèle.

Le champ caché `name="website"` est un honeypot anti-spam : ne pas le supprimer, ne pas
lui donner de `label` visible.

## Images

Les 6 cartes de la section "Créations" (`.ph.p1` … `.ph.p6`) et le bloc `.visual` de la
section "Savoir-faire" sont actuellement des dégradés CSS en attendant les vraies photos.
Pour les remplacer, insérer une balise `<img>` à l'intérieur du `div` correspondant
(le CSS gère déjà `object-fit:cover` et les coins arrondis) :

```html
<div class="ph p1"><img src="images/creations/layer-cake.jpg" alt="Layer cake sur-mesure" loading="lazy"></div>
```

Prévoir des images compressées, largeur ~1200px.

## Mentions légales

`mentions-legales.html` contient des `[À COMPLÉTER]` pour le SIRET, l'adresse et
les coordonnées de contact — à remplacer dès que ces informations sont disponibles.

## Déploiement

Déployé sur Vercel en tant que site 100 % statique (pas de configuration de build
nécessaire). Un nom de domaine personnalisé (ex. `greedycake.fr`) peut être branché
ultérieurement depuis les réglages du projet Vercel.
