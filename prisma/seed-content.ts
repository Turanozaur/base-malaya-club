import { EventStatus, ObjectType, PostStatus, PostType } from "../src/generated/prisma/client";

/** Static pages — sourced from the KL Tower 2026 participant presentation. */
export const SEED_PAGES = [
  {
    slug: "history",
    title: "Club History",
    body: `BASE Malaya is a specialist organization dedicated to hosting professional BASE jumping events in Malaysia.

The club is led by two highly experienced figures in extreme sports and military special operations:

• Capt (Rtd) Mohd Noorizan bin Mohd Yunus — Technical Director. Former Special Forces Officer (Regiment Gerak Khas), Parachute Branch, Sungai Udang Camp, Melaka. Over 800 BASE jumps and 3,500 aircraft skydiving jumps. Recognised by the Civil Aviation Department of Malaysia (DCA) as an Instructor Examiner.

• Mohd Idros bin Mohd Yusop AMN, AMP, PJN — Program Director. Former Special Forces PASKAL CPO, Royal Malaysian Navy. Over 500 BASE jumps and 2,500 aircraft skydives. Certified BASE Jump Instructor for Malaysia and DCA Instructor Examiner.

Their combined expertise in high-risk operations, safety management, and event coordination has positioned BASE Malaya as a trusted organizer for major BASE jumping activities across the country.

Previous organized events (2014–2026)

• Menara Tun Mustapha, Kota Kinabalu — Jump 4 World Peace (12–14 Sep 2014)
• Ministry of Women, Family and Community Development Building, Putrajaya (4 Oct 2014) — Malaysia Book of Records: oldest and youngest BASE jumper in Malaysia
• The Shore Sky Tower, Melaka (19–21 Mar 2019)
• Menara Taming Sari, Melaka (23–24 Mar 2019)
• Hatten City Hotel, Melaka — Basejump Extreme, Straits of Malacca (4–6 Oct 2019)
• Menara Kuantan 188, Pahang — multiple events including K188 BASEJUMP XTREME (Feb 2023), Kuantan 188 Challenge (Feb & Jul 2025), and a Guinness World Record 24-hour jump with a single parachute by Justin Beitler (USA)
• Bloomsvale Shopping Gallery, Kuala Lumpur (21–23 Oct 2025)
• Tamu Hotel & Suites, Kuala Lumpur (24–25 Oct 2025 and 30 Jan – 2 Feb 2026)
• Tower of Majlis Bandaraya Kuala Terengganu — Terengganu Basejump Challenge (6–8 Aug 2026, upcoming)

Malaysian jumpers from the organizing team have performed legal jumps from landmarks across the country, including Kuala Lumpur Tower, Petronas Twin Towers, Komtar Tower Penang, Alor Setar Tower, Gua Damai Batu Caves, Tun Mustapha Tower Kota Kinabalu, and many others.`,
  },
  {
    slug: "about",
    title: "About BASE Malaya Club",
    body: `BASE Malaya Club is the community platform for verified BASE jumpers who participate in legal, organized events in Malaysia.

BASE Malaya Venture organizes professional BASE jumping events with full permits, safety crews, and coordination with Malaysian authorities. We are not a school — membership is for experienced jumpers who can provide a voucher from a recognised club member.

What we offer:
• Organised legal boogies with permits and professional safety operations
• A verified member directory
• Event registration and wall of fame
• Education on safety and local regulations
• A gallery of Malaysian BASE history

Upcoming flagship event: Kuala Lumpur Tower International BASEjump Challenge 2026 (2–4 October 2026), organized by BASE Malaya Venture with LSH Service Master Sdn Bhd as co-organizer.`,
  },
] as const;

export const SEED_OBJECTS = [
  {
    slug: "kl-tower",
    name: "Kuala Lumpur Tower",
    type: ObjectType.BUILDING,
    description: `At 421 metres, Kuala Lumpur Tower is one of the tallest communication towers in the world and Malaysia's most iconic urban BASE exit.

The tower offers exceptional free-fall duration for professional jumpers, with an impact zone of approximately 300 metres below the exit point. Landing areas for organized events include the water tank and Tower Terrace, with parachute packing at the Hemisfera Luxury Sky Deck.

BASE Malaya has a long history of legal jumps from this landmark, and it remains the centrepiece of the club's international events programme.`,
    heightMeters: 421,
    city: "Kuala Lumpur",
    latitude: 3.1528,
    longitude: 101.7039,
  },
] as const;

export const KL_TOWER_EVENT_2026 = {
  slug: "kl-tower-international-basejump-challenge-2026",
  title: "Kuala Lumpur Tower International BASEjump Challenge 2026",
  description: `The premier BASE jumping event at Malaysia's most iconic tower.

2–4 October 2026 · Kuala Lumpur Tower · 421 m

Organized by BASE Malaya Venture. Co-organizer: LSH Service Master Sdn Bhd.

As one of the tallest communication towers in the world, KL Tower provides a world-class exit for elite BASE athletes. The event integrates professional safety operations — dispatchers, drop zone safety officers, medical standby, wind monitoring, and rigging inspection — with full regulatory compliance including permits from PDRM, DBKL, MOTAC (Visit Malaysia 2026), and SYABAS for the water tank landing area.

Landing areas: Water Tank and Tower Terrace. Packing area: Hemisfera Luxury Sky Deck.

Registration is open to approved club members.`,
  status: EventStatus.PUBLISHED,
  startDate: new Date("2026-10-02T08:00:00+08:00"),
  endDate: new Date("2026-10-04T20:00:00+08:00"),
  objectSlug: "kl-tower" as const,
  requiresPayment: false,
  visiblePublic: true,
  visibleMembers: true,
  schedulePublic: false,
  summaryPublic: true,
  wallOfFamePublic: false,
  schedule: `Official event days: 2–4 October 2026.

Daily operations (subject to weather):
• Morning safety briefing — mandatory for all jumpers and crew
• Equipment inspection by Master Rigger
• Jump operations with dispatcher clearance and DZSO coordination
• Wind hold if speed exceeds 12 knots

Detailed daily timetable will be published closer to the event.`,
};

export const SEED_POSTS = [
  {
    type: PostType.NEWS,
    slug: "kl-tower-2026-international-basejump-challenge",
    title: "KL Tower International BASEjump Challenge 2026 — 2–4 October",
    excerpt:
      "Malaysia's flagship BASE event returns to Kuala Lumpur Tower. Organized by BASE Malaya Venture, 2–4 October 2026.",
    body: `Registration and event details for the Kuala Lumpur Tower International BASEjump Challenge 2026 are now live on the club website.

Dates: 2–4 October 2026
Location: Kuala Lumpur Tower (421 m)
Organizer: BASE Malaya Venture
Co-organizer: LSH Service Master Sdn Bhd

This is a fully permitted, professionally managed event with dedicated landing areas at the Water Tank and Tower Terrace, medical standby, and full safety crew.

Approved club members can register on the event page. If you are not yet a member, apply via the registration form — all applications are reviewed by the organizing committee.

See you at the tower.`,
  },
  {
    type: PostType.EDUCATION,
    slug: "what-is-base-jumping",
    title: "What is BASE Jumping?",
    excerpt:
      "Building, Antenna, Span, Earth — the four categories of fixed-object jumps and what makes BASE distinct from skydiving.",
    body: `BASE jumping is an extreme sport where athletes jump from fixed objects and use a parachute to descend safely.

The word BASE is an acronym for the four categories of structures used:

• B — Building
• A — Antenna
• S — Span (bridges)
• E — Earth (cliffs and natural formations)

BASE jumping typically involves lower altitudes than skydiving, requiring faster reflexes, specialized parachute systems, and highly trained athletes. The sport demands precision, technical skill, and deep knowledge of wind, weather, gear, and body control.

In Malaysia, legal BASE jumps take place only through organized events with permits — not from random buildings. Always verify events on this website and register officially.`,
  },
] as const;
