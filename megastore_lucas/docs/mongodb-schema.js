db = db.getSiblingDB('db_megastore_exam');
db.orders.drop();
db.audit_logs.drop();

db.createCollection('orders', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['transaction_id','customer_id','items'],
      properties: {
        transaction_id: { bsonType: 'string' },
        order_date: { bsonType: ['date', 'string', 'null'] },
        customer_id: { bsonType: 'int' },
        items: { bsonType: 'array', items: { bsonType: 'object' } },
        total_amount: { bsonType: ['double', 'int', 'null'] },
        created_at: { bsonType: ['date', 'null'] }
      }
    }
  }
});

db.createCollection('audit_logs', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['entity_type','entity_id','operation','deleted_at'],
      properties: {
        entity_type: { bsonType: 'string' },
        entity_id: { bsonType: ['int','string'] },
        operation: { bsonType: 'string' },
        deleted_at: { bsonType: 'date' }
      }
    }
  }
});

print('MongoDB validation schemas created');
