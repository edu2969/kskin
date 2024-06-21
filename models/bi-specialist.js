import mongoose from 'mongoose';

const biSpecialistSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: String, required: true },
  specialtyId: { type: mongoose.Types.ObjectId, ref: "Specialty", required: true },
  description: { type: String },
  reserveOnline: { type: Boolean, required: true },
  priceVisibleOnMiniSite: { type: Boolean, required: true },
  vat: { type: Boolean, required: true },
  salesCommission: { type: Number, required: true },
  commissionType: { type: String, required: true },
  sessionCount: { type: Number },
  groupCapacity: { type: Number },
  homeService: { type: Boolean, required: true },
});

const BISpecialist = mongoose.models.BISpecialist || mongoose.model('BISpecialist', biSpecialistSchema);

export default BISpecialist;