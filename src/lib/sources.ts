export type Topic =
  | "tech"
  | "news"
  | "spain"
  | "business"
  | "science"
  | "gaming"
  | "culture"
  | "politics";

export type Source = {
  slug: string;
  name: string;
  feedUrl: string;
  topics: Topic[];
  /** Show on home (`/`) curated set */
  home: boolean;
};

export const TOPICS: { slug: Topic; label: string }[] = [
  { slug: "tech", label: "Tech" },
  { slug: "news", label: "News" },
  { slug: "spain", label: "Spain" },
  { slug: "business", label: "Business" },
  { slug: "science", label: "Science" },
  { slug: "gaming", label: "Gaming" },
  { slug: "culture", label: "Culture" },
  { slug: "politics", label: "Politics" },
];

/** Curated RSS sources for the personal wire. */
export const SOURCES: Source[] = [
  // Tech / home
  {
    slug: "hn",
    name: "Hacker News",
    feedUrl: "https://hnrss.org/frontpage",
    topics: ["tech"],
    home: true,
  },
  {
    slug: "verge",
    name: "The Verge",
    feedUrl: "https://www.theverge.com/rss/index.xml",
    topics: ["tech"],
    home: true,
  },
  {
    slug: "arstechnica",
    name: "ArsTechnica",
    feedUrl: "https://feeds.arstechnica.com/arstechnica/index",
    topics: ["tech", "science"],
    home: true,
  },
  {
    slug: "register",
    name: "The Register",
    feedUrl: "https://www.theregister.com/headlines.atom",
    topics: ["tech"],
    home: true,
  },
  {
    slug: "phoronix",
    name: "Phoronix",
    feedUrl: "https://www.phoronix.com/rss.php",
    topics: ["tech"],
    home: true,
  },
  {
    slug: "wired",
    name: "Wired",
    feedUrl: "https://www.wired.com/feed/rss",
    topics: ["tech"],
    home: true,
  },
  {
    slug: "engadget",
    name: "Engadget",
    feedUrl: "https://www.engadget.com/rss.xml",
    topics: ["tech"],
    home: true,
  },
  {
    slug: "slashdot",
    name: "Slashdot",
    feedUrl: "https://rss.slashdot.org/Slashdot/slashdotMain",
    topics: ["tech"],
    home: true,
  },
  {
    slug: "appleinsider",
    name: "AppleInsider",
    feedUrl: "https://appleinsider.com/rss/news/",
    topics: ["tech"],
    home: true,
  },
  {
    slug: "daringfireball",
    name: "Daring Fireball",
    feedUrl: "https://daringfireball.net/feeds/main",
    topics: ["tech"],
    home: true,
  },
  {
    slug: "lwn",
    name: "Linux Weekly News",
    feedUrl: "https://lwn.net/headlines/rss",
    topics: ["tech"],
    home: true,
  },
  {
    slug: "bleepingcomputer",
    name: "Bleeping Computer",
    feedUrl: "https://www.bleepingcomputer.com/feed/",
    topics: ["tech"],
    home: true,
  },
  {
    slug: "hackaday",
    name: "Hackaday",
    feedUrl: "https://hackaday.com/blog/feed/",
    topics: ["tech"],
    home: true,
  },
  {
    slug: "cloudflare",
    name: "Cloudflare Blog",
    feedUrl: "https://blog.cloudflare.com/rss/",
    topics: ["tech"],
    home: true,
  },
  // News
  {
    slug: "bbc",
    name: "BBC",
    feedUrl: "https://feeds.bbci.co.uk/news/rss.xml",
    topics: ["news"],
    home: false,
  },
  {
    slug: "npr",
    name: "NPR",
    feedUrl: "https://feeds.npr.org/1001/rss.xml",
    topics: ["news"],
    home: false,
  },
  {
    slug: "guardian",
    name: "The Guardian",
    feedUrl: "https://www.theguardian.com/world/rss",
    topics: ["news", "politics"],
    home: false,
  },
  {
    slug: "aljazeera",
    name: "Al Jazeera",
    feedUrl: "https://www.aljazeera.com/xml/rss/all.xml",
    topics: ["news"],
    home: false,
  },
  {
    slug: "reuters",
    name: "Reuters",
    feedUrl: "https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best",
    topics: ["news"],
    home: false,
  },
  // Business
  {
    slug: "cnbc",
    name: "CNBC",
    feedUrl: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114",
    topics: ["business"],
    home: false,
  },
  {
    slug: "fortune",
    name: "Fortune",
    feedUrl: "https://fortune.com/feed/",
    topics: ["business"],
    home: false,
  },
  {
    slug: "wsj",
    name: "The Wall Street Journal",
    feedUrl: "https://feeds.a.dj.com/rss/RSSWorldNews.xml",
    topics: ["business", "news"],
    home: false,
  },
  // Science
  {
    slug: "nature",
    name: "Nature",
    feedUrl: "https://www.nature.com/nature.rss",
    topics: ["science"],
    home: false,
  },
  {
    slug: "quantamag",
    name: "Quanta Magazine",
    feedUrl: "https://www.quantamagazine.org/feed/",
    topics: ["science"],
    home: false,
  },
  {
    slug: "newscientist",
    name: "New Scientist",
    feedUrl: "https://www.newscientist.com/feed/home/",
    topics: ["science"],
    home: false,
  },
  {
    slug: "sciencedaily",
    name: "ScienceDaily",
    feedUrl: "https://www.sciencedaily.com/rss/all.xml",
    topics: ["science"],
    home: false,
  },
  // Gaming
  {
    slug: "polygon",
    name: "Polygon",
    feedUrl: "https://www.polygon.com/rss/index.xml",
    topics: ["gaming"],
    home: false,
  },
  {
    slug: "pcgamer",
    name: "PC Gamer",
    feedUrl: "https://www.pcgamer.com/rss/",
    topics: ["gaming"],
    home: false,
  },
  {
    slug: "gamespot",
    name: "GameSpot",
    feedUrl: "https://www.gamespot.com/feeds/news/",
    topics: ["gaming"],
    home: false,
  },
  // Culture
  {
    slug: "avclub",
    name: "The A.V. Club",
    feedUrl: "https://www.avclub.com/rss",
    topics: ["culture"],
    home: false,
  },
  {
    slug: "variety",
    name: "Variety",
    feedUrl: "https://variety.com/feed/",
    topics: ["culture"],
    home: false,
  },
  {
    slug: "newyorker",
    name: "The New Yorker",
    feedUrl: "https://www.newyorker.com/feed/news",
    topics: ["culture"],
    home: false,
  },
  // Politics
  {
    slug: "politico",
    name: "Politico",
    feedUrl: "https://rss.politico.com/politics-news.xml",
    topics: ["politics"],
    home: false,
  },
  {
    slug: "thehill",
    name: "The Hill",
    feedUrl: "https://thehill.com/feed/",
    topics: ["politics"],
    home: false,
  },
  {
    slug: "vox",
    name: "Vox",
    feedUrl: "https://www.vox.com/rss/index.xml",
    topics: ["politics", "news"],
    home: false,
  },
  // Spain
  {
    slug: "elpais",
    name: "El País",
    feedUrl: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada",
    topics: ["spain", "news"],
    home: false,
  },
  {
    slug: "elpais-espana",
    name: "El País España",
    feedUrl:
      "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/espana/portada",
    topics: ["spain", "politics"],
    home: false,
  },
  {
    slug: "eldiario",
    name: "elDiario.es",
    feedUrl: "https://www.eldiario.es/rss/",
    topics: ["spain", "news"],
    home: false,
  },
  {
    slug: "lavanguardia",
    name: "La Vanguardia",
    feedUrl: "https://www.lavanguardia.com/rss/home.xml",
    topics: ["spain", "news"],
    home: false,
  },
  {
    slug: "elmundo",
    name: "El Mundo",
    feedUrl: "https://e00-elmundo.uecdn.es/elmundo/rss/portada.xml",
    topics: ["spain", "news"],
    home: false,
  },
  {
    slug: "elespanol",
    name: "El Español",
    feedUrl: "https://www.elespanol.com/rss/",
    topics: ["spain", "news"],
    home: false,
  },
  {
    slug: "20minutos",
    name: "20 minutos",
    feedUrl: "https://www.20minutos.es/rss/",
    topics: ["spain", "news"],
    home: false,
  },
  {
    slug: "europapress",
    name: "Europa Press",
    feedUrl: "https://www.europapress.es/rss/rss.aspx",
    topics: ["spain", "news"],
    home: false,
  },
  {
    slug: "xataka",
    name: "Xataka",
    feedUrl: "https://www.xataka.com/index.xml",
    topics: ["spain", "tech"],
    home: false,
  },
  {
    slug: "genbeta",
    name: "Genbeta",
    feedUrl: "https://www.genbeta.com/index.xml",
    topics: ["spain", "tech"],
    home: false,
  },
];

export function getSource(slug: string): Source | undefined {
  return SOURCES.find((s) => s.slug === slug);
}

export function sourcesForTopic(topic: Topic | "all" | "home"): Source[] {
  if (topic === "home") return SOURCES.filter((s) => s.home);
  if (topic === "all") return SOURCES;
  return SOURCES.filter((s) => s.topics.includes(topic));
}
