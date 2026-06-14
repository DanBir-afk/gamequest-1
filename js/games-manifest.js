/**

 * Single source of truth for game/quest card metadata.

 * Game list: js/games-catalog.js — edit there to add titles.

 * Quiz packs: js/quests/data/<id>.js

 */

window.gamesManifest = {

    version: 1,

    pageSize: 24,



    games: window.gamesCatalog || [],



    /** Extra games for profile favorites (not on quest page) */

    profileOnly: [

        { id: 'sea-of-thieves', gameName: 'Sea of Thieves', emoji: '🏴‍☠️', favDesc: 'Pirate adventures' },

        { id: 'dead-by-daylight', gameName: 'Dead by Daylight', emoji: '🔪', favDesc: 'Asymmetric horror' },

        { id: 'garrys-mod', gameName: "Garry's Mod", emoji: '🔧', favDesc: 'Physics sandbox' },

        { id: 'satisfactory', gameName: 'Satisfactory', emoji: '🏭', favDesc: 'Factory building' },

        { id: 'bloons-td-6', gameName: 'Bloons TD 6', emoji: '🎈', favDesc: 'Tower defense' },

    ],



    /** Old quest ids → canonical id (localStorage / ratings migration) */

    legacyIds: {

        'photo-hunt': 'witcher3',

        'city-secrets': 'cyberpunk',

        'review-marathon': 'skyrim',

    },

};

