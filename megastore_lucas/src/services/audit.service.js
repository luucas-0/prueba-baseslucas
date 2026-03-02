const { getDB } = require('../config/mongodb');

class AuditService {
  static async logDeletion(entityType, entityId, deletedData, deletedBy = 'system') {
    const db = getDB();
    const col = db.collection('audit_logs');
    const doc = { entity_type: entityType, entity_id: entityId, operation: 'DELETE', deleted_data: deletedData, deleted_by: deletedBy, deleted_at: new Date() };
    return col.insertOne(doc);
  }

  static async getAuditLogs(entityType, entityId) {
    const db = getDB();
    const col = db.collection('audit_logs');
    const q = {};
    if (entityType) q.entity_type = entityType;
    if (entityId) q.entity_id = entityId;
    return col.find(q).sort({ deleted_at: -1 }).toArray();
  }
}

module.exports = AuditService;
