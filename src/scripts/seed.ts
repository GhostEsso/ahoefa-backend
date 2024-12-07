import { PrismaClient, UserRole, AgentStatus, PropertyType, ListingType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const agents = [
  {
    firstName: "Jean",
    lastName: "Dupont",
    email: "jean.dupont@immo.com",
    password: "Agent123!",
    phoneNumber: "+22890123456",
    organization: "Immo Premium",
    role: UserRole.AGENT_PREMIUM,
    agentStatus: AgentStatus.APPROVED,
    isPremium: true,
    isVerified: true
  },
  {
    firstName: "Marie",
    lastName: "Kokou",
    email: "marie.kokou@immo.com",
    password: "Agent123!",
    phoneNumber: "+22891234567",
    organization: "Immo Plus",
    role: UserRole.AGENT_PREMIUM,
    agentStatus: AgentStatus.APPROVED,
    isPremium: true,
    isVerified: true
  },
  {
    firstName: "Paul",
    lastName: "Amah",
    email: "paul.amah@immo.com",
    password: "Agent123!",
    phoneNumber: "+22892345678",
    organization: "Immo Basic",
    role: UserRole.AGENT,
    agentStatus: AgentStatus.APPROVED,
    isPremium: false,
    isVerified: true
  },
  {
    firstName: "Sophie",
    lastName: "Lawson",
    email: "sophie.lawson@immo.com",
    password: "Agent123!",
    phoneNumber: "+22893456789",
    organization: "Immo Basic",
    role: UserRole.AGENT,
    agentStatus: AgentStatus.APPROVED,
    isPremium: false,
    isVerified: true
  },
  {
    firstName: "David",
    lastName: "Mensah",
    email: "david.mensah@immo.com",
    password: "Agent123!",
    phoneNumber: "+22894567890",
    organization: "Immo Start",
    role: UserRole.AGENT,
    agentStatus: AgentStatus.PENDING,
    isPremium: false,
    isVerified: true
  }
];

const listings = [
  {
    title: "Belle Villa Moderne",
    description: "Magnifique villa moderne avec piscine",
    price: 75000000,
    type: PropertyType.HOUSE,
    listingType: ListingType.SALE,
    location: "Lomé, Agoe",
    address: "123 Rue des Fleurs",
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
      "https://images.unsplash.com/photo-1576941089067-2de3c901e126"
    ],
    features: ["Piscine", "Jardin", "Garage"],
    available: true
  },
  {
    title: "Appartement Centre-ville",
    description: "Bel appartement en centre-ville",
    price: 150000,
    type: PropertyType.APARTMENT,
    listingType: ListingType.RENT,
    location: "Lomé, Centre",
    address: "45 Avenue du Commerce",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"
    ],
    features: ["Climatisation", "Balcon", "Sécurité"],
    available: true
  },
  {
    title: "Bureau Moderne",
    description: "Espace de bureau moderne et équipé",
    price: 250000,
    type: PropertyType.OFFICE,
    listingType: ListingType.RENT,
    location: "Lomé, Zone Portuaire",
    address: "78 Boulevard Maritime",
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2"
    ],
    features: ["Parking", "Fibre optique", "Salle de réunion"],
    available: true
  }
];

async function seed() {
  try {
    console.log('Début du seeding...');

    // Créer les agents
    for (const agent of agents) {
      const hashedPassword = await bcrypt.hash(agent.password, 10);
      
      const existingUser = await prisma.user.findUnique({
        where: { email: agent.email }
      });

      if (!existingUser) {
        const user = await prisma.user.create({
          data: {
            ...agent,
            password: hashedPassword,
          }
        });
        console.log(`Agent créé: ${user.firstName} ${user.lastName}`);

        // Créer des listings pour cet agent
        for (const listing of listings) {
          await prisma.listing.create({
            data: {
              ...listing,
              userId: user.id
            }
          });
          console.log(`Listing créé pour ${user.firstName}`);
        }
      }
    }

    console.log('Seeding terminé avec succès!');
  } catch (error) {
    console.error('Erreur lors du seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le seeding
seed(); 