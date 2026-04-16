// V1__Initial_Schema.js
// MongoDB Initial Schema for FinovaBank
// Run with: mongosh --username <admin> --password <pass> --authenticationDatabase admin

// Create collections with schema validation
db = db.getSiblingDB("finovadb");

db.createCollection("audit_logs", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["event_type", "actor_id", "timestamp"],
      properties: {
        event_type: { bsonType: "string" },
        actor_id: { bsonType: "string" },
        resource: { bsonType: "string" },
        action: { bsonType: "string" },
        timestamp: { bsonType: "date" },
        ip_address: { bsonType: "string" },
        metadata: { bsonType: "object" },
      },
    },
  },
});

db.audit_logs.createIndex({ actor_id: 1 });
db.audit_logs.createIndex({ timestamp: -1 });
db.audit_logs.createIndex({ event_type: 1, timestamp: -1 });

// TTL index for audit log expiration (7 years = 2555 days for financial compliance)
db.audit_logs.createIndex(
  { timestamp: 1 },
  { expireAfterSeconds: 220752000, name: "audit_log_ttl" },
);

db.createCollection("document_store", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["document_type", "owner_id", "created_at"],
      properties: {
        document_type: {
          bsonType: "string",
          enum: [
            "ID_PROOF",
            "ADDRESS_PROOF",
            "INCOME_PROOF",
            "BANK_STATEMENT",
            "CONTRACT",
          ],
        },
        owner_id: { bsonType: "string" },
        storage_path: { bsonType: "string" },
        file_hash: { bsonType: "string" },
        created_at: { bsonType: "date" },
        expires_at: { bsonType: "date" },
      },
    },
  },
});

db.document_store.createIndex({ owner_id: 1 });
db.document_store.createIndex({ document_type: 1 });
db.document_store.createIndex({ created_at: -1 });

print("MongoDB V1 schema migration completed successfully.");
