// R2__Rollback_V2.js
// Rollback script for V2 migration

db = db.getSiblingDB("finovadb");

db.schema_migrations.drop();

print("R2 rollback completed - schema_migrations collection removed.");
