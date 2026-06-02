import type { ContentCategory } from "./types";

interface CategoryTemplate {
  hooks: string[];
  bridgePhrases: string[];
  closings: string[];
}

export const SCRIPT_TEMPLATES: Record<ContentCategory, CategoryTemplate> = {
  culture: {
    hooks: [
      "Le saviez-vous ?",
      "Voici quelque chose d'incroyable.",
      "Ce pays va vous surprendre.",
      "Une découverte fascinante vous attend.",
    ],
    bridgePhrases: [
      "La première raison est simple :",
      "Ce qui est remarquable, c'est que",
      "Les habitants ont une habitude unique :",
      "Cette tradition remonte à des siècles.",
      "La culture locale explique tout.",
      "Voici ce que peu de gens savent.",
      "Et pourtant, la réalité est bien différente.",
    ],
    closings: [
      "Voilà pourquoi ce pays est si unique.",
      "C'est ce qui rend cette culture fascinante.",
      "Une leçon que le monde entier devrait retenir.",
    ],
  },
  business: {
    hooks: [
      "La vérité sur la réussite financière.",
      "Ce que les riches savent et ignorent les autres.",
      "Le secret des entrepreneurs à succès.",
      "Voici comment transformer votre rapport à l'argent.",
    ],
    bridgePhrases: [
      "La première règle est simple :",
      "Les experts s'accordent à dire que",
      "La différence entre les riches et les autres, c'est",
      "Le principe fondamental est le suivant :",
      "Cette stratégie change absolument tout.",
      "Voici la méthode qui fonctionne réellement.",
      "Les chiffres parlent d'eux-mêmes :",
    ],
    closings: [
      "Appliquez ces principes et observez le changement.",
      "La réussite financière est à votre portée.",
      "Commencez dès aujourd'hui. Pas demain.",
    ],
  },
  motivation: {
    hooks: [
      "Tu es capable de bien plus que tu ne le crois.",
      "Un seul changement peut tout transformer.",
      "La plus grande limite, c'est toi-même.",
      "Chaque grand voyage commence par un premier pas.",
    ],
    bridgePhrases: [
      "La clé du succès, c'est",
      "Les champions font ce que les autres refusent.",
      "Chaque défi est une opportunité déguisée.",
      "Le plus difficile, c'est de commencer.",
      "Ta transformation commence maintenant.",
      "Cette habitude change tout en 30 jours.",
      "Les gagnants ont un secret en commun :",
    ],
    closings: [
      "Agis maintenant. Pas demain.",
      "Tu es plus proche du succès que tu ne le penses.",
      "La meilleure version de toi commence ici.",
    ],
  },
  sport: {
    hooks: [
      "Les champions ont un secret.",
      "Ce qui sépare les grands des autres.",
      "La vérité sur la performance sportive.",
      "Pourquoi certains athlètes dépassent toutes les limites.",
    ],
    bridgePhrases: [
      "L'entraînement mental est aussi crucial que le physique.",
      "La discipline quotidienne fait toute la différence.",
      "Les meilleurs athlètes partagent cette habitude :",
      "La récupération est aussi importante que l'effort.",
      "Chaque répétition compte. Vraiment.",
      "Les données scientifiques confirment :",
      "Voici le protocole des champions :",
    ],
    closings: [
      "Le champion est en toi. Libère-le.",
      "L'effort d'aujourd'hui, la victoire de demain.",
      "Entraîne-toi comme si tout en dépendait.",
    ],
  },
  histoire: {
    hooks: [
      "Il y a plusieurs siècles, l'incroyable s'est produit.",
      "L'histoire a gardé ce secret bien trop longtemps.",
      "Un événement qui a changé le cours de l'humanité.",
      "Ce moment historique a tout transformé.",
    ],
    bridgePhrases: [
      "À cette époque,",
      "Les historiens ont découvert que",
      "Ce que peu de gens savent, c'est que",
      "La vérité derrière cet événement est",
      "Les archives révèlent une réalité surprenante :",
      "Les témoignages de l'époque racontent",
      "Cette décision a changé des millions de vies.",
    ],
    closings: [
      "L'histoire nous enseigne une leçon précieuse.",
      "Ce passé continue de façonner notre présent.",
      "N'oublions pas les leçons du passé.",
    ],
  },
  science: {
    hooks: [
      "Les scientifiques ont fait une découverte incroyable.",
      "La science vient de tout remettre en question.",
      "Ce phénomène défie toute logique connue.",
      "La nature cache encore des mystères insoupçonnés.",
    ],
    bridgePhrases: [
      "Les recherches montrent clairement que",
      "Une étude récente a prouvé que",
      "Les données scientifiques confirment",
      "Ce phénomène s'explique par",
      "Les experts estiment avec certitude que",
      "Cette découverte ouvre de nouvelles portes.",
      "Le mécanisme est fascinant :",
    ],
    closings: [
      "La science continue de nous étonner chaque jour.",
      "Ces découvertes changeront notre avenir.",
      "Le savoir est la plus grande des richesses.",
    ],
  },
  technologie: {
    hooks: [
      "La technologie vient de franchir une nouvelle frontière.",
      "Ce qui était impossible hier est réalité aujourd'hui.",
      "L'intelligence artificielle change absolument tout.",
      "Le futur est déjà là. Êtes-vous prêt ?",
    ],
    bridgePhrases: [
      "Cette innovation révolutionne",
      "Les ingénieurs ont développé",
      "Ce système utilise l'IA pour",
      "Grâce à cette technologie,",
      "Dans quelques années seulement,",
      "Les tests montrent des résultats stupéfiants :",
      "Cette avancée transforme notre quotidien.",
    ],
    closings: [
      "La révolution technologique ne fait que commencer.",
      "Préparez-vous pour un monde radicalement différent.",
      "Le futur appartient à ceux qui s'y préparent dès maintenant.",
    ],
  },
  santé: {
    hooks: [
      "Votre corps essaie de vous dire quelque chose.",
      "Ce que votre médecin ne vous dit pas toujours.",
      "Une habitude qui peut transformer votre santé.",
      "La vérité sur votre bien-être au quotidien.",
    ],
    bridgePhrases: [
      "Les études montrent que",
      "Cette habitude simple peut",
      "Votre alimentation affecte directement",
      "Le sommeil est crucial pour",
      "Le stress chronique provoque",
      "Cette pratique améliore la qualité de vie de 40%.",
      "La médecine moderne confirme :",
    ],
    closings: [
      "Votre santé est votre plus grande richesse.",
      "Commencez par un petit changement aujourd'hui.",
      "Prenez soin de vous. Vous le méritez vraiment.",
    ],
  },
  voyage: {
    hooks: [
      "Cette destination va vous couper le souffle.",
      "Un endroit que vous devez absolument voir.",
      "Le voyage de votre vie vous attend.",
      "Voici pourquoi vous devez partir maintenant.",
    ],
    bridgePhrases: [
      "Une fois sur place,",
      "Ce qui rend cet endroit unique, c'est",
      "Les voyageurs qui y sont allés disent que",
      "La beauté de ce lieu est incomparable.",
      "Les habitants vous accueilleront chaleureusement.",
      "Chaque coin de rue réserve une surprise.",
      "Voici les incontournables de cette destination :",
    ],
    closings: [
      "Ajoutez cette destination à votre liste.",
      "Le monde est bien plus beau qu'on ne l'imagine.",
      "Partez. Les souvenirs de toute une vie vous attendent.",
    ],
  },
  general: {
    hooks: [
      "Voici quelque chose que vous ne saviez pas.",
      "Ce fait va vous surprendre.",
      "La vérité est plus étonnante que la fiction.",
      "Découvrez ce que peu de gens savent vraiment.",
    ],
    bridgePhrases: [
      "La raison principale est",
      "Ce qui est fascinant, c'est que",
      "Les experts expliquent que",
      "En réalité,",
      "La vérité est que",
      "Voici ce que les données révèlent :",
      "Et pourtant, tout le monde l'ignore.",
    ],
    closings: [
      "Maintenant vous savez. Partagez cette info.",
      "Partagez avec ceux qui doivent le savoir.",
      "Le savoir, c'est le pouvoir.",
    ],
  },
};

/** Maps content category → Pixabay music mood ID from MUSIC_MOODS in creation-config.ts */
export const CATEGORY_TO_MUSIC_MOOD: Record<ContentCategory, string> = {
  culture:      "epic",
  business:     "corporate",
  motivation:   "action",
  sport:        "action",
  histoire:     "emotional",
  science:      "mysterious",
  technologie:  "corporate",
  santé:        "chill",
  voyage:       "emotional",
  general:      "epic",
};
