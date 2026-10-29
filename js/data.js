/*
  HypeNight content. Edit this file to add or change events — the page builds
  the hero, the calendar, the past wall and the index from it.

  An event is "upcoming" until its start time passes, then it moves to the
  past list on its own. The soonest upcoming event becomes the hero.
*/
window.HYPE = {
  // WhatsApp number in international format, digits only. Every inquiry
  // button opens a chat with this number. Taken from the RSVP line on the
  // Diwali Drunch poster — confirm with the client before launch.
  whatsapp: "916289579943",
  phones: ["+91 62895 79943", "+91 62895 79589"],
  instagram: "https://www.instagram.com/hype.night.ccu/",
  handle: "@hype.night.ccu",

  events: [
    {
      id: "diwali-drunch",
      title: "The Big Fat Diwali Drunch",
      short: "Diwali Drunch",
      start: "2026-11-07T16:00:00+05:30",
      doors: "4PM onwards",
      venue: "Venue drops soon",
      venueNote: "CCU's most hyped venue",
      lineup: "Lineup to be announced",
      poster: "assets/img/diwali-drunch.jpg",
      partners: ["Inferno", "Cult Affairs", "Status", "Noctra", "Ragerz"],
      pitch: "Kolkata, this Diwali you need to be on the list. Fits, fireworks and the right crowd, from four till late.",
      status: "Pre-guestlist open",
      instagram: "https://www.instagram.com/inferno.india._/p/De_XmzxSJVJ/"
    },
    {
      id: "talk-of-the-town",
      title: "Talk of the Town",
      start: "2026-10-24T16:00:00+05:30",
      doors: "4PM onwards",
      venue: "Miss Ginko",
      lineup: "RJ x DIVY, Vivek",
      poster: "assets/img/totb-rjdivy.jpg",
      partners: ["Inferno", "Cult Affairs", "Status", "Noctra", "Ragerz"],
      pitch: "Kolkata's most hyped duo took over Miss Ginko, with Vivek on support.",
      instagram: "https://www.instagram.com/inferno.india._/p/Deg-bLpSct9/"
    },
    {
      id: "uk-soiree",
      title: "The UK Soirée",
      start: "2026-10-11T16:00:00+05:30",
      doors: "4PM onwards",
      venue: "Miss Ginko",
      lineup: "Jayzze (Mumbai) ft. Vivek",
      poster: "assets/img/uk-soiree.jpg",
      partners: ["Inferno", "Cult Affairs", "Status", "Ragerz"],
      pitch: "UK Punjabi beats, non-stop. Jayzze flew in from Mumbai for his Kolkata debut.",
      instagram: "https://www.instagram.com/inferno.india._/p/DeMaAqnSA6r/"
    },
    {
      id: "festive-drunch",
      title: "The Big Fat Festive Drunch",
      start: "2026-10-03T16:00:00+05:30",
      doors: "4PM onwards",
      venue: "Corridor, Park Street",
      lineup: "Vivek & Kash, DJ Sue",
      poster: "assets/img/festive-viperkash.jpg",
      partners: ["Trivia", "Inferno", "Status", "Cult Affairs", "Ragerz"],
      pitch: "Festive season opened at Corridor Bar & Kitchen, with DJ Sue as the surprise act.",
      instagram: "https://www.instagram.com/inferno.india._/p/Dd1Kgz6yIFp/"
    }
  ],

  // Posters dealt onto the past-nights wall, in reading order.
  posters: [
    { event: "talk-of-the-town", src: "assets/img/totb-rjdivy.jpg", name: "RJ x DIVY" },
    { event: "uk-soiree", src: "assets/img/uk-soiree.jpg", name: "Jayzze ft. Vivek" },
    { event: "festive-drunch", src: "assets/img/festive-dj.jpg", name: "DJ Sue" },
    { event: "talk-of-the-town", src: "assets/img/totb-vivek.jpg", name: "Vivek" },
    { event: "talk-of-the-town", src: "assets/img/guestlist-phone.jpg", name: "Are you in love?" },
    { event: "festive-drunch", src: "assets/img/festive-viperkash.jpg", name: "Vivek & Kash" }
  ],

  // Reel covers and BTS frames for the scanner strip.
  moments: [
    { src: "assets/img/reel-crowd.jpg", caption: "Front row at the booth", meta: "DJ Jack, 1 Oct" },
    { src: "assets/img/reel-missginko.jpg", caption: "The invite went out on cards", meta: "Miss Ginko, 24 Oct" },
    { src: "assets/img/totb-1daytogo.jpg", caption: "One day to go", meta: "Talk of the Town" },
    { src: "assets/img/reel-library.jpg", caption: "Fit check before doors", meta: "Reel, 1 Oct" },
    { src: "assets/img/reel-chevron.jpg", caption: "Inferno teaser drop", meta: "Reel, 22 Oct" }
  ],

  // Highlight covers from Instagram, used as venue badges.
  venues: [
    { name: "Miss Ginko", src: "assets/img/hl-missginko.jpg" },
    { name: "Corridor", src: "assets/img/hl-corridor.jpg" },
    { name: "Rumors", src: "assets/img/hl-rumors.jpg" },
    { name: "Lucky Tiger", src: "assets/img/hl-luckytiger.jpg" },
    { name: "Realityz", src: "assets/img/hl-realityz.jpg" }
  ]
};
