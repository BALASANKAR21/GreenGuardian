import { connectMongo } from "./db.js";
import { PlantModel } from "./plantModel.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
async function main() {
    await connectMongo();
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const seedPath = path.join(__dirname, "plants.seed.json");
    const raw = fs.readFileSync(seedPath, "utf-8");
    const docs = JSON.parse(raw);
    await PlantModel.deleteMany({});
    await PlantModel.insertMany(docs);
    console.log(`[seed] inserted ${docs.length} plants`);
    process.exit(0);
}
main().catch(err => {
    console.error(err);
    process.exit(1);
});
