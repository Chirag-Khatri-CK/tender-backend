import mongoose from 'mongoose';

const ContractorDocumentSchema = new mongoose.Schema({
  contractorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contractor', required: true, index: true },
  title: { type: String },
  filePath: { type: String },
  metadata: { type: Object },
  status: { type: String, enum: ['draft','published','archived'], default: 'draft' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.models.ContractorDocument || mongoose.model('ContractorDocument', ContractorDocumentSchema);
