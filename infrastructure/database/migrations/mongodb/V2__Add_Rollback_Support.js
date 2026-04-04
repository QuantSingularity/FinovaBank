// V2__Add_Rollback_Support.js
// Add migration history tracking to MongoDB

db = db.getSiblingDB('finovadb');

db.createCollection('schema_migrations', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['version', 'description', 'installed_on', 'success'],
      properties: {
        version:        { bsonType: 'string' },
        description:    { bsonType: 'string' },
        script:         { bsonType: 'string' },
        installed_by:   { bsonType: 'string' },
        installed_on:   { bsonType: 'date' },
        execution_time: { bsonType: 'int' },
        success:        { bsonType: 'bool' }
      }
    }
  }
});

db.schema_migrations.createIndex({ version: 1 }, { unique: true });
db.schema_migrations.createIndex({ installed_on: -1 });

// Record V1 migration as applied
db.schema_migrations.insertOne({
  version: 'V1',
  description: 'Initial Schema',
  script: 'V1__Initial_Schema.js',
  installed_by: 'migration-runner',
  installed_on: new Date(),
  execution_time: 0,
  success: true
});

print('MongoDB V2 migration completed - rollback tracking enabled.');
