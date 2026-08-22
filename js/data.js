/**
 * GlobeTrotter Database Seed Dataset (conforming to API_CONTRACT.md)
 * 10 Major Indian Destinations • 10 Activities (IDs 101-1010) • 10 Hotels (IDs 1001-10010)
 */

const CITIES_DATA = [
  {
    id: 1,
    name: "Mumbai",
    state: "Maharashtra",
    country: "India",
    region: "West",
    tagline: "The City of Dreams, Colonial Heritage & Coastal Glamour",
    description: "India's financial powerhouse and entertainment capital, where historic Victorian Gothic architecture meets vibrant Arabian Sea promenades and world-class culinary scenes.",
    bestTime: "October to March",
    idealStayDays: 3,
    heroImage: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80",
    tags: ["Heritage", "Coastal", "Nightlife", "Culinary", "Colonial"]
  },
  {
    id: 2,
    name: "New Delhi",
    state: "Delhi NCR",
    country: "India",
    region: "North",
    tagline: "The Historic Seat of Empires & Vibrant Capital of India",
    description: "An enthralling tapestry of Mughal citadels, wide British Lutyens boulevards, spiritual landmarks, and legendary culinary alleys spanning a millennium of history.",
    bestTime: "October to March",
    idealStayDays: 3,
    heroImage: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80",
    tags: ["Heritage", "Culinary", "Monuments", "Shopping", "Culture"]
  },
  {
    id: 3,
    name: "Jaipur",
    state: "Rajasthan",
    country: "India",
    region: "North",
    tagline: "The Pink City of Maharajas, Fortresses & Royal Splendour",
    description: "Rajasthan's regal crown jewel, famous for terra-cotta pink facades, hilltop Rajput citadels, gem bazaars, and opulent heritage palace hospitality.",
    bestTime: "October to March",
    idealStayDays: 3,
    heroImage: "https://images.unsplash.com/photo-1603288967963-36612df49734?auto=format&fit=crop&w=1200&q=80",
    tags: ["Heritage", "Royal", "Palaces", "Culture", "Shopping"]
  },
  {
    id: 4,
    name: "Bengaluru",
    state: "Karnataka",
    country: "India",
    region: "South",
    tagline: "The Silicon Valley of India & Garden City of Craft Breweries",
    description: "A dynamic metropolis of lush colonial botanical parks, tech hubs, thriving indie music venues, and India's finest craft brewery and filter coffee culture.",
    bestTime: "Year-Round (Best Oct to Feb)",
    idealStayDays: 2,
    heroImage: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80",
    tags: ["Tech & Modern", "Nature", "Nightlife", "Culinary", "Gardens"]
  },
  {
    id: 5,
    name: "Varanasi",
    state: "Uttar Pradesh",
    country: "India",
    region: "North",
    tagline: "The Spiritual Capital of India on the Holy River Ganges",
    description: "One of the world's oldest continually inhabited cities, sacred to millions, celebrated for mystical Ganga Aarti rituals, dawn boat journeys, and timeless spiritual lore.",
    bestTime: "October to March",
    idealStayDays: 2,
    heroImage: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80",
    tags: ["Spiritual", "Heritage", "Culture", "Riverside", "Ancient"]
  },
  {
    id: 6,
    name: "Udaipur",
    state: "Rajasthan",
    country: "India",
    region: "North",
    tagline: "The City of Lakes, Marble Palaces & Romance",
    description: "Often hailed as the Venice of the East, Udaipur sparkles with shimmering lakes, soaring marble palaces, floating island pavilions, and Aravalli mountain sunsets.",
    bestTime: "October to March",
    idealStayDays: 3,
    heroImage: "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1200&q=80",
    tags: ["Romantic", "Heritage", "Lakeside", "Palaces", "Royal"]
  },
  {
    id: 7,
    name: "Kolkata",
    state: "West Bengal",
    country: "India",
    region: "East",
    tagline: "The City of Joy, Intellectual Soul & Grand Architecture",
    description: "The cultural and artistic capital of India, revered for grand colonial monuments, iconic yellow taxis, intellectual adda discussions, and delicious Bengali sweets.",
    bestTime: "October to March",
    idealStayDays: 3,
    heroImage: "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1200&q=80",
    tags: ["Culture", "Heritage", "Colonial", "Culinary", "Art"]
  },
  {
    id: 8,
    name: "Kochi",
    state: "Kerala",
    country: "India",
    region: "South",
    tagline: "The Queen of the Arabian Sea, Spice Route & Serene Backwaters",
    description: "A coastal haven where Portuguese churches, Dutch palaces, Jewish synagogues, Chinese fishing nets, and tranquil emerald backwaters meet.",
    bestTime: "September to March",
    idealStayDays: 3,
    heroImage: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80",
    tags: ["Coastal", "Heritage", "Culture", "Backwaters", "Ayurveda"]
  },
  {
    id: 9,
    name: "Hyderabad",
    state: "Telangana",
    country: "India",
    region: "South",
    tagline: "The City of Pearls, Nizami Grandeur & World-Famous Biryani",
    description: "A city where the grandeur of wealthy Nizams blends seamlessly with gleaming HITEC City glass towers, historic Qutb Shahi fortresses, and aromatic biryani kitchens.",
    bestTime: "October to March",
    idealStayDays: 2,
    heroImage: "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&w=1200&q=80",
    tags: ["Heritage", "Culinary", "Royal", "Tech & Modern", "Monuments"]
  },
  {
    id: 10,
    name: "Goa",
    state: "Goa",
    country: "India",
    region: "West",
    tagline: "Golden Sands, Latin Quarters, Tropical Cascades & Susegad Lifestyle",
    description: "India's premier tropical haven of sun-kissed Arabian beaches, Portuguese colonial architecture, vibrant shacks, spice plantations, and thrilling water sports.",
    bestTime: "November to March",
    idealStayDays: 4,
    heroImage: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
    tags: ["Coastal", "Beaches", "Nightlife", "Heritage", "Adventure"]
  }
];

const ACTIVITIES_DATA = [
  // 1. Mumbai (101 - 110)
  { id: 101, city_id: 1, name: "Gateway of India & Taj Palace Walk", price_per_person: 0, priceINR: 0, category: "Heritage", duration: "1.5 hrs", highlight: true, description: "Marvel at the monumental basalt arch overlooking Mumbai harbour and the majestic facade of the 1903 Taj Mahal Palace." },
  { id: 102, city_id: 1, name: "Marine Drive Sunset Promenade Stroll", price_per_person: 0, priceINR: 0, category: "Sightseeing", duration: "2 hrs", highlight: true, description: "Stroll along the iconic 3.6km C-shaped arc known as the Queen's Necklace as the Arabian sun sets." },
  { id: 103, city_id: 1, name: "Elephanta Caves Ferry & Island Tour", price_per_person: 260, priceINR: 260, category: "Heritage", duration: "4 hrs", highlight: true, description: "Take a scenic boat ride across Mumbai Harbor to ancient 5th-century rock-cut caves dedicated to Lord Shiva." },
  { id: 104, city_id: 1, name: "CSMT Station Heritage Walk", price_per_person: 0, priceINR: 0, category: "Heritage", duration: "1 hr", highlight: false, description: "Admire the Victorian Gothic Revival grandeur of Chhatrapati Shivaji Maharaj Terminus, a UNESCO World Heritage site." },
  { id: 105, city_id: 1, name: "Dharavi Guided Tour", price_per_person: 750, priceINR: 750, category: "Culture", duration: "2.5 hrs", highlight: false, description: "An insightful educational tour uncovering the industrious small-scale recycling, pottery, and leather craft communities." },
  { id: 106, city_id: 1, name: "Colaba Causeway Shopping & Cafe Trail", price_per_person: 500, priceINR: 500, category: "Shopping", duration: "3 hrs", highlight: false, description: "Bargain for vintage curios, handicrafts, and visit historic hotspots like Cafe Leopold & Mondegar." },
  { id: 107, city_id: 1, name: "Bandra Bandstand & Celebrity Homes Walk", price_per_person: 0, priceINR: 0, category: "Sightseeing", duration: "1.5 hrs", highlight: false, description: "Walk along the breezy seafront promenade passing Mannat, Galaxy Apartments, and the historic Castella de Aguada." },
  { id: 108, city_id: 1, name: "Juhu Beach Street Food Experience", price_per_person: 300, priceINR: 300, category: "Food", duration: "2 hrs", highlight: true, description: "Taste quintessential Mumbai snacks: Pav Bhaji, Sev Puri, Bhel Puri, and Kulfi Falooda by the ocean waves." },
  { id: 109, city_id: 1, name: "Sanjay Gandhi National Park & Kanheri Caves", price_per_person: 150, priceINR: 150, category: "Nature", duration: "3.5 hrs", highlight: false, description: "Explore lush tropical forests within city limits and hike up to 109 ancient Buddhist rock-cut meditation caves." },
  { id: 110, city_id: 1, name: "Crawford Market & Spice Trail Walk", price_per_person: 0, priceINR: 0, category: "Food", duration: "2 hrs", highlight: false, description: "Immerse in an aromatic labyrinth of exotic spices, dry fruits, fresh flowers, and colonial Norman-Gothic architecture." },

  // 2. New Delhi & NCR (201 - 210)
  { id: 201, city_id: 2, name: "Red Fort & Chandni Chowk Rikshaw Tour", price_per_person: 350, priceINR: 350, category: "Heritage", duration: "2.5 hrs", highlight: true, description: "Navigate historic alleys, taste world-famous jalebis and parathas, and gaze upon the colossal 17th-century Mughal Lal Qila." },
  { id: 202, city_id: 2, name: "Qutub Minar & Mehrauli Walk", price_per_person: 50, priceINR: 50, category: "Heritage", duration: "2 hrs", highlight: true, description: "Marvel at the world's tallest brick minaret (72.5m) and the mysterious non-rusting 4th-century iron pillar." },
  { id: 203, city_id: 2, name: "Humayun’s Tomb Garden Stroll", price_per_person: 50, priceINR: 50, category: "Heritage", duration: "2 hrs", highlight: true, description: "Walk through symmetrical Persian Charbagh gardens surrounding the red sandstone tomb that inspired the Taj Mahal." },
  { id: 204, city_id: 2, name: "India Gate & Rashtrapati Bhavan Walk", price_per_person: 0, priceINR: 0, category: "Sightseeing", duration: "1.5 hrs", highlight: true, description: "Stroll along the grand Kartavya Path to view the Amar Jawan Jyoti and the grand Presidential Palace." },
  { id: 205, city_id: 2, name: "Lotus Temple Visit", price_per_person: 0, priceINR: 0, category: "Culture", duration: "1.5 hrs", highlight: false, description: "Experience serene meditation in the magnificent pure white marble Baháʼí House of Worship shaped like a lotus blossom." },
  { id: 206, city_id: 2, name: "Akshardham Temple & Light Show", price_per_person: 250, priceINR: 250, category: "Culture", duration: "3.5 hrs", highlight: true, description: "Discover intricate stone-carved architecture, boat rides through ancient Indian history, and the Sahaj Anand water show." },
  { id: 207, city_id: 2, name: "Old Delhi Food Tasting Experience", price_per_person: 600, priceINR: 600, category: "Food", duration: "3 hrs", highlight: true, description: "Feast on iconic dishes: Daulat ki Chaat, authentic Butter Chicken, Nihari, Kuremal stuffed kulfis, and Bedmi Puri." },
  { id: 208, city_id: 2, name: "National Gallery of Modern Art", price_per_person: 20, priceINR: 20, category: "Culture", duration: "2 hrs", highlight: false, description: "Explore thousands of masterpieces by Raja Ravi Varma, Amrita Sher-Gil, Rabindranath Tagore, and modern Indian artists." },
  { id: 209, city_id: 2, name: "Lodhi Art District Street Art Walk", price_per_person: 0, priceINR: 0, category: "Culture", duration: "1.5 hrs", highlight: false, description: "India's first open-air public art district with massive curated murals painted by global and Indian street artists." },
  { id: 210, city_id: 2, name: "Hauz Khas Village & Fort Sunset Exploration", price_per_person: 20, priceINR: 20, category: "Sightseeing", duration: "2 hrs", highlight: false, description: "Explore 13th-century medieval reservoir ruins flanked by indie boutiques, hipster cafes, and vibrant rooftop lounges." },

  // 3. Jaipur (301 - 310)
  { id: 301, city_id: 3, name: "Amber Fort Guided Tour", price_per_person: 200, priceINR: 200, category: "Heritage", duration: "3 hrs", highlight: true, description: "Ascend the hilltop citadel to behold the Sheesh Mahal (Mirror Palace), Diwan-e-Aam, and sprawling Maota Lake vistas." },
  { id: 302, city_id: 3, name: "Hawa Mahal Photography Walk", price_per_person: 50, priceINR: 50, category: "Sightseeing", duration: "1 hr", highlight: true, description: "Photograph the iconic honeycomb pink sandstone facade with 953 jharokhas designed for royal court ladies." },
  { id: 303, city_id: 3, name: "City Palace & Jantar Mantar Tour", price_per_person: 500, priceINR: 500, category: "Heritage", duration: "2.5 hrs", highlight: true, description: "Tour the living royal residence and the world's largest stone astronomical observatory with the giant Vrihat Samrat Yantra." },
  { id: 304, city_id: 3, name: "Nahargarh Fort Sunset Panorama Visit", price_per_person: 50, priceINR: 50, category: "Sightseeing", duration: "2 hrs", highlight: true, description: "Catch breathless golden hour panoramas over the entire illuminated Pink City skyline from the fort ramparts." },
  { id: 305, city_id: 3, name: "Jaigarh Fort & Cannon Visit", price_per_person: 100, priceINR: 100, category: "Heritage", duration: "2 hrs", highlight: false, description: "Inspect Jaivana, the world's largest cannon on wheels, and explore subterranean armouries and secret tunnels." },
  { id: 306, city_id: 3, name: "Johri Bazaar Block Printing Walk", price_per_person: 0, priceINR: 0, category: "Shopping", duration: "2 hrs", highlight: false, description: "Witness master artisans carving woodblocks and printing vibrant Bagru and Sanganeri patterns on pure cotton." },
  { id: 307, city_id: 3, name: "Jal Mahal Viewpoint Visit", price_per_person: 0, priceINR: 0, category: "Sightseeing", duration: "1 hr", highlight: false, description: "Marvel at the romantic 'Water Palace' floating serenely in the center of Man Sagar Lake against the Aravalli hills." },
  { id: 308, city_id: 3, name: "Albert Hall Museum Night Tour", price_per_person: 100, priceINR: 100, category: "Culture", duration: "1.5 hrs", highlight: false, description: "View rare Indo-Saracenic decorative arts, Persian carpets, and an Egyptian mummy bathed in colourful night illumination." },
  { id: 309, city_id: 3, name: "Rajasthani Thali Cooking Class", price_per_person: 1200, priceINR: 1200, category: "Food", duration: "3 hrs", highlight: true, description: "Hands-on culinary masterclass making authentic Dal Baati Churma, Gatte ki Sabzi, Ker Sangri, and Laal Maas." },
  { id: 310, city_id: 3, name: "Chokhi Dhani Cultural Village Pass", price_per_person: 1000, priceINR: 1000, category: "Culture", duration: "4 hrs", highlight: false, description: "Immersive Rajasthani fair with folk puppet shows, Kalbelia dancers, camel rides, and a traditional sit-down banquet." },

  // 4. Bengaluru (401 - 410)
  { id: 401, city_id: 4, name: "Lalbagh Botanical Garden Stroll", price_per_person: 30, priceINR: 30, category: "Nature", duration: "2 hrs", highlight: true, description: "Walk through 240 acres of century-old exotic flora, tropical bonsai, and the iconic Victorian Glass House." },
  { id: 402, city_id: 4, name: "Bengaluru Palace Audio Tour", price_per_person: 250, priceINR: 250, category: "Heritage", duration: "2 hrs", highlight: true, description: "Explore Tudor-style wooden battlements, fortified towers, hunting trophies, and royal family portrait galleries." },
  { id: 403, city_id: 4, name: "Cubbon Park Morning Walk", price_per_person: 0, priceINR: 0, category: "Nature", duration: "1.5 hrs", highlight: true, description: "Breathe in 300 acres of tranquil bamboo groves, the red-brick High Court (Attara Kacheri), and Central Library." },
  { id: 404, city_id: 4, name: "Commercial Street Shopping", price_per_person: 0, priceINR: 0, category: "Shopping", duration: "2.5 hrs", highlight: false, description: "Explore narrow bustling lanes for silver jewellery, silk sarees, Kashmiri shawls, and street footwear." },
  { id: 405, city_id: 4, name: "ISKCON Temple Visit", price_per_person: 0, priceINR: 0, category: "Culture", duration: "1.5 hrs", highlight: false, description: "Visit one of the largest modern Neo-Vedic temple complexes situated on Hare Krishna Hill." },
  { id: 406, city_id: 4, name: "Craft Beer & Pub Crawl in Indiranagar", price_per_person: 1500, priceINR: 1500, category: "Food", duration: "3.5 hrs", highlight: true, description: "Sample local microbrews (mango IPAs, Belgian wits) and tapas at Toit, Windmills, and Arbor Brewing Company." },
  { id: 407, city_id: 4, name: "Tipu Sultan’s Summer Palace Tour", price_per_person: 20, priceINR: 20, category: "Heritage", duration: "1.5 hrs", highlight: false, description: "Admire the ornate teakwood pillars, curved brackets, and Islamic floral frescoes of 'Rashk-e-Jannat'." },
  { id: 408, city_id: 4, name: "National Gallery of Modern Art", price_per_person: 20, priceINR: 20, category: "Culture", duration: "2 hrs", highlight: false, description: "A serene heritage mansion set inside a shaded garden cafe exhibiting prominent contemporary Indian art." },
  { id: 409, city_id: 4, name: "Bannerghatta Biological Park Safari", price_per_person: 350, priceINR: 350, category: "Nature", duration: "4 hrs", highlight: false, description: "Experience a safari sighting Bengal tigers, Asiatic lions, and wander through India's premier butterfly park." },
  { id: 410, city_id: 4, name: "Nandi Hills Sunrise Day Trip", price_per_person: 100, priceINR: 100, category: "Nature", duration: "4 hrs", highlight: true, description: "Drive up the winding misty hill fortress to watch the sunrise pierce through an ethereal sea of clouds." },

  // 5. Varanasi (501 - 510)
  { id: 501, city_id: 5, name: "Dashashwamedh Ghat Evening Aarti", price_per_person: 0, priceINR: 0, category: "Spiritual", duration: "2 hrs", highlight: true, description: "Behold the hypnotic synchronized spectacle of brass oil lamps, conch shells, and Vedic chants beside the sacred river." },
  { id: 502, city_id: 5, name: "Sunrise Ganges Boat Ride", price_per_person: 400, priceINR: 400, category: "Sightseeing", duration: "2 hrs", highlight: true, description: "Row gently along the ghats at dawn watching holy bathing rituals and the morning sun illuminating centuries-old stone facades." },
  { id: 503, city_id: 5, name: "Kashi Vishwanath Temple Darshan", price_per_person: 0, priceINR: 0, category: "Spiritual", duration: "2 hrs", highlight: true, description: "Seek blessings at the sacred Jyotirlinga shrine with its iconic gold-plated spire and new temple corridor." },
  { id: 504, city_id: 5, name: "Sarnath Pilgrimage & Museum Tour", price_per_person: 50, priceINR: 50, category: "Heritage", duration: "3 hrs", highlight: true, description: "Visit the site of Lord Buddha's first sermon, the Dhamek Stupa, and the original 3rd-century BC Ashoka Lion Capital." },
  { id: 505, city_id: 5, name: "Manikarnika & Harishchandra Ghat Walk", price_per_person: 0, priceINR: 0, category: "Culture", duration: "1 hr", highlight: false, description: "A profound, respectful walking passage witnessing the eternal sacred funeral pyres and cycle of Moksha." },
  { id: 506, city_id: 5, name: "Banarasi Silk Weaving Village Tour", price_per_person: 300, priceINR: 300, category: "Culture", duration: "2.5 hrs", highlight: false, description: "Observe master weavers operating wooden pit looms creating gold zari brocade Banarasi sarees." },
  { id: 507, city_id: 5, name: "Street Food Crawl", price_per_person: 250, priceINR: 250, category: "Food", duration: "2 hrs", highlight: true, description: "Savor Tamatar Chaat, Malaiyyo foam sweets, Blue Lassi with rabdi & pistachios, and authentic Banarasi Paan." },
  { id: 508, city_id: 5, name: "BHU & Bharat Kala Bhavan", price_per_person: 20, priceINR: 20, category: "Culture", duration: "2 hrs", highlight: false, description: "Stroll Asia's largest residential university campus and explore ancient sandstone sculptures and palm-leaf manuscripts." },
  { id: 509, city_id: 5, name: "Assi Ghat Subah-e-Banaras Yoga", price_per_person: 0, priceINR: 0, category: "Spiritual", duration: "1.5 hrs", highlight: false, description: "Join open-air morning yoga, classical music recitals (Raga), and meditation as the sun rises over Assi Ghat." },
  { id: 510, city_id: 5, name: "Ramnagar Fort & Museum Exploration", price_per_person: 150, priceINR: 150, category: "Heritage", duration: "2 hrs", highlight: false, description: "Explore the 18th-century sandstone fortress residence of the Kashi Naresh housing vintage cars and astronomical clocks." },

  // 6. Udaipur (601 - 610)
  { id: 601, city_id: 6, name: "City Palace Complex Tour", price_per_person: 400, priceINR: 400, category: "Heritage", duration: "3 hrs", highlight: true, description: "Rajasthan's largest royal palace complex with peacock mosaic courtyards, marble balconies, and crystal galleries." },
  { id: 602, city_id: 6, name: "Lake Pichola Sunset Boat Cruise", price_per_person: 800, priceINR: 800, category: "Sightseeing", duration: "1.5 hrs", highlight: true, description: "Glide across the golden waters of Lake Pichola past Jag Mandir, Taj Lake Palace, and bathing ghats at sunset." },
  { id: 603, city_id: 6, name: "Jag Mandir Island Palace Visit", price_per_person: 500, priceINR: 500, category: "Heritage", duration: "2 hrs", highlight: true, description: "Step foot on the floating marble island pleasure palace where Mughal prince Khurram once sought sanctuary." },
  { id: 604, city_id: 6, name: "Saheliyon-Ki-Bari Royal Garden Stroll", price_per_person: 20, priceINR: 20, category: "Nature", duration: "1.5 hrs", highlight: false, description: "Wander through the 'Garden of the Maidens' featuring marble elephant fountains, lotus pools, and rose gardens." },
  { id: 605, city_id: 6, name: "Bagore Ki Haveli Folk Dance Show", price_per_person: 100, priceINR: 100, category: "Culture", duration: "1.5 hrs", highlight: true, description: "Watch the thrilling Dharohar dance show featuring women balancing up to 11 clay pots on their heads alongside puppet masters." },
  { id: 606, city_id: 6, name: "Monsoon Palace Hilltop View", price_per_person: 100, priceINR: 100, category: "Sightseeing", duration: "2 hrs", highlight: true, description: "Ascend Sajjangarh Fort perched high on Bansdara mountain for 360-degree panoramic sunset vistas of the lakes." },
  { id: 607, city_id: 6, name: "Jagdish Temple Heritage Walk", price_per_person: 0, priceINR: 0, category: "Heritage", duration: "1 hr", highlight: false, description: "Admire the 1651 Indo-Aryan carved pillars, bronze Garuda statue, and spire dominating the old city skyline." },
  { id: 608, city_id: 6, name: "Shilpgram Rural Arts Complex Visit", price_per_person: 50, priceINR: 50, category: "Culture", duration: "2.5 hrs", highlight: false, description: "An ethnographic museum village exhibiting traditional mud huts, terracotta pottery, and folk musicians." },
  { id: 609, city_id: 6, name: "Fateh Sagar Lake Promenade", price_per_person: 0, priceINR: 0, category: "Sightseeing", duration: "1.5 hrs", highlight: false, description: "Stroll the lakeside promenade, rent paddle boats to Nehru Park island, and sip cold coffee by the shores." },
  { id: 610, city_id: 6, name: "Miniature Painting Workshop", price_per_person: 600, priceINR: 600, category: "Culture", duration: "2 hrs", highlight: false, description: "Learn the delicate technique of Mewar single-squirrel-hair brush miniature painting with natural stone pigments." },

  // 7. Kolkata (701 - 710)
  { id: 701, city_id: 7, name: "Victoria Memorial Hall & Gardens", price_per_person: 50, priceINR: 50, category: "Heritage", duration: "2.5 hrs", highlight: true, description: "Marvel at the monumental white Makrana marble palace commemorating Queen Victoria, set amidst 64 acres of landscaped gardens." },
  { id: 702, city_id: 7, name: "Howrah Bridge & Flower Market Walk", price_per_person: 0, priceINR: 0, category: "Culture", duration: "2 hrs", highlight: true, description: "Walk across the world's busiest cantilever bridge and plunge into Asia's largest sensory flower market at Mallick Ghat." },
  { id: 703, city_id: 7, name: "Dakshineswar & Belur Math Ferry Tour", price_per_person: 30, priceINR: 30, category: "Spiritual", duration: "3 hrs", highlight: true, description: "Sail on the Hooghly between the 12-spired Kali Temple of Ramakrishna and the universal architectural headquarters of the Ramakrishna Mission." },
  { id: 704, city_id: 7, name: "Park Street Heritage Walk", price_per_person: 0, priceINR: 0, category: "Sightseeing", duration: "2 hrs", highlight: false, description: "Walk Kolkata's celebrated entertainment boulevard, home to legendary jazz lounges (Mocambo, Peter Cat) and South Park Street Cemetery." },
  { id: 705, city_id: 7, name: "Indian Museum Artifacts Tour", price_per_person: 50, priceINR: 50, category: "Heritage", duration: "2.5 hrs", highlight: false, description: "Explore the 9th oldest museum in the world, displaying rare Gandharan sculptures, fossils, and Mughal miniatures." },
  { id: 706, city_id: 7, name: "Kumartuli Clay Idol Makers Colony Walk", price_per_person: 0, priceINR: 0, category: "Culture", duration: "2 hrs", highlight: true, description: "Watch traditional potters mold straw and sacred Ganges clay into gigantic Durga Puja idols." },
  { id: 707, city_id: 7, name: "Jorasanko Thakurbari (Tagore House)", price_per_person: 20, priceINR: 20, category: "Heritage", duration: "1.5 hrs", highlight: false, description: "Tour the ancestral home and birth place of Nobel laureate Rabindranath Tagore, showcasing his personal paintings and library." },
  { id: 708, city_id: 7, name: "College Street & Indian Coffee House", price_per_person: 150, priceINR: 150, category: "Food", duration: "2 hrs", highlight: true, description: "Wander through the world's largest second-hand book market and debate politics over coffee where revolutionaries once met." },
  { id: 709, city_id: 7, name: "St. Paul’s Cathedral Architecture Tour", price_per_person: 0, priceINR: 0, category: "Heritage", duration: "1 hr", highlight: false, description: "Admire Gothic revival spires, wide nave arches, and stained glass windows designed by Sir Edward Burne-Jones." },
  { id: 710, city_id: 7, name: "Hooghly River Sunset Heritage Cruise", price_per_person: 400, priceINR: 400, category: "Sightseeing", duration: "2 hrs", highlight: true, description: "Glide past illuminated historic river ghats, colonial docks, and the cantilever silhouettes under evening twilight." },

  // 8. Kochi (801 - 810)
  { id: 801, city_id: 8, name: "Fort Kochi Fishing Nets Viewpoint", price_per_person: 0, priceINR: 0, category: "Sightseeing", duration: "1.5 hrs", highlight: true, description: "Watch fishermen operate the massive 14th-century cantilevered Chinese fishing nets against the Arabian Sea sunset." },
  { id: 802, city_id: 8, name: "Mattancherry Palace Tour", price_per_person: 10, priceINR: 10, category: "Heritage", duration: "1.5 hrs", highlight: true, description: "Tour the Portuguese-built 'Dutch Palace' showcasing Hindu mythological murals and royal coronation robes." },
  { id: 803, city_id: 8, name: "Paradesi Synagogue Visit", price_per_person: 10, priceINR: 10, category: "Heritage", duration: "1 hr", highlight: true, description: "Step inside the 1568 synagogue featuring hand-painted Chinese willow-pattern tiles and Belgian glass chandeliers in Jew Town." },
  { id: 804, city_id: 8, name: "Kathakali Dance & Cultural Show", price_per_person: 400, priceINR: 400, category: "Culture", duration: "2 hrs", highlight: true, description: "Witness the elaborate facial makeup application followed by an expressive classical dance-drama portraying epics." },
  { id: 805, city_id: 8, name: "Kerala Backwaters Day Cruise", price_per_person: 1200, priceINR: 1200, category: "Nature", duration: "4 hrs", highlight: true, description: "Glide through serene palm-fringed canals, paddy fields, and coir-making villages on a traditional wooden kettuvallam." },
  { id: 806, city_id: 8, name: "St. Francis Church & Vasco Square", price_per_person: 0, priceINR: 0, category: "Heritage", duration: "1 hr", highlight: false, description: "Visit India's oldest European church built in 1503, where explorer Vasco da Gama was originally buried." },
  { id: 807, city_id: 8, name: "Kalaripayattu Martial Arts Show", price_per_person: 400, priceINR: 400, category: "Culture", duration: "1 hr", highlight: true, description: "An electrifying exhibition of ancient martial swordplay, acrobatics, and fire leaps at the traditional arena." },
  { id: 808, city_id: 8, name: "Marine Drive Kochi Promenade", price_per_person: 0, priceINR: 0, category: "Sightseeing", duration: "1.5 hrs", highlight: false, description: "Walk along the scenic backwater promenade overlooking Vallarpadam island and rainbow bridge." },
  { id: 809, city_id: 8, name: "Spice & Tea Tasting Tour", price_per_person: 500, priceINR: 500, category: "Food", duration: "2 hrs", highlight: true, description: "Smell and taste freshly ground Malabar black pepper, cardamom pods, vanilla beans, and high-grown Nilgiri teas." },
  { id: 810, city_id: 8, name: "Willingdon Island Heritage Walk", price_per_person: 0, priceINR: 0, category: "Sightseeing", duration: "1.5 hrs", highlight: false, description: "Stroll India's largest man-made island named after Lord Willingdon, surrounded by sea-going cargo vessels." },

  // 9. Hyderabad (901 - 910)
  { id: 901, city_id: 9, name: "Charminar Walk & Lad Bazaar Shopping", price_per_person: 25, priceINR: 25, category: "Heritage", duration: "2.5 hrs", highlight: true, description: "Ascend the four minarets built in 1591 and shop for lac bangles, pearls, and zardozi embroidery in the bustling bazaars." },
  { id: 902, city_id: 9, name: "Golconda Fort & Light Show", price_per_person: 150, priceINR: 150, category: "Heritage", duration: "3 hrs", highlight: true, description: "Explore the medieval diamond fortress famous for its acoustic clapping portico and enjoy the evening son-et-lumière show." },
  { id: 903, city_id: 9, name: "Chowmahalla Palace Architecture Tour", price_per_person: 100, priceINR: 100, category: "Heritage", duration: "2 hrs", highlight: true, description: "Behold the opulent seat of the Asaf Jahi dynasty, the Grand Khilwat clock tower, vintage Rolls Royces, and 19 crystal chandeliers." },
  { id: 904, city_id: 9, name: "Ramoji Film City Full-Day Tour", price_per_person: 1350, priceINR: 1350, category: "Culture", duration: "6 hrs", highlight: true, description: "Tour the world's largest integrated film studio complex with elaborate film sets, stunt shows, and adventure rides." },
  { id: 905, city_id: 9, name: "Qutb Shahi Tombs Walk", price_per_person: 50, priceINR: 50, category: "Heritage", duration: "2 hrs", highlight: false, description: "Wander through majestic domed mausoleums combining Persian, Pathan, and Hindu architectural styles in serene Ibrahim Bagh." },
  { id: 906, city_id: 9, name: "Salar Jung Museum Treasures Tour", price_per_person: 50, priceINR: 50, category: "Culture", duration: "2.5 hrs", highlight: true, description: "View the legendary Veiled Rebecca marble statue, musical mechanical clock, and the world's largest one-man antique collection." },
  { id: 907, city_id: 9, name: "Hussain Sagar Lake & Boat Ride", price_per_person: 100, priceINR: 100, category: "Sightseeing", duration: "1.5 hrs", highlight: false, description: "Take a speed boat to the monolithic 18-meter-tall granite Buddha statue standing in the heart of the lake." },
  { id: 908, city_id: 9, name: "Hyderabadi Biryani Culinary Tour", price_per_person: 500, priceINR: 500, category: "Food", duration: "2.5 hrs", highlight: true, description: "Feast on slow-cooked Dum Biryani, Mirchi ka Salan, Double ka Meetha, Irani Chai, and Osmania biscuits." },
  { id: 909, city_id: 9, name: "Nehru Zoological Park Safari", price_per_person: 100, priceINR: 100, category: "Nature", duration: "3 hrs", highlight: false, description: "A vast 380-acre natural safari park with nocturnal animal exhibits, bear reserves, and miniature train rides." },
  { id: 910, city_id: 9, name: "Birla Mandir Hilltop Visit", price_per_person: 0, priceINR: 0, category: "Spiritual", duration: "1.5 hrs", highlight: false, description: "A serene temple sculpted from 2000 tons of pure white Rajasthani marble atop the 280-foot Naubat Pahad hill." },

  // 10. Goa (1001 - 1010)
  { id: 1001, city_id: 10, name: "Basilica of Bom Jesus & Se Cathedral", price_per_person: 0, priceINR: 0, category: "Heritage", duration: "2 hrs", highlight: true, description: "Explore the UNESCO-listed 1605 baroque basilica holding the sacred relics of St. Francis Xavier and the massive Golden Bell." },
  { id: 1002, city_id: 10, name: "Fontainhas Latin Quarter Walk", price_per_person: 0, priceINR: 0, category: "Heritage", duration: "2 hrs", highlight: true, description: "Stroll picturesque cobblestone streets lined with pastel yellow, terracotta, and indigo Portuguese heritage villas." },
  { id: 1003, city_id: 10, name: "Mandovi River Sunset Dinner Cruise", price_per_person: 800, priceINR: 800, category: "Sightseeing", duration: "2.5 hrs", highlight: true, description: "Cruise along the river Mandovi with live Goan folk dance (Dekhni/Fugdi), DJ music, buffet dinner, and coastal breeze." },
  { id: 1004, city_id: 10, name: "Dudhsagar Waterfalls & Spice Tour", price_per_person: 1800, priceINR: 1800, category: "Adventure", duration: "5 hrs", highlight: true, description: "Take a 4x4 jungle jeep safari through Bhagwan Mahavir Wildlife Sanctuary to India's towering 4-tiered 310m milky falls." },
  { id: 1005, city_id: 10, name: "Anjuna & Vagator Beach Sunset", price_per_person: 0, priceINR: 0, category: "Sightseeing", duration: "2 hrs", highlight: true, description: "Relax on red laterite clifftops overlooking crashing waves and iconic sunset cafes like Thalassa and Curlies." },
  { id: 1006, city_id: 10, name: "Aguada Fort Historic Walk", price_per_person: 50, priceINR: 50, category: "Heritage", duration: "1.5 hrs", highlight: false, description: "Explore the 17th-century Portuguese fortress and its vintage 4-storey freshwater lighthouse guarding Sinquerim beach." },
  { id: 1007, city_id: 10, name: "Scuba Diving at Grand Island", price_per_person: 2500, priceINR: 2500, category: "Adventure", duration: "4.5 hrs", highlight: true, description: "Boat expedition with PADI guides exploring coral reefs, marine life, and historic shipwrecks in Arabian waters." },
  { id: 1008, city_id: 10, name: "Panaji Heritage Market Tour", price_per_person: 0, priceINR: 0, category: "Shopping", duration: "2 hrs", highlight: false, description: "Browse traditional cashews, Feni spirits, Goan sausages (chorizo), ceramic azulejos tiles, and vintage bakeries." },
  { id: 1009, city_id: 10, name: "Palolem Beach Kayaking", price_per_person: 400, priceINR: 400, category: "Adventure", duration: "1.5 hrs", highlight: false, description: "Paddle across calm crescent bay waters to Butterfly Island and Monkey Island in South Goa." },
  { id: 1010, city_id: 10, name: "Anjuna Flea Market Experience", price_per_person: 0, priceINR: 0, category: "Shopping", duration: "2.5 hrs", highlight: false, description: "Immerse in the legendary Wednesday market for handmade jewellery, boho fashion, leather goods, and live acoustic music." }
];

const HOTELS_DATA = [
  // 1. Mumbai (1001 - 1010)
  { id: 1001, city_id: 1, name: "Abode Bombay", tier: "Boutique", price_per_night: 3500, priceINR: 3500, rating: 4.5, location: "Colaba", amenities: ["Free Wi-Fi", "Vintage Decor", "Artisan Breakfast"] },
  { id: 1002, city_id: 1, name: "Gordon House Hotel", tier: "Mid-Range", price_per_night: 5500, priceINR: 5500, rating: 4.3, location: "Colaba", amenities: ["Theme Rooms", "All Day Dining", "Bar"] },
  { id: 1003, city_id: 1, name: "Hotel Marine Plaza", tier: "4-Star", price_per_night: 7500, priceINR: 7500, rating: 4.4, location: "Marine Drive", amenities: ["Sea View", "Rooftop Pool", "Glass Bottom Pool"] },
  { id: 1004, city_id: 1, name: "Soho House Mumbai", tier: "Boutique Lux", price_per_night: 12000, priceINR: 12000, rating: 4.8, location: "Juhu Beach", amenities: ["Private Beach Access", "Rooftop Pool", "Cinema Room"] },
  { id: 1005, city_id: 1, name: "ITC Grand Central", tier: "5-Star Lux", price_per_night: 13500, priceINR: 13500, rating: 4.7, location: "Parel", amenities: ["Kaya Kalp Spa", "Fine Dining", "Butler Service"] },
  { id: 1006, city_id: 1, name: "Trident Nariman Point", tier: "5-Star Lux", price_per_night: 15000, priceINR: 15000, rating: 4.7, location: "Nariman Point", amenities: ["Marine Drive View", "Spa", "Executive Club"] },
  { id: 1007, city_id: 1, name: "JW Marriott Mumbai Juhu", tier: "5-Star Lux", price_per_night: 18000, priceINR: 18000, rating: 4.8, location: "Juhu Beach", amenities: ["Saltwater Pool", "Beachfront", "Award-winning Spa"] },
  { id: 1008, city_id: 1, name: "The St. Regis Mumbai", tier: "Ultra Lux", price_per_night: 21000, priceINR: 21000, rating: 4.9, location: "Lower Parel", amenities: ["Signature Butler", "Rooftop Lounge", "Palladium Mall Access"] },
  { id: 1009, city_id: 1, name: "The Oberoi Mumbai", tier: "Ultra Lux", price_per_night: 24000, priceINR: 24000, rating: 4.9, location: "Nariman Point", amenities: ["Panoramic Ocean Views", "Michelin-starred dining", "Heated Pool"] },
  { id: 1010, city_id: 1, name: "The Taj Mahal Palace", tier: "Iconic Lux", price_per_night: 28000, priceINR: 28000, rating: 5.0, location: "Apollo Bunder", amenities: ["Historic Heritage Wing", "Harbour View", "Luxury Yacht Rental"] },

  // 2. New Delhi & NCR (2001 - 2010)
  { id: 2001, city_id: 2, name: "Bloomrooms @ Janpath", tier: "Budget Bout.", price_per_night: 2800, priceINR: 2800, rating: 4.3, location: "Connaught Place", amenities: ["Signature Cloud Beds", "Cafe", "Central Location"] },
  { id: 2002, city_id: 2, name: "Vivanta New Delhi, Dwarka", tier: "4-Star", price_per_night: 5500, priceINR: 5500, rating: 4.4, location: "Dwarka", amenities: ["Outdoor Pool", "Spa", "Airport Shuttle"] },
  { id: 2003, city_id: 2, name: "The Claridges New Delhi", tier: "Heritage 5*", price_per_night: 9500, priceINR: 9500, rating: 4.6, location: "Lutyens Delhi", amenities: ["Dhaba Restaurant", "Garden Pool", "Colonial Charm"] },
  { id: 2004, city_id: 2, name: "Shangri-La Eros New Delhi", tier: "5-Star Lux", price_per_night: 11000, priceINR: 11000, rating: 4.7, location: "Connaught Place", amenities: ["Horizon Club", "Chi Spa", "Italian Dining"] },
  { id: 2005, city_id: 2, name: "ITC Maurya", tier: "5-Star Lux", price_per_night: 13000, priceINR: 13000, rating: 4.8, location: "Diplomatic Enclave", amenities: ["Bukhara & Dum Pukht", "Luxury Spa", "Art Collection"] },
  { id: 2006, city_id: 2, name: "Taj Mahal, New Delhi", tier: "5-Star Lux", price_per_night: 16000, priceINR: 16000, rating: 4.8, location: "Mansingh Road", amenities: ["Machan Dining", "Taj Club Lounge", "Lush Lawns"] },
  { id: 2007, city_id: 2, name: "The Lodhi", tier: "Boutique Lux", price_per_night: 18500, priceINR: 18500, rating: 4.9, location: "Lodhi Road", amenities: ["Private Plunge Pool Rooms", "Tennis Courts", "Boutique Spa"] },
  { id: 2008, city_id: 2, name: "The Imperial New Delhi", tier: "Heritage Ultra", price_per_night: 21000, priceINR: 21000, rating: 4.9, location: "Janpath", amenities: ["Museum-grade Art", "1911 Bar", "Imperial Spa"] },
  { id: 2009, city_id: 2, name: "The Oberoi, New Delhi", tier: "Ultra Lux", price_per_night: 23000, priceINR: 23000, rating: 4.9, location: "Golf Links", amenities: ["Clean Air Technology", "Golf Course Views", "Heated Pools"] },
  { id: 2010, city_id: 2, name: "The Leela Palace New Delhi", tier: "Ultra Lux", price_per_night: 26000, priceINR: 26000, rating: 5.0, location: "Chanakyapuri", amenities: ["Rooftop Infinity Pool", "MEGU Japanese", "Royal Butler Service"] },

  // 3. Jaipur (3001 - 3010)
  { id: 3001, city_id: 3, name: "Hotel Pearl Palace", tier: "Heritage Bud.", price_per_night: 1800, priceINR: 1800, rating: 4.4, location: "Ajmer Road", amenities: ["Peacock Rooftop Cafe", "Antique Decor", "Travel Desk"] },
  { id: 3002, city_id: 3, name: "Umaid Bhawan Heritage House", tier: "Heritage Mid", price_per_night: 3200, priceINR: 3200, rating: 4.5, location: "Bani Park", amenities: ["Rooftop Pool", "Carved Balconies", "Live Folk Music"] },
  { id: 3003, city_id: 3, name: "Shahpura House", tier: "Heritage 4*", price_per_night: 5500, priceINR: 5500, rating: 4.6, location: "Bani Park", amenities: ["Frescoed Suites", "Marble Pool", "Spa & Wellness"] },
  { id: 3004, city_id: 3, name: "ITC Rajputana", tier: "5-Star Lux", price_per_night: 9000, priceINR: 9000, rating: 4.7, location: "Station Road", amenities: ["Red Brick Architecture", "Peshawri Dining", "Royal Spa"] },
  { id: 3005, city_id: 3, name: "Fairmont Jaipur", tier: "5-Star Resort", price_per_night: 14000, priceINR: 14000, rating: 4.8, location: "Kukas / Aravallis", amenities: ["Fort-style Luxury", "Hot Air Ballooning", "Grand Ballroom"] },
  { id: 3006, city_id: 3, name: "Taj Jai Mahal Palace", tier: "Heritage 5*", price_per_night: 18000, priceINR: 18000, rating: 4.8, location: "Civil Lines", amenities: ["18-Acre Mughal Gardens", "Heritage Palace", "Giant Chessboard"] },
  { id: 3007, city_id: 3, name: "Alila Fort Bishangarh", tier: "Heritage Res.", price_per_night: 22000, priceINR: 22000, rating: 4.9, location: "Bishangarh", amenities: ["230-year-old Warrior Fort", "Granite Dungeon Spa", "Helipad"] },
  { id: 3008, city_id: 3, name: "SUJÁN Rajmahal Palace", tier: "Boutique Lux", price_per_night: 35000, priceINR: 35000, rating: 4.9, location: "Sardar Patel Marg", amenities: ["Iconic Pastel Wallpapers", "Royal Polo Heritage", "Art Deco Pool"] },
  { id: 3009, city_id: 3, name: "The Oberoi Rajvilas", tier: "Ultra Lux Res.", price_per_night: 45000, priceINR: 45000, rating: 5.0, location: "Goner Road", amenities: ["Luxury Tents", "Private Villa Pools", "Ancient Shiva Temple"] },
  { id: 3010, city_id: 3, name: "Rambagh Palace", tier: "Palace Ultra", price_per_night: 55000, priceINR: 55000, rating: 5.0, location: "Bhawani Singh Road", amenities: ["Former Maharaja Residence", "Suvarna Mahal Fine Dining", "Peacock Gardens"] },

  // 4. Bengaluru (4001 - 4010)
  { id: 4001, city_id: 4, name: "Villa 302", tier: "Budget Stay", price_per_night: 2200, priceINR: 2200, rating: 4.2, location: "Koramangala", amenities: ["Cozy Rooms", "Free Wi-Fi", "Kitchenette"] },
  { id: 4002, city_id: 4, name: "Bloom Hotel - Indiranagar", tier: "Budget Bout.", price_per_night: 3000, priceINR: 3000, rating: 4.4, location: "Indiranagar", amenities: ["Bright Minimalist Decor", "High-speed Wi-Fi", "Cafe"] },
  { id: 4003, city_id: 4, name: "St. Mark's Hotel", tier: "4-Star", price_per_night: 5200, priceINR: 5200, rating: 4.4, location: "St. Mark's Road", amenities: ["Terrace Restaurant", "Gym", "Central CBD"] },
  { id: 4004, city_id: 4, name: "Grand Mercure Bengaluru", tier: "5-Star", price_per_night: 7500, priceINR: 7500, rating: 4.6, location: "Koramangala", amenities: ["Suite-only Living", "Poolside Dining", "Spa"] },
  { id: 4005, city_id: 4, name: "ITC Gardenia", tier: "5-Star Lux", price_per_night: 11000, priceINR: 11000, rating: 4.7, location: "Residency Road", amenities: ["LEED Platinum Certified", "Windsor Pub", "Helipad"] },
  { id: 4006, city_id: 4, name: "JW Marriott Hotel Bengaluru", tier: "5-Star Lux", price_per_night: 13500, priceINR: 13500, rating: 4.8, location: "Lavelle Road / UB City", amenities: ["UB City View", "Alba Italian", "Infinity Pool"] },
  { id: 4007, city_id: 4, name: "Taj West End", tier: "Heritage 5*", price_per_night: 15000, priceINR: 15000, rating: 4.9, location: "Race Course Road", amenities: ["130-Year Heritage", "20-Acre Gardens", "Mynt Cafe"] },
  { id: 4008, city_id: 4, name: "The Oberoi, Bengaluru", tier: "5-Star Lux", price_per_night: 16500, priceINR: 16500, rating: 4.9, location: "MG Road", amenities: ["Centuries-old Samanea Tree", "Private Garden Balconies", "Rim Naam Thai"] },
  { id: 4009, city_id: 4, name: "The Ritz-Carlton, Bangalore", tier: "Ultra Lux", price_per_night: 18000, priceINR: 18000, rating: 4.9, location: "Residency Road", amenities: ["Bang Rooftop Bar", "Jaali Architecture", "Ritz Spa"] },
  { id: 4010, city_id: 4, name: "The Leela Palace Bengaluru", tier: "Ultra Lux", price_per_night: 21000, priceINR: 21000, rating: 5.0, location: "Old Airport Road", amenities: ["Vijayanagara Architecture", "9 Acres of Lagoon Gardens", "Royal Butler"] },

  // 5. Varanasi (5001 - 5010)
  { id: 5001, city_id: 5, name: "Wanderlust Hostel Varanasi", tier: "Hostel/Bud.", price_per_night: 1200, priceINR: 1200, rating: 4.3, location: "Near Ghats", amenities: ["Rooftop Cafe", "Social Events", "Clean Dorms/Rooms"] },
  { id: 5002, city_id: 5, name: "Ganges Grand", tier: "Budget Hotel", price_per_night: 2500, priceINR: 2500, rating: 4.1, location: "Godowlia", amenities: ["Vegetarian Restaurant", "Travel Desk", "AC Rooms"] },
  { id: 5003, city_id: 5, name: "Palace On Ganges", tier: "Heritage Bud.", price_per_night: 3800, priceINR: 3800, rating: 4.3, location: "Assi Ghat", amenities: ["Heritage Theme Rooms", "Ghat View Rooftop", "Ayurveda"] },
  { id: 5004, city_id: 5, name: "Hotel Surya, Kaiser Palace", tier: "Heritage Mid", price_per_night: 4500, priceINR: 4500, rating: 4.4, location: "Cantonment", amenities: ["1810 Palace Grounds", "Swimming Pool", "Lawn Dining"] },
  { id: 5005, city_id: 5, name: "Clarks Varanasi", tier: "4-Star", price_per_night: 6000, priceINR: 6000, rating: 4.3, location: "Cantonment", amenities: ["Heritage Property", "Outdoor Pool", "Garden Cafe"] },
  { id: 5006, city_id: 5, name: "Tree of Life Resort & Spa", tier: "Boutique Res.", price_per_night: 9500, priceINR: 9500, rating: 4.7, location: "Seer Goverdhanpur", amenities: ["Luxury Suites", "Private Courtyards", "Tranquil Oasis"] },
  { id: 5007, city_id: 5, name: "Radisson Hotel Varanasi", tier: "5-Star", price_per_night: 10000, priceINR: 10000, rating: 4.6, location: "Cantonment", amenities: ["The Great Kabab Factory", "Spa", "Fitness Center"] },
  { id: 5008, city_id: 5, name: "The Gateway Hotel Ganges", tier: "5-Star", price_per_night: 12000, priceINR: 12000, rating: 4.6, location: "Nadesar Palace Grounds", amenities: ["40 Acres Greenery", "Taj Hospitality", "Varuna Restaurant"] },
  { id: 5009, city_id: 5, name: "Taj Ganges, Varanasi", tier: "5-Star Lux", price_per_night: 15000, priceINR: 15000, rating: 4.8, location: "Cantonment", amenities: ["Jiva Spa", "Lush Lawns", "Luxury Concierge"] },
  { id: 5010, city_id: 5, name: "BrijRama Palace", tier: "Heritage Pal.", price_per_night: 24000, priceINR: 24000, rating: 4.9, location: "Darbhanga Ghat", amenities: ["Direct Ghat Location", "Private Bajra Boat Access", "Classical Live Sitar"] },

  // 6. Udaipur (6001 - 6010)
  { id: 6001, city_id: 6, name: "Hotel Lakend", tier: "Bud. Heritage", price_per_night: 2500, priceINR: 2500, rating: 4.3, location: "Fateh Sagar Lake", amenities: ["Lakeside Lawn", "Infinity Pool", "Lake View Dining"] },
  { id: 6002, city_id: 6, name: "Jagat Niwas Palace Hotel", tier: "Heritage Bout.", price_per_night: 4800, priceINR: 4800, rating: 4.6, location: "Lal Ghat", amenities: ["17th-Century Haveli", "Jharokha Seating", "Direct Lake View"] },
  { id: 6003, city_id: 6, name: "Amet Haveli", tier: "Heritage Stay", price_per_night: 6200, priceINR: 6200, rating: 4.7, location: "Hanuman Ghat", amenities: ["Ambrai Lakeside Restaurant", "Old World Charm", "Garden Courtyard"] },
  { id: 6004, city_id: 6, name: "Chundavada Palace", tier: "Heritage Hotel", price_per_night: 7500, priceINR: 7500, rating: 4.5, location: "Haridas Ji Ki Magri", amenities: ["Traditional Mewar Murals", "Swimming Pool", "Spa"] },
  { id: 6005, city_id: 6, name: "Fateh Garh Resort", tier: "Heritage Res.", price_per_night: 9500, priceINR: 9500, rating: 4.7, location: "Sisarma", amenities: ["Hilltop Lake View", "Heritage Car Museum", "Zip-line"] },
  { id: 6006, city_id: 6, name: "Trident Udaipur", tier: "5-Star", price_per_night: 14000, priceINR: 14000, rating: 4.7, location: "Haridas Ji Ki Magri", amenities: ["43 Acres of Lawns", "Kids Club", "BrijRama Cuisine"] },
  { id: 6007, city_id: 6, name: "RAAS Devigarh", tier: "Heritage Pal.", price_per_night: 26000, priceINR: 26000, rating: 4.9, location: "Delwara", amenities: ["18th-Century Fortress", "Contemporary Minimalist Suites", "Ila Spa"] },
  { id: 6008, city_id: 6, name: "The Leela Palace Udaipur", tier: "Palace Lux", price_per_night: 42000, priceINR: 42000, rating: 5.0, location: "Lake Pichola", amenities: ["Boat Arrival", "Lake Facing Suites", "ESPA Spa Tent"] },
  { id: 6009, city_id: 6, name: "Taj Lake Palace", tier: "Heritage Ultra", price_per_night: 48000, priceINR: 48000, rating: 5.0, location: "Middle of Lake Pichola", amenities: ["1746 Floating Palace", "Jiva Spa Boat", "Royal Butler Service"] },
  { id: 6010, city_id: 6, name: "The Oberoi Udaivilas", tier: "Iconic Ultra", price_per_night: 52000, priceINR: 52000, rating: 5.0, location: "Haridas Ji Ki Magri", amenities: ["Semi-private Moat Pools", "Peacock Sanctuaries", "Bespoke Royal Dining"] },

  // 7. Kolkata (7001 - 7010)
  { id: 7001, city_id: 7, name: "Fairlawn Hotel", tier: "Heritage Bud.", price_per_night: 2200, priceINR: 2200, rating: 4.2, location: "Sudder Street", amenities: ["1783 Colonial Inn", "Leafy Beer Garden", "Antique Memorabilia"] },
  { id: 7002, city_id: 7, name: "The Peerless Inn", tier: "3-Star", price_per_night: 3500, priceINR: 3500, rating: 4.1, location: "Esplanade", amenities: ["Aaheli Bengali Cuisine", "City Center Location", "Gym"] },
  { id: 7003, city_id: 7, name: "Peerless Hotel Kolkata", tier: "4-Star", price_per_night: 4800, priceINR: 4800, rating: 4.3, location: "Chowringhee", amenities: ["Modern Amenities", "Fine Dining", "Business Center"] },
  { id: 7004, city_id: 7, name: "Swissôtel Kolkata", tier: "4-Star", price_per_night: 6500, priceINR: 6500, rating: 4.4, location: "New Town", amenities: ["Rooftop Pool", "Connected to City Centre Mall", "Spa"] },
  { id: 7005, city_id: 7, name: "The Lalit Great Eastern", tier: "Heritage 5*", price_per_night: 8000, priceINR: 8000, rating: 4.6, location: "Dalhousie Square", amenities: ["Asia's First Luxury Hotel (1840)", "Bakery", "Rejuve Spa"] },
  { id: 7006, city_id: 7, name: "The Park Kolkata", tier: "Boutique 5*", price_per_night: 9000, priceINR: 9000, rating: 4.5, location: "Park Street", amenities: ["Tantra Nightclub", "Someplace Else Pub", "Aura Spa"] },
  { id: 7007, city_id: 7, name: "JW Marriott Hotel Kolkata", tier: "5-Star Lux", price_per_night: 11000, priceINR: 11000, rating: 4.8, location: "EM Bypass", amenities: ["Infinity Pool", "Vintage Asia Dining", "Grand Ballroom"] },
  { id: 7008, city_id: 7, name: "Taj Bengal Kolkata", tier: "5-Star Lux", price_per_night: 13000, priceINR: 13000, rating: 4.8, location: "Alipore", amenities: ["Atrium Lobby", "Sonargaon Restaurant", "Lush Lawns"] },
  { id: 7009, city_id: 7, name: "ITC Royal Bengal", tier: "5-Star Lux", price_per_night: 14500, priceINR: 14500, rating: 4.9, location: "EM Bypass", amenities: ["Aristocratic Bengal Architecture", "Grand Spa", "Royal Italian Dining"] },
  { id: 7010, city_id: 7, name: "The Oberoi Grand Kolkata", tier: "Heritage Ultra", price_per_night: 17000, priceINR: 17000, rating: 4.9, location: "Chowringhee", amenities: ["'Grande Dame of Chowringhee'", "Colonial Palm Courtyard", "Luxury Spa"] },

  // 8. Kochi (8001 - 8010)
  { id: 8001, city_id: 8, name: "Tissa's Inn", tier: "Budget Bout.", price_per_night: 2200, priceINR: 2200, rating: 4.2, location: "Fort Kochi", amenities: ["Boutique Art Stay", "Rooftop Pool", "Fresh Seafood Cafe"] },
  { id: 8002, city_id: 8, name: "Casino Hotel Kochi", tier: "3-Star", price_per_night: 3500, priceINR: 3500, rating: 4.3, location: "Willingdon Island", amenities: ["Seafood Speciality", "Swimming Pool", "Ayurvedic Center"] },
  { id: 8003, city_id: 8, name: "Eighth Bastion - CGH Earth", tier: "Heritage Mid", price_per_night: 5000, priceINR: 5000, rating: 4.6, location: "Fort Kochi", amenities: ["Dutch-influenced Architecture", "Plunge Pool", "Eco-friendly"] },
  { id: 8004, city_id: 8, name: "Forte Kochi", tier: "Heritage Bout.", price_per_night: 6800, priceINR: 6800, rating: 4.7, location: "Princess Street", amenities: ["Restored Portuguese Villa", "Courtyard Pool", "Central Fort Kochi"] },
  { id: 8005, city_id: 8, name: "Old Harbour Hotel", tier: "Heritage Bout.", price_per_night: 8000, priceINR: 8000, rating: 4.8, location: "Fort Kochi", amenities: ["300-year-old Dutch House", "Open Air Garden Dining", "Pool"] },
  { id: 8006, city_id: 8, name: "Fragrant Nature Kochi", tier: "5-Star Bout.", price_per_night: 9000, priceINR: 9000, rating: 4.7, location: "Calvathy", amenities: ["Harbour Views", "Flint House Dining", "State-of-art Spa"] },
  { id: 8007, city_id: 8, name: "Malabar House", tier: "Relais & Châteaux", price_per_night: 12000, priceINR: 12000, rating: 4.8, location: "Parade Ground", amenities: ["Design Heritage Hotel", "Wine Lounge", "Art Collections"] },
  { id: 8008, city_id: 8, name: "Grand Hyatt Kochi Bolgatty", tier: "5-Star Resort", price_per_night: 13500, priceINR: 13500, rating: 4.9, location: "Bolgatty Island", amenities: ["Waterfront Resort", "Santata Spa", "Marina Access"] },
  { id: 8009, city_id: 8, name: "Taj Malabar Resort & Spa", tier: "5-Star Lux", price_per_night: 16000, priceINR: 16000, rating: 4.8, location: "Willingdon Island", amenities: ["Harbour Facing Infinity Pool", "Jiva Spa", "Rice Boat Dining"] },
  { id: 8010, city_id: 8, name: "Brunton Boatyard - CGH Earth", tier: "Heritage Ultra", price_per_night: 18000, priceINR: 18000, rating: 4.9, location: "Fort Kochi Pier", amenities: ["Historic Shipyard Restoration", "Harbour View Balconies", "Sunset Boat Cruises"] },

  // 9. Hyderabad (9001 - 9010)
  { id: 9001, city_id: 9, name: "Mercure Hyderabad KCP", tier: "3-Star", price_per_night: 3200, priceINR: 3200, rating: 4.2, location: "Somajiguda", amenities: ["Hussain Sagar View", "Fitness Center", "All Day Dining"] },
  { id: 9002, city_id: 9, name: "The Park Hyderabad", tier: "Boutique 4*", price_per_night: 4800, priceINR: 4800, rating: 4.4, location: "Somajiguda", amenities: ["Lakefront 3D Facade", "Aish Nizami Dining", "Infinity Pool"] },
  { id: 9003, city_id: 9, name: "Novotel Convention Centre", tier: "4-Star", price_per_night: 6500, priceINR: 6500, rating: 4.4, location: "HITEC City", amenities: ["Convention Grounds", "Pool", "Mexican/Asian Dining"] },
  { id: 9004, city_id: 9, name: "Oakwood Residence Kapil", tier: "Serviced Apt.", price_per_night: 7200, priceINR: 7200, rating: 4.5, location: "Gachibowli", amenities: ["Kitchenettes", "Indoor Heated Pool", "Long-stay luxury"] },
  { id: 9005, city_id: 9, name: "Trident Hyderabad", tier: "5-Star", price_per_night: 10500, priceINR: 10500, rating: 4.7, location: "HITEC City", amenities: ["Business Luxury", "Spa", "Kanata Indian Cuisine"] },
  { id: 9006, city_id: 9, name: "Taj Krishna", tier: "5-Star Lux", price_per_night: 11500, priceINR: 11500, rating: 4.7, location: "Banjara Hills", amenities: ["Lush Landscaped Grounds", "Firdaus Dining", "Taj Club"] },
  { id: 9007, city_id: 9, name: "The Westin Hyderabad", tier: "5-Star Lux", price_per_night: 13000, priceINR: 13000, rating: 4.7, location: "Mindspace Tech Park", amenities: ["Heavenly Bed", "Heavenly Spa", "Kangan Northwest Dining"] },
  { id: 9008, city_id: 9, name: "Park Hyatt Hyderabad", tier: "5-Star Lux", price_per_night: 15000, priceINR: 15000, rating: 4.8, location: "Banjara Hills", amenities: ["Manor Living", "Art Collections", "Ristorante Tre-Forni"] },
  { id: 9009, city_id: 9, name: "ITC Kohenur", tier: "5-Star Lux", price_per_night: 16500, priceINR: 16500, rating: 4.9, location: "HITEC City / Durgam Cheruvu", amenities: ["Koh-i-Noor Inspired Facade", "Lake View Suites", "Ottimo Dining"] },
  { id: 9010, city_id: 9, name: "Taj Falaknuma Palace", tier: "Palace Ultra", price_per_night: 45000, priceINR: 45000, rating: 5.0, location: "Engine Bowli / Falaknuma", amenities: ["'Mirror of the Sky' Palace", "Horse-drawn Carriage Arrival", "101-seat Dining Table"] },

  // 10. Goa (10001 - 10010)
  { id: 10001, city_id: 10, name: "Heritage Village Resort", tier: "3-Star Res.", price_per_night: 3800, priceINR: 3800, rating: 4.3, location: "Arossim Beach", amenities: ["All-inclusive options", "Ayurvedic Spa", "Garden Pool"] },
  { id: 10002, city_id: 10, name: "Cidade de Goa - IHCL", tier: "4-Star Res.", price_per_night: 6500, priceINR: 6500, rating: 4.4, location: "Vainguinim Beach", amenities: ["Portuguese Hamlet Design", "Private Beach", "Alfama Dining"] },
  { id: 10003, city_id: 10, name: "Postcard Velha", tier: "Boutique Stay", price_per_night: 9000, priceINR: 9000, rating: 4.7, location: "Old Goa", amenities: ["Hidden Sanctuary", "Artisanal Dining", "Lush Forest Views"] },
  { id: 10004, city_id: 10, name: "Ahilya By The Sea", tier: "Boutique Res.", price_per_night: 12000, priceINR: 12000, rating: 4.8, location: "Nerul / Dolphin Bay", amenities: ["Seafront Villas", "Infinity Plunge Pools", "Bespoke Cuisine"] },
  { id: 10005, city_id: 10, name: "Grand Hyatt Goa", tier: "5-Star Res.", price_per_night: 14000, priceINR: 14000, rating: 4.8, location: "Bambolim Bay", amenities: ["28-Acre Estate", "Shamana Spa", "Indoor & Outdoor Pools"] },
  { id: 10006, city_id: 10, name: "Alila Diwa Goa", tier: "5-Star Lux", price_per_night: 15500, priceINR: 15500, rating: 4.8, location: "Majorda", amenities: ["Paddy Field Infinity Pool", "Diwa Club", "Spa Alila"] },
  { id: 10007, city_id: 10, name: "ITC Grand Goa Resort", tier: "5-Star Res.", price_per_night: 17000, priceINR: 17000, rating: 4.8, location: "Arossim Beach", amenities: ["Indo-Portuguese Village", "Multi-tiered Pool", "Direct Beach"] },
  { id: 10008, city_id: 10, name: "W Goa", tier: "Lifestyle Lux", price_per_night: 19000, priceINR: 19000, rating: 4.8, location: "Vagator Beach", amenities: ["Rockpool Sunset Lounge", "Away Spa", "Chic Designer Living"] },
  { id: 10009, city_id: 10, name: "Taj Exotica Resort & Spa", tier: "Ultra Lux Res.", price_per_night: 22000, priceINR: 22000, rating: 4.9, location: "Benaulim Beach", amenities: ["56-Acre Mediterranean Resort", "Golf Course", "Jiva Spa"] },
  { id: 10010, city_id: 10, name: "The Leela Goa", tier: "Ultra Lux Res.", price_per_night: 25000, priceINR: 25000, rating: 5.0, location: "Mobor Beach / Cavelossim", amenities: ["75-Acre Lagoon Paradise", "Private Beach", "12-Hole Golf"] }
];

// Unified destination structure helper
const GLOBE_TROTTER_DATA = CITIES_DATA.map(city => ({
  ...city,
  activities: ACTIVITIES_DATA.filter(a => a.city_id === city.id),
  hotels: HOTELS_DATA.filter(h => h.city_id === city.id)
}));

// Curated Presets
const PRESET_TIERS = {
  backpacker: {
    id: "backpacker",
    name: "Backpacker / Budget Nomad",
    badge: "Budget Friendly",
    color: "emerald",
    icon: "backpack",
    description: "Hostel & budget stays with top-rated free walks and iconic budget experiences.",
    hotelSelector: (hotels) => hotels[0],
    activitySelector: (activities) => activities.filter(a => a.price_per_person <= 300).slice(0, 4)
  },
  cultural: {
    id: "cultural",
    name: "Cultural Connoisseur",
    badge: "Most Popular",
    color: "amber",
    icon: "compass",
    description: "Charming 4-Star & Heritage boutique hotels with culinary, museum, and cultural highlights.",
    hotelSelector: (hotels) => hotels.find(h => h.price_per_night >= 5000 && h.price_per_night <= 10000) || hotels[2],
    activitySelector: (activities) => activities.filter(a => ['Heritage', 'Culture', 'Food', 'Spiritual'].includes(a.category)).slice(0, 5)
  },
  luxury: {
    id: "luxury",
    name: "Royal Heritage & Ultra Lux",
    badge: "Ultra Luxury",
    color: "purple",
    icon: "crown",
    description: "Iconic royal palaces, 5-star suites, and bespoke private tours and sunset cruises.",
    hotelSelector: (hotels) => hotels[hotels.length - 1],
    activitySelector: (activities) => activities.filter(a => a.highlight || a.price_per_person > 200).slice(0, 6)
  }
};

// Supported Currencies
const CURRENCIES = {
  INR: { symbol: "₹", rate: 1, name: "Indian Rupee" },
  USD: { symbol: "$", rate: 0.012, name: "US Dollar" },
  EUR: { symbol: "€", rate: 0.011, name: "Euro" },
  GBP: { symbol: "£", rate: 0.0095, name: "British Pound" },
  AED: { symbol: "AED ", rate: 0.044, name: "UAE Dirham" },
  SGD: { symbol: "S$", rate: 0.016, name: "Singapore Dollar" }
};
