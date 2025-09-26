# TaskZen

TaskZen est une application Vue 3/Vite qui combine une matrice d'Eisenhower et un tableau Kanban pour aider les équipes à
prioriser leurs tâches et suivre l'avancement de leurs projets. Les données sont synchronisées en temps réel via Supabase.

## Fonctionnalités principales

* **Matrice d'Eisenhower** — Classez les tâches selon leur importance et leur urgence, archivez automatiquement les tâches
  terminées et consultez des statistiques ainsi que des recommandations contextuelles.
* **Kanban simplifié** — Faites progresser les projets par étapes et marquez les tâches comme terminées lorsqu'elles sont
  prêtes à être archivées.
* **Synchronisation Supabase** — Authentification, stockage des tâches et sous-tâches, suivi des archives et des statistiques
  partagées entre la matrice et le Kanban.

## Structure du projet

```
src/
├── App.vue                # Orchestration globale (authentification, choix des outils)
├── Landing.vue            # Page d'accueil et formulaire de connexion/inscription
├── MatrixTool.vue         # Interface de la matrice d'Eisenhower
├── KanbanTool.vue         # Tableau Kanban pour le suivi de projet
├── DashboardChart.vue     # Graphique des répartitions de tâches
├── RecommendationBox.vue  # Conseils adaptés aux données de la matrice
├── ArchivedStats.vue      # Historique des tâches terminées
└── supabase.js            # Initialisation du client Supabase
```

Le dossier `public/` contient l'index HTML de base et les assets statiques. Les classes d'interface utilisent principalement
Tailwind CSS via les classes utilitaires.

## Prérequis

* Node.js 20.19+ (voir le champ `engines` du `package.json`).
* Un projet Supabase configuré avec les tables suivantes :
  * `tasks`
    * `id` (uuid ou int, clé primaire)
    * `title` (text)
    * `urgency` (int)
    * `importance` (int)
    * `comment` (text, optionnel)
    * `deadline` (timestamp, optionnel)
    * `isComplete` (bool, défaut `false`)
    * `kanban_status` (text, valeurs `backlog`, `todo`, `inprogress`, `archived`)
    * `archived_from_quadrant` (text, optionnel)
    * `archived_at` (timestamp, optionnel)
    * `user_id` (uuid, référence vers `auth.users`)
    * `created_at` (timestamp, défaut `now()`)
  * `sub_tasks`
    * `id` (uuid/int, clé primaire)
    * `title` (text)
    * `comment` (text, optionnel)
    * `deadline` (timestamp, optionnel)
    * `is_complete` (bool, défaut `false`)
    * `task_id` (référence vers `tasks.id`)
    * `user_id` (uuid, référence vers `auth.users`)

Assurez-vous que les règles RLS (Row Level Security) de Supabase autorisent chaque utilisateur à lire/écrire uniquement ses
propres tâches et sous-tâches.

## Configuration de l'environnement

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```ini
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Ces variables sont chargées dans `src/supabase.js` pour initialiser le client Supabase.

## Installation et lancement

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement (http://localhost:5173)
npm run dev

# Construire l'application pour la production
npm run build

# Prévisualiser le build de production
npm run preview
```

## Flux de travail conseillé

1. Les utilisateurs se connectent via la page d'accueil (`Landing.vue`).
2. Une fois authentifié, l'utilisateur choisit l'outil souhaité (`MatrixTool` ou `KanbanTool`).
3. Les tâches saisies dans la matrice peuvent être déplacées vers le Kanban en un clic et inversement, les tâches terminées
   dans le Kanban sont archivées et apparaissent dans les statistiques de la matrice.
4. Les données sont persistées côté Supabase et filtrées par `user_id` pour garantir l'isolation des comptes.

## Dépannage

* **Aucune donnée n'apparaît après connexion** — Vérifiez que l'utilisateur possède bien des entrées dans les tables `tasks`
  et `sub_tasks`, et que les règles RLS permettent la lecture.
* **Erreurs Supabase 401/403** — Confirmez que la clé `VITE_SUPABASE_ANON_KEY` correspond au projet et que la session est valide.
* **Fuseaux horaires** — Les dates limites sont converties côté client en utilisant le fuseau horaire local pour éviter les
  décalages lors de la saisie ou de l'édition.

## Contribution

1. Créez une branche dédiée.
2. Effectuez vos modifications (code et tests).
3. Soumettez une Pull Request décrivant clairement le changement et les impacts éventuels.

---

Ce document sert de point d'entrée rapide pour comprendre l'architecture du projet et le configurer localement. Pour toute
amélioration de la documentation, n'hésitez pas à proposer des mises à jour supplémentaires.
