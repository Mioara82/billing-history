import 'dotenv/config';
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB!;

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  const collections = await db.listCollections({ name: "invoices" }).toArray();
  if (collections.length === 0) {
    await db.createCollection("invoices");
  }

  await db.command({
    collMod: "invoices",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["number", "pdfUrl", "createdAt", "status", "amount", "plan"],
        properties: {
          number: { bsonType: "string" },
          pdfUrl: { bsonType: "string" },
          date: { bsonType: ["date", "null"] },
          status: { bsonType: "string" },
          plan: { bsonType: "string" },
          amount: { bsonType: ["double", "int", "long", "decimal", "null"] },
          currency: { bsonType: ["string", "null"] },
          createdAt: { bsonType: "date" },
        },
        additionalProperties: true,
      },
    },
  });
  await client.close();
  console.log("Migration complete");
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
