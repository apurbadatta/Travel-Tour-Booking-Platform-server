import mongoose from 'mongoose';
import Category from './models/Category.model';
import Destination from './models/Destination.model';
import Tour from './models/Tour.model';
import User from './models/User.model';
import Booking from './models/Booking.model';
import { getAuth } from './config/auth';

const adminUserId = new mongoose.Types.ObjectId();

const categories = [
  { name: 'Adventure', description: 'Thrilling outdoor activities and expeditions', icon: 'Mountain' },
  { name: 'Nature', description: 'Explore the natural beauty of Bangladesh', icon: 'TreePine' },
  { name: 'Beach', description: 'Relax at pristine coastal destinations', icon: 'Waves' },
  { name: 'Cultural', description: 'Immerse yourself in local traditions and heritage', icon: 'Landmark' },
  { name: 'Trekking', description: 'Hike through hills, forests, and valleys', icon: 'Footprints' },
  { name: 'Wildlife', description: 'Discover diverse flora and fauna', icon: 'Bird' },
  { name: 'Spiritual', description: 'Visit sacred sites and peaceful retreats', icon: 'Heart' },
  { name: 'Luxury', description: 'Premium experiences with top-tier comfort', icon: 'Crown' },
];

const destinations = [
  { name: 'Sundarbans', description: "The world's largest mangrove forest, home to the Royal Bengal Tiger", region: 'Khulna', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80' },
  { name: 'Sajek Valley', description: 'A breathtaking valley in the Chittagong Hill Tracts', region: 'Chittagong', image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80' },
  { name: "Cox's Bazar", description: "The world's longest natural sandy beach stretching 120 km", region: 'Chittagong', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80' },
  { name: 'Bandarban', description: 'Pristine hills and tribal culture in the Chittagong Hill Tracts', region: 'Chittagong', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80' },
  { name: 'Rangamati', description: 'A serene district known for Kaptai Lake and tribal heritage', region: 'Chittagong', image: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&q=80' },
  { name: "Saint Martin's Island", description: "Bangladesh's only coral island with crystal-clear waters", region: 'Chittagong', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80' },
  { name: 'Kuakata', description: 'The daughter of the sea, offering panoramic sunrise and sunset views', region: 'Barisal', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80' },
  { name: 'Sylhet', description: 'The land of green valleys, tea gardens, and spiritual shrines', region: 'Sylhet', image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80' },
  { name: 'Jaflong', description: 'A hill station famous for stone collection', region: 'Sylhet', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80' },
  { name: 'Ratargul', description: 'The only freshwater swamp forest in Bangladesh', region: 'Sylhet', image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80' },
  { name: 'Madhabkunda', description: 'One of the largest waterfalls in Bangladesh', region: 'Sylhet', image: 'https://images.unsplash.com/photo-1432405972618-c6b0cfba8b41?w=800&q=80' },
  { name: 'Lawachara', description: 'A national park famous for hoolock gibbons', region: 'Sylhet', image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80' },
  { name: 'Teknaf', description: 'The southeastern tip of Bangladesh with hills meeting the sea', region: 'Chittagong', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80' },
  { name: 'Nafakhum', description: 'The largest waterfall in Bangladesh', region: 'Chittagong', image: 'https://images.unsplash.com/photo-1432405972618-c6b0cfba8b41?w=800&q=80' },
  { name: 'Dhaka', description: 'The vibrant capital city rich in history and culture', region: 'Dhaka', image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80' },
];

const tours = [
  {
    title: 'Sundarbans Mangrove Explorer',
    description: "Embark on a 3-day adventure through the world's largest mangrove forest. Navigate the winding waterways by boat, spot the elusive Royal Bengal Tiger, and witness crocodiles basking in the sun.",
    shortDescription: '3-day boat safari through the Sundarbans with wildlife spotting.',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80'],
    price: 15000,
    duration: { days: 3, nights: 2 },
    maxGroupSize: 12,
    difficulty: 'moderate',
    departureLocation: 'Dhaka',
    startPoint: 'Dhaka',
    endPoint: 'Dhaka',
    highlights: ['Boat safari through mangrove waterways', 'Wildlife spotting - tigers, crocodiles, deer', 'Guided forest walks', 'Traditional Bengali meals'],
    included: ['Accommodation', 'All meals', 'Boat transfers', 'Guide', 'Entry permits'],
    excluded: ['Personal expenses', 'Tips', 'Travel insurance'],
    category: 'Adventure',
    destination: 'Sundarbans',
    ratings: { average: 4.8, count: 124 },
    isFeatured: true,
    status: 'approved',
  },
  {
    title: 'Sajek Valley Trek',
    description: 'A breathtaking 2-day trek through the Sajek Valley, known as the Queen of Hills. Watch the sunrise above the clouds and experience tribal hospitality.',
    shortDescription: '2-day trek to the Queen of Hills with sunrise views.',
    thumbnail: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80'],
    price: 8500,
    duration: { days: 2, nights: 1 },
    maxGroupSize: 15,
    difficulty: 'easy',
    departureLocation: 'Dhaka',
    startPoint: 'Dhaka',
    endPoint: 'Dhaka',
    highlights: ['Sunrise above the clouds', 'Tribal village visit', 'Helipad viewpoint trek'],
    included: ['Transport', 'Accommodation', 'Meals', 'Guide'],
    excluded: ['Personal expenses', 'Tips'],
    category: 'Trekking',
    destination: 'Sajek Valley',
    ratings: { average: 4.9, count: 89 },
    isFeatured: true,
    status: 'approved',
  },
  {
    title: "Cox's Bazar Beach Escape",
    description: "Relax at the world's longest natural beach with a 3-day beach getaway. Enjoy seafood, sunset views, and water sports.",
    shortDescription: "3-day beach getaway at the world's longest natural beach.",
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80'],
    price: 12000,
    duration: { days: 3, nights: 2 },
    maxGroupSize: 20,
    difficulty: 'easy',
    departureLocation: 'Dhaka',
    startPoint: 'Dhaka',
    endPoint: 'Dhaka',
    highlights: ['120km beach walk', 'Sunset at Inani Beach', 'Seafood dinner', 'Water sports'],
    included: ['Hotel', 'Breakfast', 'Transport', 'Guide'],
    excluded: ['Lunch/Dinner', 'Water sports fees'],
    category: 'Beach',
    destination: "Cox's Bazar",
    ratings: { average: 4.7, count: 203 },
    isFeatured: true,
    status: 'approved',
  },
  {
    title: 'Bandarban Hill Expedition',
    description: 'Explore the pristine hills and tribal culture of Bandarban in this 4-day expedition. Visit remote villages, trek to Boga Lake, and witness the Golden Temple.',
    shortDescription: '4-day expedition through Bandarban hills and tribal villages.',
    thumbnail: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80'],
    price: 18000,
    duration: { days: 4, nights: 3 },
    maxGroupSize: 10,
    difficulty: 'moderate',
    departureLocation: 'Dhaka',
    startPoint: 'Dhaka',
    endPoint: 'Dhaka',
    highlights: ['Boga Lake trek', 'Tribal village homestay', 'Golden Temple visit', 'Mountain sunrise'],
    included: ['Accommodation', 'All meals', 'Guide', 'Transport'],
    excluded: ['Personal gear', 'Tips'],
    category: 'Trekking',
    destination: 'Bandarban',
    ratings: { average: 4.9, count: 67 },
    isFeatured: true,
    status: 'approved',
  },
  {
    title: 'Sundarbans Wildlife Safari',
    description: 'A premium 4-day wildlife safari deep into the Sundarbans. Spot Royal Bengal Tigers, saltwater crocodiles, and exotic birds.',
    shortDescription: '4-day premium wildlife safari in the Sundarbans.',
    thumbnail: 'https://images.unsplash.com/photo-1549366021-9f761d450615?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1549366021-9f761d450615?w=1200&q=80'],
    price: 22000,
    duration: { days: 4, nights: 3 },
    maxGroupSize: 8,
    difficulty: 'moderate',
    departureLocation: 'Dhaka',
    startPoint: 'Dhaka',
    endPoint: 'Dhaka',
    highlights: ['Tiger tracking', 'Bird watching', 'Night cruise', 'Forest camping'],
    included: ['Premium accommodation', 'All meals', 'Expert guide', 'Boat', 'Permits'],
    excluded: ['International flights', 'Travel insurance'],
    category: 'Wildlife',
    destination: 'Sundarbans',
    ratings: { average: 4.6, count: 45 },
    isFeatured: false,
    status: 'approved',
  },
  {
    title: 'Rangamati Lake Cruise',
    description: 'Enjoy a serene 2-day cruise on Kaptai Lake surrounded by lush green hills. Visit tribal handicraft markets and enjoy fresh fish.',
    shortDescription: '2-day cruise on the scenic Kaptai Lake.',
    thumbnail: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1200&q=80'],
    price: 7500,
    duration: { days: 2, nights: 1 },
    maxGroupSize: 20,
    difficulty: 'easy',
    departureLocation: 'Dhaka',
    startPoint: 'Dhaka',
    endPoint: 'Dhaka',
    highlights: ['Kaptai Lake cruise', 'Tribal handicraft shopping', 'Fresh fish feast', 'Hill views'],
    included: ['Transport', 'Accommodation', 'Meals', 'Boat ride'],
    excluded: ['Shopping', 'Tips'],
    category: 'Nature',
    destination: 'Rangamati',
    ratings: { average: 4.5, count: 78 },
    isFeatured: false,
    status: 'approved',
  },
  {
    title: 'Saint Martin Island Paradise',
    description: 'Escape to Bangladesh only coral island for a 3-day tropical paradise experience. Snorkel in crystal-clear waters and enjoy fresh seafood.',
    shortDescription: '3-day tropical escape to the coral island.',
    thumbnail: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80'],
    price: 14000,
    duration: { days: 3, nights: 2 },
    maxGroupSize: 15,
    difficulty: 'easy',
    departureLocation: 'Dhaka',
    startPoint: 'Dhaka',
    endPoint: 'Dhaka',
    highlights: ['Snorkeling', 'Coral reef exploration', 'Beach BBQ', 'Turtle watching'],
    included: ['Cabin', 'Meals', 'Boat transfer', 'Snorkeling gear'],
    excluded: ['Diving fees', 'Tips'],
    category: 'Beach',
    destination: "Saint Martin's Island",
    ratings: { average: 4.8, count: 156 },
    isFeatured: true,
    status: 'approved',
  },
  {
    title: 'Kuakata Sunrise & Sunset',
    description: 'Experience both sunrise and sunset at Kuakata, the daughter of the sea. A 2-day trip to witness the rare panoramic views.',
    shortDescription: '2-day trip to witness sunrise and sunset at Kuakata.',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80'],
    price: 6500,
    duration: { days: 2, nights: 1 },
    maxGroupSize: 25,
    difficulty: 'easy',
    departureLocation: 'Dhaka',
    startPoint: 'Dhaka',
    endPoint: 'Dhaka',
    highlights: ['Panoramic sunrise', 'Panoramic sunset', 'Rakhine village', 'Beach walk'],
    included: ['Transport', 'Accommodation', 'Meals'],
    excluded: ['Personal expenses'],
    category: 'Beach',
    destination: 'Kuakata',
    ratings: { average: 4.4, count: 92 },
    isFeatured: false,
    status: 'approved',
  },
  {
    title: 'Sylhet Tea Garden Tour',
    description: 'Discover the lush green tea gardens of Sylhet in this 3-day cultural tour. Visit Ratargul swamp forest and Madhabkunda waterfall.',
    shortDescription: '3-day tour through Sylhet tea gardens and waterfalls.',
    thumbnail: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&q=80'],
    price: 9500,
    duration: { days: 3, nights: 2 },
    maxGroupSize: 18,
    difficulty: 'easy',
    departureLocation: 'Dhaka',
    startPoint: 'Dhaka',
    endPoint: 'Dhaka',
    highlights: ['Tea garden walk', 'Ratargul swamp boat ride', 'Madhabkunda waterfall hike', 'Shahi Eidgah'],
    included: ['Transport', 'Hotel', 'Meals', 'Guide'],
    excluded: ['Camera fees', 'Tips'],
    category: 'Nature',
    destination: 'Sylhet',
    ratings: { average: 4.7, count: 134 },
    isFeatured: true,
    status: 'approved',
  },
  {
    title: 'Lalbagh Fort Heritage Walk',
    description: 'Step back in time with a guided heritage walk through Dhaka historic Lalbagh Fort and surrounding Mughal architecture.',
    shortDescription: 'Guided heritage walk through Mughal-era Dhaka.',
    thumbnail: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&q=80'],
    price: 3000,
    duration: { days: 1, nights: 0 },
    maxGroupSize: 30,
    difficulty: 'easy',
    departureLocation: 'Dhaka',
    startPoint: 'Lalbagh Fort',
    endPoint: 'Ahsan Manzil',
    highlights: ['Lalbagh Fort tour', 'Mughal architecture', 'Ahsan Manzil visit', 'Street food tasting'],
    included: ['Guide', 'Entry tickets', 'Lunch'],
    excluded: ['Transport to meeting point', 'Shopping'],
    category: 'Cultural',
    destination: 'Dhaka',
    ratings: { average: 4.3, count: 210 },
    isFeatured: false,
    status: 'approved',
  },
  {
    title: 'Jaflong Stone Collection Trip',
    description: 'Visit the beautiful Jaflong hill station famous for its stone collection and natural beauty. A perfect day trip from Sylhet.',
    shortDescription: 'Day trip to Jaflong stone collection site.',
    thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80'],
    price: 4500,
    duration: { days: 1, nights: 0 },
    maxGroupSize: 20,
    difficulty: 'easy',
    departureLocation: 'Sylhet',
    startPoint: 'Sylhet City',
    endPoint: 'Sylhet City',
    highlights: ['Stone collection site', 'River views', 'Hill trek', 'Local snacks'],
    included: ['Transport', 'Guide', 'Lunch'],
    excluded: ['Personal expenses', 'Tips'],
    category: 'Nature',
    destination: 'Jaflong',
    ratings: { average: 4.2, count: 88 },
    isFeatured: false,
    status: 'approved',
  },
  {
    title: 'Lawachara Rainforest Trek',
    description: 'Trek through the ancient Lawachara National Park, home to the endangered hoolock gibbons and diverse tropical wildlife.',
    shortDescription: 'Trek through ancient rainforest with wildlife spotting.',
    thumbnail: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80'],
    price: 5500,
    duration: { days: 1, nights: 0 },
    maxGroupSize: 15,
    difficulty: 'moderate',
    departureLocation: 'Sylhet',
    startPoint: 'Srimangal',
    endPoint: 'Srimangal',
    highlights: ['Hoolock gibbon spotting', 'Tropical tree walk', 'Bird watching', 'Tea estate visit'],
    included: ['Guide', 'Entry permit', 'Lunch', 'Transport'],
    excluded: ['Binoculars', 'Tips'],
    category: 'Wildlife',
    destination: 'Lawachara',
    ratings: { average: 4.6, count: 56 },
    isFeatured: false,
    status: 'approved',
  },
  {
    title: 'Madhabkunda Waterfall Hike',
    description: 'Hike to one of the largest waterfalls in Bangladesh surrounded by lush forest and rolling hills.',
    shortDescription: 'Hike to the magnificent Madhabkunda waterfall.',
    thumbnail: 'https://images.unsplash.com/photo-1432405972618-c6b0cfba8b41?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1432405972618-c6b0cfba8b41?w=1200&q=80'],
    price: 4000,
    duration: { days: 1, nights: 0 },
    maxGroupSize: 20,
    difficulty: 'moderate',
    departureLocation: 'Sylhet',
    startPoint: 'Sylhet City',
    endPoint: 'Sylhet City',
    highlights: ['Waterfall hike', 'Forest trail', 'Natural pool', 'Hilltop views'],
    included: ['Transport', 'Guide', 'Lunch'],
    excluded: ['Personal gear', 'Tips'],
    category: 'Trekking',
    destination: 'Madhabkunda',
    ratings: { average: 4.5, count: 73 },
    isFeatured: false,
    status: 'approved',
  },
  {
    title: 'Teknaf Coastal Expedition',
    description: 'Explore the southeastern tip of Bangladesh where the hills meet the sea. A unique landscape and cultural experience.',
    shortDescription: 'Expedition to the edge of Bangladesh.',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80'],
    price: 11000,
    duration: { days: 2, nights: 1 },
    maxGroupSize: 12,
    difficulty: 'moderate',
    departureLocation: 'Dhaka',
    startPoint: 'Dhaka',
    endPoint: 'Dhaka',
    highlights: ['Hills meeting the sea', 'Naf River cruise', 'Tribal culture', 'Coastal sunset'],
    included: ['Transport', 'Accommodation', 'Meals', 'Guide'],
    excluded: ['Personal expenses', 'Tips'],
    category: 'Adventure',
    destination: 'Teknaf',
    ratings: { average: 4.4, count: 34 },
    isFeatured: false,
    status: 'approved',
  },
  {
    title: 'Nafakhum Waterfall Adventure',
    description: 'Journey to the largest waterfall in Bangladesh, deep in the remote hills of Bandarban. An adventure for true explorers.',
    shortDescription: 'Adventure to the largest waterfall in Bangladesh.',
    thumbnail: 'https://images.unsplash.com/photo-1432405972618-c6b0cfba8b41?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1432405972618-c6b0cfba8b41?w=1200&q=80'],
    price: 16000,
    duration: { days: 3, nights: 2 },
    maxGroupSize: 8,
    difficulty: 'challenging',
    departureLocation: 'Dhaka',
    startPoint: 'Dhaka',
    endPoint: 'Dhaka',
    highlights: ['Trek to the waterfall', 'River crossing', 'Remote village stay', 'Camp under stars'],
    included: ['All meals', 'Camping gear', 'Guide', 'Transport'],
    excluded: ['Personal gear', 'Travel insurance'],
    category: 'Adventure',
    destination: 'Nafakhum',
    ratings: { average: 4.9, count: 28 },
    isFeatured: true,
    status: 'approved',
  },
];

export async function autoSeed() {
  try {
    // --- Categories ---
    let categoryMap = new Map<string, any>();
    const catCount = await Category.countDocuments();
    if (catCount === 0) {
      console.log('Seeding categories...');
      const createdCategories = await Category.insertMany(
        categories.map((c) => ({ ...c, slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') }))
      );
      categoryMap = new Map(createdCategories.map((c) => [c.name, c._id]));
      console.log(`Seeded ${createdCategories.length} categories.`);
    } else {
      // Build map from existing categories
      const existingCategories = await Category.find({});
      categoryMap = new Map(existingCategories.map((c) => [c.name, c._id]));
    }

    // --- Destinations ---
    let destinationMap = new Map<string, any>();
    const destCount = await Destination.countDocuments();
    if (destCount === 0) {
      console.log('Seeding destinations...');
      const createdDestinations = await Destination.insertMany(
        destinations.map((d) => ({ ...d, slug: d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') }))
      );
      destinationMap = new Map(createdDestinations.map((d) => [d.name, d._id]));
      console.log(`Seeded ${createdDestinations.length} destinations.`);
    } else {
      const existingDestinations = await Destination.find({});
      destinationMap = new Map(existingDestinations.map((d) => [d.name, d._id]));
    }

    // --- Tours ---
    const tourCount = await Tour.countDocuments();
    if (tourCount === 0) {
      console.log('Seeding tours...');
      const tourDocs = tours.map((t) => {
        const { category, destination, ...rest } = t;
        return {
          ...rest,
          category: categoryMap.get(category),
          destination: destinationMap.get(destination),
          createdBy: adminUserId,
          isActive: true,
        };
      });
      const created = await Tour.insertMany(tourDocs);
      console.log(`Seeded ${created.length} tours.`);
    }

    // Seed Demo Users (User and Admin)
    const auth = getAuth();
    let demoUser = await User.findOne({ email: 'demo@tourify.com' });
    if (!demoUser) {
      console.log('Seeding demo user...');
      try {
        await auth.api.signUpEmail({
          body: {
            email: 'demo@tourify.com',
            password: 'Demo1234!',
            name: 'Demo User',
          },
        });
        demoUser = await User.findOne({ email: 'demo@tourify.com' });
        console.log('Demo user seeded.');
      } catch (err) {
        console.error('Error creating demo user:', err);
      }
    }

    let adminUser = await User.findOne({ email: 'admin@tourify.com' });
    if (!adminUser) {
      console.log('Seeding admin user...');
      try {
        await auth.api.signUpEmail({
          body: {
            email: 'admin@tourify.com',
            password: 'Admin@123',
            name: 'Admin User',
          },
        });
        adminUser = await User.findOne({ email: 'admin@tourify.com' });
        if (adminUser) {
          adminUser.role = 'admin';
          await adminUser.save();
          console.log('Admin user role set to admin.');
        }
      } catch (err) {
        console.error('Error creating admin user:', err);
      }
    }

    // Seed Bookings
    const bookingCount = await Booking.countDocuments();
    if (bookingCount === 0 && demoUser) {
      console.log('Seeding mock bookings...');
      const sampleTours = await Tour.find().limit(3);
      if (sampleTours.length > 0) {
        const travelDate1 = new Date();
        travelDate1.setDate(travelDate1.getDate() + 15);
        
        const travelDate2 = new Date();
        travelDate2.setDate(travelDate2.getDate() + 30);
        
        const travelDate3 = new Date();
        travelDate3.setDate(travelDate3.getDate() + 45);

        // Booking 1 (Paid)
        await Booking.create({
          user: demoUser._id,
          tour: sampleTours[0]._id,
          travelDate: travelDate1,
          numberOfPeople: 2,
          totalPrice: (sampleTours[0].discountPrice || sampleTours[0].price) * 2,
          status: 'confirmed',
          paymentStatus: 'paid',
          paymentMethod: 'stripe',
          transactionId: 'ch_mock_tx_1234567890abcdef',
          contactInfo: {
            name: 'Demo User',
            email: 'demo@tourify.com',
            phone: '+8801700000000',
          },
          specialRequests: 'Window seat if possible.',
        });

        // Booking 2 (Paid)
        const tour2 = sampleTours[1] || sampleTours[0];
        await Booking.create({
          user: demoUser._id,
          tour: tour2._id,
          travelDate: travelDate2,
          numberOfPeople: 1,
          totalPrice: (tour2.discountPrice || tour2.price) * 1,
          status: 'confirmed',
          paymentStatus: 'paid',
          paymentMethod: 'stripe',
          transactionId: 'ch_mock_tx_0987654321fedcba',
          contactInfo: {
            name: 'Demo User',
            email: 'demo@tourify.com',
            phone: '+8801700000000',
          },
        });

        // Booking 3 (Unpaid/Pending)
        const tour3 = sampleTours[2] || sampleTours[0];
        await Booking.create({
          user: demoUser._id,
          tour: tour3._id,
          travelDate: travelDate3,
          numberOfPeople: 3,
          totalPrice: (tour3.discountPrice || tour3.price) * 3,
          status: 'pending',
          paymentStatus: 'unpaid',
          contactInfo: {
            name: 'Demo User',
            email: 'demo@tourify.com',
            phone: '+8801700000000',
          },
        });

        console.log('Seeded 3 mock bookings.');
      }
    }
  } catch (error) {
    console.error('Auto-seed failed:', error);
  }
}
