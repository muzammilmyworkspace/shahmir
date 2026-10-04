/* All site copy and media in one place.
   Items marked PLACEHOLDER must be replaced with the studio's real details before launch. */

export const SITE = {
  name: 'The West Side Studios',
  short: 'westside',
  title: 'The West Side Studios | Digital Design & Development Studio',
  description: 'We design and build websites, brands and interactive experiences that help ambitious businesses grow.',
  email: 'hello@thewestsidestudios.com', // PLACEHOLDER
  whatsapp: '923000000000', // PLACEHOLDER: country code + number, digits only
  booking: '/contact',
};

// PLACEHOLDER profile links: replace with the real accounts
export const SOCIALS = [
  { label: 'Instagram', href: 'https://instagram.com/' },
  { label: 'LinkedIn', href: 'https://linkedin.com/' },
  { label: 'Facebook', href: 'https://facebook.com/' },
  { label: 'TikTok', href: 'https://tiktok.com/' },
  { label: 'YouTube', href: 'https://youtube.com/' },
];

export const NAV = {
  left: [{ label: 'Story', href: '/#story' }, { label: 'Founder', href: '/#founder' }],
  right: [{ label: 'Principles', href: '/#philosophy' }, { label: 'Contact', href: '/contact' }],
  menuPrimary: [
    { label: 'The Manifesto', href: '/#story' },
    { label: 'The Founder', href: '/#founder' },
    { label: 'How I work', href: '/#philosophy' },
    { label: 'Work with me', href: '/#contact' },
  ],
  menuSecondary: [
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy Policy', href: '/legal/privacy' },
    { label: 'Legal Notice', href: '/legal/notice' },
  ],
  menuImages: ['/founder/menu-1.webp', '/founder/menu-2.webp', '/founder/menu-3.webp'],
};

export const HERO = {
  line1: 'Websites, Brands & Stories\nDesigned for',
  line2: 'Ambitious Businesses.',
  aside: 'We partner with bold brands to shape how they look, move and grow online.',
  cta: 'Book a call',
  statement: 'We design for what comes next, where story, craft and technology move as one.',
};

export const STATEMENT =
  'We don’t just make websites. We craft digital experiences, brands and products that people remember and businesses grow with.';

export const FOCUS = [
  { title: 'Websites & Platforms', tags: ['Marketing websites', 'Landing pages', 'Content CMS'], img: '/media/studio-wide.webp' },
  { title: 'Brand Identity', tags: ['Logo systems', 'Visual language', 'Guidelines'], img: '/media/studio-face.webp' },
  { title: 'Motion & 3D', tags: ['WebGL', 'Scroll stories', 'Product renders'], img: '/media/studio-circle.webp' },
  { title: 'eCommerce', tags: ['Shopify', 'Custom storefronts', 'Conversion'], img: '/media/studio-suit.webp' },
  { title: 'Web Applications', tags: ['Dashboards', 'Customer portals', 'Internal tools'], img: '/media/studio-floor.webp' },
  { title: 'Content & Campaigns', tags: ['Launch campaigns', 'Art direction', 'Social'], img: '/media/studio-step.webp' },
];

/* Globe + footer offices. The LAST city ends front-and-centre on the globe. PLACEHOLDER cities. */
export const OFFICES = [
  { id: 'london', city: 'London', country: 'United Kingdom', tz: 'Europe/London', lat: 51.5074, lon: -0.1278, dx: 8, dy: -30 },
  { id: 'dubai', city: 'Dubai', country: 'UAE', tz: 'Asia/Dubai', lat: 25.2048, lon: 55.2708, dx: 24, dy: 10 },
  { id: 'lahore', city: 'Lahore', country: 'Pakistan', tz: 'Asia/Karachi', lat: 31.5204, lon: 74.3587, dx: 0, dy: 0 },
];
export const FOOTER_OFFICES = [
  { city: 'Lahore, Pakistan', lines: ['Studio HQ'] }, // PLACEHOLDER
  { city: 'Dubai, UAE', lines: ['By appointment'] }, // PLACEHOLDER
];

/* PLACEHOLDER testimonials: replace with real client quotes, names and photos before launch. */
export const TESTIMONIALS = [
  { quote: '“Client quote goes here: what changed for their business after working with the studio.”', author: 'Client name, Company', initials: 'WS', tone: '#f43c00' },
  { quote: '“Second client quote: a sentence about the process, the team and the result.”', author: 'Client name, Company', initials: 'WS', tone: '#191919' },
  { quote: '“Third client quote: one line on the launch and how people responded.”', author: 'Client name, Company', initials: 'WS', tone: '#7a0a0a' },
];
/* Add client logos here (src, alt, w, h). The grid stays hidden while this is empty. */
export const CLIENT_LOGOS: { src: string; alt: string; w: number; h: number }[] = [];

export type Project = {
  slug: string; client: string; title: string; short: string; category: string; year: string; services: string;
  bg: string; cover: string; video?: string; poster?: string; link?: string;
  overviewTitle: string; overview: string; whatTitle: string; what: string;
  gallery: (string | [string, string])[];
  testimonial?: { quote: string; author: string };
};

export const PROJECTS: Project[] = [
  {
    slug: 'the-red-room', client: 'Westside Studios', title: 'The Red Room: Brand Portrait & Scroll Film', short: 'A single portrait turned into a cinematic opening scene.',
    category: 'Brand campaign', year: '2026', services: 'Art direction, motion and development', bg: '#2e0306',
    cover: '/media/studio-scene.webp', video: '/media/work-hero.mp4', poster: '/media/work-hero-poster.jpg',
    overviewTitle: 'One photograph, directed like a film.',
    overview: 'We took a studio portrait and rebuilt it as a living scene: the subject separated from the set, the red disc and floor re-lit in 4K, and a scroll-driven camera that turns him toward you before pushing into the light.',
    whatTitle: 'A first impression that moves with you.',
    what: 'Subject cut-out, procedural set extension, scroll choreography and a seamless hand-off into the brand colour.',
    gallery: [['/media/studio-face.webp', '/media/studio-suit.webp'], '/media/studio-wide.webp', ['/media/studio-circle.webp', '/media/studio-step.webp']],
  },
  {
    slug: 'westside-website', client: 'thewestsidestudios.com', title: 'Our Own Website, Built Like a Story', short: 'Spring transitions, a 3D globe and a glass monogram.',
    category: 'Website', year: '2026', services: 'Design and development', bg: '#000000',
    cover: '/media/studio-wide.webp', video: '/media/work-site.mp4', poster: '/media/work-site-poster.jpg',
    overviewTitle: 'Every interaction tuned by hand.',
    overview: 'Our studio site is our showreel: a liquid-glass header, a rotating glass monogram, a wireframe globe with live studio clocks, a stacked case reel and page transitions that grow each page out of the last.',
    whatTitle: 'Craft you can feel when you scroll.',
    what: 'Astro, GSAP, Lenis, Barba and three.js, with springs and easing tuned frame by frame and a performance pass for phones.',
    gallery: [['/media/studio-circle.webp', '/media/studio-floor.webp'], '/media/studio-scene.webp'],
  },
];
export const FEATURED = ['the-red-room', 'westside-website'];

export const ABOUT = {
  heroLead: 'We design and build websites, brands and interactive stories engineered to perform. Clear strategy, sharp design and careful code, working together from day one.',
  heroAside: 'We craft premium websites, eCommerce and web apps, paired with the identity and motion that set ambitious brands apart.',
  intro: 'At Westside, we take craft seriously. Every project is designed and built with performance, accessibility and longevity in mind. We sweat the details others skip, so your site not only looks remarkable but keeps working for your business long after launch.',
  philosophy: 'We believe great digital work should feel effortless. That is why we focus on clarity, motion with purpose and fast, robust engineering. Every project balances story, design and technology to create lasting value for the people who use it.',
  stats: [['3+', 'Launches in 2026'], ['100%', 'Built in-house'], ['24h', 'Response time']], // PLACEHOLDER figures
};

export type Post = { slug: string; title: string; excerpt: string; date: string; read: string; cats: string[]; img: string; bg: string; author: string; body: string[] };
export const POSTS: Post[] = [
  {
    slug: 'directing-a-scroll-film', title: 'Directing a film that plays with your scroll', excerpt: 'How we turned one portrait into an opening scene: cut-out, set extension and a camera move tied to scroll.',
    date: 'October 2, 2026', read: '4 min read', cats: ['technology'], img: '/media/studio-scene.webp', bg: '#2e0306', author: 'Westside Team',
    body: [
      'A scroll-driven opening turns the page into a timeline: as you move down, the scene moves forward, and when you move back, it rewinds. Done well, it feels like directing a camera with your thumb.',
      'We separated the subject from the set, rebuilt the red disc and floor at 4K so the camera can push in without losing detail, and mapped every movement to the section’s scroll progress: a slow turn toward you first, then a push past him into the light.',
      'The last frames hand over to the brand colour, so the story flows straight into the next section without a cut.',
    ],
  },
  {
    slug: 'motion-with-purpose', title: 'Motion with purpose', excerpt: 'Why every animation on a site we build has to explain something.',
    date: 'September 26, 2026', read: '3 min read', cats: ['community'], img: '/media/studio-circle.webp', bg: '#7a0a0a', author: 'Westside Team',
    body: [
      'Animation is easy to add and hard to justify. Our rule is simple: if a movement does not help someone understand, find or feel something, it does not ship.',
      'That is why our transitions grow pages from where you were, why text rises line by line in the order you read it, and why most elements stay perfectly still.',
    ],
  },
  {
    slug: 'building-a-studio-globe', title: 'Building a globe with live studio clocks', excerpt: 'A wireframe sphere, three cities and the time where our team is right now.',
    date: 'September 18, 2026', read: '3 min read', cats: ['technology', 'product'], img: '/media/studio-floor.webp', bg: '#1c0c0c', author: 'Westside Team',
    body: [
      'The globe on our homepage is drawn from simple lines of latitude and longitude, faded by how much each line faces you, so it reads as a sphere without any texture.',
      'As you scroll it turns from the first city to the last and settles with our home studio in the centre, each pin showing the local time there.',
    ],
  },
];
export const BLOG_FILTERS = [['all', 'All posts'], ['community', 'Community'], ['product', 'Product'], ['technology', 'Technology']];
