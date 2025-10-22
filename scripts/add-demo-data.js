const { MongoClient } = require('mongodb');

require('dotenv').config();
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const demoPlants = [
    {
        name: "Tulsi",
        scientificName: "Ocimum sanctum",
        location: "Vellore",
        state: "Tamil Nadu",
        plantType: "Medicinal",
        waterRequirement: "Moderate",
        sunlightRequirement: "Full Sun",
        soilType: "Well-draining soil",
        description: "Sacred plant in Indian households, known for its medicinal properties and religious significance. Commonly grown in VIT Vellore campus gardens.",
        careInstructions: "Water daily in summer, twice a week in winter. Prune regularly to promote bushier growth.",
        plantingDate: new Date("2025-08-15"),
        lastWatered: new Date(),
        health: "Healthy",
        userId: "demo_user_1"
    },
    {
        name: "Neem Tree",
        scientificName: "Azadirachta indica",
        location: "Madurai",
        state: "Tamil Nadu",
        plantType: "Tree",
        waterRequirement: "Low",
        sunlightRequirement: "Full Sun",
        soilType: "Sandy loam",
        description: "Ancient medicinal tree found throughout Madurai, especially near Meenakshi Temple area. Known for its antibacterial properties.",
        careInstructions: "Drought resistant, needs minimal watering. Annual pruning recommended.",
        plantingDate: new Date("2024-06-20"),
        lastWatered: new Date(),
        health: "Excellent",
        userId: "demo_user_1"
    },
    {
        name: "Temple Champaka",
        scientificName: "Plumeria rubra",
        location: "Tirupathi",
        state: "Andhra Pradesh",
        plantType: "Flowering Tree",
        waterRequirement: "Moderate",
        sunlightRequirement: "Full Sun",
        soilType: "Rich, well-draining soil",
        description: "Fragrant flowering tree commonly found in Tirumala temple gardens. Flowers used in religious ceremonies.",
        careInstructions: "Water thoroughly when soil is dry. Protect from frost in winter.",
        plantingDate: new Date("2025-03-10"),
        lastWatered: new Date(),
        health: "Good",
        userId: "demo_user_2"
    },
    {
        name: "Jasmine",
        scientificName: "Jasminum sambac",
        location: "Madurai",
        state: "Tamil Nadu",
        plantType: "Flowering Vine",
        waterRequirement: "Moderate",
        sunlightRequirement: "Partial Sun",
        soilType: "Fertile, well-draining soil",
        description: "Traditional flower cultivation in Madurai, famous for Madurai Malli (Jasmine). Essential in local garland making.",
        careInstructions: "Regular watering, monthly fertilizing. Prune after flowering season.",
        plantingDate: new Date("2025-01-05"),
        lastWatered: new Date(),
        health: "Excellent",
        userId: "demo_user_2"
    },
    {
        name: "Mango Tree",
        scientificName: "Mangifera indica",
        location: "Vellore",
        state: "Tamil Nadu",
        plantType: "Fruit Tree",
        waterRequirement: "Moderate",
        sunlightRequirement: "Full Sun",
        soilType: "Deep, well-draining soil",
        description: "Heritage mango tree in VIT campus, producing the famous Banganapalli variety. Over 25 years old.",
        careInstructions: "Deep watering weekly. Fertilize before flowering season.",
        plantingDate: new Date("2000-06-15"),
        lastWatered: new Date(),
        health: "Healthy",
        userId: "demo_user_1"
    },
    {
        name: "Sacred Fig",
        scientificName: "Ficus religiosa",
        location: "Tirupathi",
        state: "Andhra Pradesh",
        plantType: "Sacred Tree",
        waterRequirement: "Moderate",
        sunlightRequirement: "Full Sun",
        soilType: "Any well-draining soil",
        description: "Ancient Peepal tree near Tirumala temple steps. Considered sacred and over 100 years old.",
        careInstructions: "Minimal care needed. Remove aerial roots if spreading too much.",
        plantingDate: new Date("1920-01-01"),
        lastWatered: new Date(),
        health: "Excellent",
        userId: "demo_user_3"
    },
    {
        name: "Lemon Tree",
        scientificName: "Citrus limon",
        location: "Vellore",
        state: "Tamil Nadu",
        plantType: "Fruit Tree",
        waterRequirement: "Moderate",
        sunlightRequirement: "Full Sun",
        soilType: "Fertile, slightly acidic soil",
        description: "Community garden initiative in Vellore Fort area, providing fresh lemons to local residents.",
        careInstructions: "Regular watering, citrus-specific fertilizer quarterly.",
        plantingDate: new Date("2024-12-10"),
        lastWatered: new Date(),
        health: "Good",
        userId: "demo_user_2"
    },
    {
        name: "Indian Rose",
        scientificName: "Rosa indica",
        location: "Tirupathi",
        state: "Andhra Pradesh",
        plantType: "Flowering Shrub",
        waterRequirement: "High",
        sunlightRequirement: "Full Sun",
        soilType: "Rich garden soil",
        description: "Cultivated in Sri Venkateswara University botanical garden. Used in temple offerings.",
        careInstructions: "Daily watering, regular deadheading, annual pruning.",
        plantingDate: new Date("2025-02-14"),
        lastWatered: new Date(),
        health: "Excellent",
        userId: "demo_user_3"
    },
    {
        name: "Banana Plant",
        scientificName: "Musa paradisiaca",
        location: "Madurai",
        state: "Tamil Nadu",
        plantType: "Fruit Plant",
        waterRequirement: "High",
        sunlightRequirement: "Full Sun",
        soilType: "Rich, moist soil",
        description: "Part of sustainable farming project near Madurai bypass. Produces organic Nenthran variety bananas.",
        careInstructions: "Heavy watering, regular fertilizing, remove dead leaves.",
        plantingDate: new Date("2025-05-01"),
        lastWatered: new Date(),
        health: "Good",
        userId: "demo_user_1"
    },
    {
        name: "Indian Sandalwood",
        scientificName: "Santalum album",
        location: "Vellore",
        state: "Tamil Nadu",
        plantType: "Tree",
        waterRequirement: "Low",
        sunlightRequirement: "Full Sun",
        soilType: "Sandy loam",
        description: "Protected sandalwood plantation in VIT campus. Part of biodiversity conservation project.",
        careInstructions: "Minimal watering once established. Protection from theft required.",
        plantingDate: new Date("2020-07-20"),
        lastWatered: new Date(),
        health: "Excellent",
        userId: "demo_user_3"
    }
];

async function addDemoData() {
    try {
        await client.connect();
        const db = client.db("greenguardian");
        const collection = db.collection("plants");
        
        // Clear existing demo data if any
        await collection.deleteMany({ userId: { $in: ["demo_user_1", "demo_user_2", "demo_user_3"] } });
        
        // Insert new demo data
        const result = await collection.insertMany(demoPlants);
        console.log(`Successfully inserted ${result.insertedCount} plants`);
        
        // Display some statistics
        const locationStats = await collection.aggregate([
            { $match: { userId: { $in: ["demo_user_1", "demo_user_2", "demo_user_3"] } } },
            { $group: { _id: "$location", count: { $sum: 1 } } }
        ]).toArray();
        
        console.log("\nPlants by location:");
        locationStats.forEach(stat => {
            console.log(`${stat._id}: ${stat.count} plants`);
        });
        
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.close();
    }
}

addDemoData().catch(console.error);