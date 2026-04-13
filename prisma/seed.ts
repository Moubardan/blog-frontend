import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      email: "alice@example.com",
      name: "Alice Martin",
      password,
    },
  });

  const posts = [
    {
      title: "Comprendre le Server-Side Rendering avec Next.js",
      slug: "comprendre-ssr-nextjs",
      content: `Le Server-Side Rendering (SSR) est une technique qui permet de générer le HTML d'une page côté serveur avant de l'envoyer au navigateur. Avec Next.js 14 et l'App Router, le SSR est le comportement par défaut pour tous les Server Components.\n\nContrairement au Client-Side Rendering où le navigateur reçoit un HTML vide puis charge le JavaScript pour afficher le contenu, le SSR envoie une page complète dès la première requête. Cela améliore le SEO, le temps de chargement perçu (FCP) et l'accessibilité.\n\nNext.js propose plusieurs stratégies de rendu :\n- **SSR dynamique** : la page est générée à chaque requête\n- **SSG (Static Site Generation)** : la page est générée au build\n- **ISR (Incremental Static Regeneration)** : la page est regénérée en arrière-plan après un intervalle défini\n\nDans notre blog, nous utilisons ISR avec un revalidate de 60 secondes pour offrir des pages rapides tout en gardant le contenu relativement frais.`,
      excerpt:
        "Découvrez comment Next.js 14 gère le rendu côté serveur et pourquoi c'est important pour votre blog.",
      published: true,
    },
    {
      title: "Authentification sécurisée avec NextAuth.js v5",
      slug: "authentification-nextauth-v5",
      content: `NextAuth.js v5 (aussi connu sous le nom Auth.js) simplifie considérablement l'authentification dans les applications Next.js. Il supporte de nombreux providers OAuth (Google, GitHub, etc.) ainsi que l'authentification par credentials (email/mot de passe).\n\nLa configuration se fait dans un fichier auth.ts central qui exporte les handlers, le middleware et les fonctions utilitaires. Les callbacks jwt et session permettent de personnaliser le contenu du token et de la session.\n\nUn point clé de notre architecture : nous utilisons la stratégie JWT de NextAuth pour pouvoir transmettre le token en Bearer header vers notre API NestJS. Cela permet une authentification unifiée entre le frontend et le backend.\n\nLe middleware Next.js protège les routes /dashboard/* en vérifiant la présence d'une session valide avant d'autoriser l'accès.`,
      excerpt:
        "Comment mettre en place une authentification robuste avec NextAuth.js v5 et la stratégie JWT.",
      published: true,
    },
    {
      title: "Server Actions et validation Zod dans Next.js",
      slug: "server-actions-zod-nextjs",
      content: `Les Server Actions sont une fonctionnalité puissante de Next.js qui permet d'exécuter du code serveur directement depuis les composants React. Combinées avec Zod pour la validation, elles offrent un pattern élégant pour les mutations de données.\n\nUne Server Action est une fonction asynchrone marquée avec 'use server'. Elle peut être appelée depuis un formulaire HTML natif ou depuis du code JavaScript. Le framework gère automatiquement la sérialisation des données et la communication client-serveur.\n\nAvec Zod, nous définissons un schéma de validation typé qui sert à la fois de documentation et de garde-fou. Le pattern safeParse() permet de retourner des erreurs de validation structurées au client sans lever d'exception.\n\nCe pattern élimine le besoin d'une route API intermédiaire et réduit le code boilerplate tout en maintenant une validation stricte côté serveur.`,
      excerpt:
        "Apprenez à utiliser les Server Actions avec la validation Zod pour des mutations sécurisées.",
      published: true,
    },
    {
      title: "Architecture full-stack : Next.js + NestJS",
      slug: "architecture-fullstack-nextjs-nestjs",
      content: `Combiner Next.js pour le frontend et NestJS pour le backend offre une architecture robuste et scalable. Next.js gère le rendu, le routing et l'expérience utilisateur, tandis que NestJS fournit une API REST structurée avec une architecture modulaire.\n\nLe pont entre les deux se fait via des types TypeScript partagés dans un dossier /shared/types/. Ce contrat d'API garantit la cohérence des données entre le frontend et le backend.\n\nL'authentification suit un flux précis : NextAuth gère la session côté Next.js et génère un JWT qui est transmis en Bearer token à l'API NestJS. Côté NestJS, un JwtStrategy Passport valide ce token et extrait les informations utilisateur.\n\nLa configuration CORS de NestJS n'accepte que l'origin de production Vercel, ajoutant une couche de sécurité supplémentaire.`,
      excerpt:
        "Découvrez comment connecter un frontend Next.js à une API NestJS avec une authentification JWT partagée.",
      published: true,
    },
    {
      title: "Déploiement continu : Vercel + Railway",
      slug: "deploiement-vercel-railway",
      content: `Le déploiement moderne d'une application full-stack repose sur des plateformes spécialisées. Vercel est optimisé pour Next.js avec un support natif de l'ISR, des Edge Functions et du déploiement automatique depuis Git.\n\nRailway complète l'architecture en hébergeant l'API NestJS et sa base de données PostgreSQL. La plateforme détecte automatiquement le Dockerfile et provisionne les ressources nécessaires.\n\nLe pipeline CI/CD avec GitHub Actions assure que chaque push déclenche :\n1. L'exécution des tests (unitaires et intégration)\n2. La vérification de la couverture de code (≥80%)\n3. Le build de l'image Docker\n4. Le déploiement automatique si tous les checks passent\n\nLes variables d'environnement sont gérées séparément sur chaque plateforme, avec un .env.example documenté pour le setup local.`,
      excerpt:
        "Guide pratique pour déployer un blog Next.js sur Vercel et une API NestJS sur Railway.",
      published: false,
    },
  ];

  for (const post of posts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        ...post,
        authorId: user.id,
      },
    });
  }

  console.log("Seed completed: 1 user, 5 posts created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
