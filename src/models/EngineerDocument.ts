import mongoose from 'mongoose';

const EngineerDocumentSchema = new mongoose.Schema({
  engineerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Engineer', required: true, index: true },
  title: { type: String },
  filePath: { type: String },
  metadata: { type: Object },
  status: { type: String, enum: ['draft','published','archived'], default: 'draft' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.models.EngineerDocument || mongoose.model('EngineerDocument', EngineerDocumentSchema);
