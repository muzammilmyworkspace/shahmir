/* All site copy and media in one place.
   Items marked PLACEHOLDER must be replaced with the studio's real details before launch. */

export const SITE = {
  name: 'The West Side Studios',
  short: 'westside',
  title: 'The West Side Studios | Digital Design & Development Studio',
  description: 'We design and build websites, brands and interactive experiences that help ambitious businesses grow.',
  email: 'hello@thewestsidestudios.com', // PLACEHOLDER
  booking: '/contact',
};

export const NAV = {
  left: [{ label: 'Projects', href: '/projects' }, { label: 'About us', href: '/about' }],
  right: [{ label: 'Blog', href: '/blog' }, { label: 'Contact us', href: '/contact' }],
  menuPrimary: [
    { label: 'Our Work', href: '/projects' },
    { label: 'Inside Westside', href: '/about' },
    { label: 'Get in touch', href: '/contact' },
    { label: 'Blog', href: '/blog' },
  ],
  menuSecondary: [
    { label: 'Our Work', href: '/projects' },
    { label: 'Privacy Policy', href: '/legal/privacy' },
    { label: 'Legal Notice', href: '/legal/notice' },
  ],
  menuImages: ['/media/sourcers-crane.webp', '/media/crumble-flavours.webp', '/media/crumbl-kitchen.webp'],
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
  { title: 'Websites & Platforms', tags: ['Marketing websites', 'Landing pages', 'Content CMS'], img: '/media/sourcers-hero.webp' },
  { title: 'Brand Identity', tags: ['Logo systems', 'Visual language', 'Guidelines'], img: '/media/crumble-footer.webp' },
  { title: 'Motion & 3D', tags: ['WebGL', 'Scroll stories', 'Product renders'], img: '/media/sourcers-ship.webp' },
  { title: 'eCommerce', tags: ['Shopify', 'Custom storefronts', 'Conversion'], img: '/media/crumble-flavours.webp' },
  { title: 'Web Applications', tags: ['Dashboards', 'Customer portals', 'Internal tools'], img: '/media/sourcers-crane.webp' },
  { title: 'Content & Campaigns', tags: ['Launch campaigns', 'Art direction', 'Social'], img: '/media/crumbl-story.webp' },
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

/* PLACEHOLDER testimonials: replace with real client quotes, names and photos. */
export const TESTIMONIALS = [
  { quote: '“The new site finally feels like us. Clients understand what we do before the first call, and the launch got people talking.”', author: 'Founder, Sourcing company', initials: 'TS', tone: '#0058f8' },
  { quote: '“From the first sketch to launch, the team moved fast and sweated every detail. Our customers keep telling us how good it feels to scroll.”', author: 'Marketing lead, Bakery brand', initials: 'CP', tone: '#010197' },
  { quote: '“Clear process, sharp design and real craft in the build. They turned a complicated story into something simple and beautiful.”', author: 'Product owner, Retail brand', initials: 'RB', tone: '#191919' },
];
export const CLIENT_LOGOS = [
  { src: '/media/logo-sourcers.png', alt: 'The Sourcers', w: 132, h: 34 },
  { src: '/media/logo-crumble.svg', alt: 'Crumble Pakistan', w: 118, h: 26 },
];

export type Project = {
  slug: string; client: string; title: string; short: string; category: string; year: string; services: string;
  bg: string; cover: string; video?: string; poster?: string; link?: string;
  overviewTitle: string; overview: string; whatTitle: string; what: string;
  gallery: (string | [string, string])[];
  testimonial?: { quote: string; author: string };
};

export const PROJECTS: Project[] = [
  {
    slug: 'the-sourcers', client: 'The Sourcers', title: 'China Sourcing Platform & Scroll-Story Website', short: 'Factory floor to front door, told as one continuous journey.',
    category: 'Sourcing platform', year: '2026', services: 'Brand, design and development', bg: '#0b0b10',
    cover: '/media/sourcers-hero.webp', video: '/media/case-sourcers.mp4', poster: '/media/case-sourcers-poster.jpg', link: 'https://www.thesourcers.co',
    overviewTitle: 'Making global sourcing feel close and certain.',
    overview: 'The Sourcers help ecommerce brands source products from vetted factories in China. We built a cinematic website that follows a single container from the factory crane to the customer’s door: a 3D globe, a port with a working crane, a truck that hands its container to a ship, and a jet over the clouds. Every scene explains one step of the service.',
    whatTitle: 'A website that ships the product with you.',
    what: 'Brand rollout, scroll-driven 3D storytelling, a lead-capture quote flow connected to email and WhatsApp, and a performance pass so the whole journey runs smoothly on phones.',
    gallery: [['/media/sourcers-crane.webp', '/media/sourcers-road.webp'], '/media/sourcers-ship.webp', ['/media/sourcers-footer.webp', '/media/sourcers-hero.webp']],
  },
  {
    slug: 'crumble-pakistan', client: 'Crumble Pakistan', title: 'Gourmet Cookie Brand & Story-Driven Store', short: 'From a GIKI dorm room to cities across Pakistan.',
    category: 'Food & beverage', year: '2026', services: 'Design, motion and development', bg: '#010197',
    cover: '/media/crumble-hero.webp', video: '/media/case-crumble.mp4', poster: '/media/case-crumble-poster.jpg',
    overviewTitle: 'Warm, real and impossible to scroll past.',
    overview: 'Crumble started as a countertop display in a university dorm. We turned that story into a road trip: the Crumble car drives from GIKI to every branch past real Pakistani landmarks, then a chef bakes, breaks and boxes real cookies in an animated kitchen.',
    whatTitle: 'A menu you can almost taste.',
    what: 'Cookie photography cut-outs, an animated kitchen, a horizontal flavour reel that recolours the room for every cookie, corporate gifting and events pages, all in the signature blue.',
    gallery: [['/media/crumble-trip.webp', '/media/crumble-kitchen.webp'], '/media/crumble-melt.webp', ['/media/crumble-flavours.webp', '/media/crumble-bake.webp']],
  },
  {
    slug: 'crumbl-concept', client: 'Crumbl (concept)', title: 'Cookie Journey Concept Website', short: 'An illustrated, fully animated cookie road trip.',
    category: 'Concept', year: '2026', services: 'Illustration, motion and development', bg: '#ffb9cd',
    cover: '/media/crumbl-kitchen.webp', video: '/media/case-crumbl.mp4', poster: '/media/crumbl-story.webp',
    overviewTitle: 'A playful journey from dream to box.',
    overview: 'A self-initiated concept exploring how far scroll storytelling can go with hand-drawn illustration: a convertible road trip, a kitchen where every ingredient flies into the bowl, and a pink box that closes on the way out. Not affiliated with Crumbl.',
    whatTitle: 'Illustration that moves with you.',
    what: 'Original line-art illustration, a 3D cookie that breaks apart, procedural cookie painting and a scroll-scrubbed kitchen with six stations.',
    gallery: [['/media/crumbl-story.webp', '/media/crumbl-menu.webp'], '/media/crumbl-footer.webp'],
  },
];
export const FEATURED = ['the-sourcers', 'crumble-pakistan'];

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
    slug: 'scrubbing-video-with-scroll', title: 'How we make a film play with your scroll', excerpt: 'The technique behind our hero: encoding, seeking and springs, and why every frame needs to be a keyframe.',
    date: 'September 28, 2026', read: '4 min read', cats: ['technology'], img: '/media/film-glow.webp', bg: '#f43c00', author: 'Westside Team',
    body: [
      'A scroll-scrubbed film turns the page into a timeline: as you move down, the video moves forward, and when you move back, it rewinds. Done well, it feels like directing a camera with your thumb.',
      'The secret is in the encoding. Most videos keep a full picture only every few seconds and store the frames in between as changes. Seeking backwards then forces the browser to rebuild many frames at once, and the image stutters. We encode with a keyframe every few frames so any moment can be shown instantly.',
      'On the page we map the section’s scroll progress to the video’s time, and we queue a new position while the browser is still seeking, so it never falls behind your hand. The result is a film that feels physical.',
    ],
  },
  {
    slug: 'designing-for-pakistani-brands', title: 'Designing real stories for local brands', excerpt: 'What we learned turning a dorm-room bakery into a nationwide road trip.',
    date: 'September 20, 2026', read: '5 min read', cats: ['community', 'product'], img: '/media/crumble-trip.webp', bg: '#010197', author: 'Westside Team',
    body: [
      'Every brand has a story worth telling, but most websites hide it behind a product grid. When Crumble shared how it started, as a countertop display in a university dorm, we knew the story was the product.',
      'We mapped every branch onto a journey, picked one landmark per city, and let the brand’s delivery car drive the narrative. Real photography of the cookies keeps it honest; illustration carries the movement.',
    ],
  },
  {
    slug: 'building-a-3d-sourcing-journey', title: 'Building a 3D journey from factory to front door', excerpt: 'Cranes, trucks, ships and a jet: how one container became the spine of a website.',
    date: 'September 12, 2026', read: '6 min read', cats: ['technology', 'product'], img: '/media/sourcers-ship.webp', bg: '#0b0b10', author: 'Westside Team',
    body: [
      'For The Sourcers we followed a single orange container through the whole supply chain. A crane lifts it, a truck carries it, and at the edge of the port it lands exactly on its column on the ship.',
      'Getting that hand-off pixel-perfect meant matching the camera height of a real-time 3D ocean to a flat road above it, then freezing the ship’s idle sway at exactly the right moment.',
    ],
  },
  {
    slug: 'motion-with-purpose', title: 'Motion with purpose', excerpt: 'Why every animation on a site we build has to explain something.',
    date: 'September 5, 2026', read: '3 min read', cats: ['community'], img: '/media/film-front.webp', bg: '#e9dfc4', author: 'Westside Team',
    body: [
      'Animation is easy to add and hard to justify. Our rule is simple: if a movement does not help someone understand, find or feel something, it does not ship.',
      'That is why our transitions grow pages from where you were, why text rises line by line in the order you read it, and why most elements stay perfectly still.',
    ],
  },
];
export const BLOG_FILTERS = [['all', 'All posts'], ['community', 'Community'], ['product', 'Product'], ['technology', 'Technology']];
