import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  actorId: String,
  actorRole: String,
  action: String,
  details: Object,
}, { timestamps: true });

export default mongoose.model('AuditLog', AuditLogSchema);
