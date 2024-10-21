import mongoose from 'mongoose';

const catalogSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  imgUrl: { type: String },
  price: { type: Number, required: true },
  durationMins: { type: Number, required: true },
  cleanUpMins: { type: Number, required: true },
  specialtyId: { type: mongoose.Types.ObjectId, ref: "Specialty", required: true },
  reserveOnline: { type: Boolean, required: true },
  priceVisibleOnMiniSite: { type: Boolean, required: true },
  vat: { type: Boolean, required: true },
  salesCommission: { type: Number, required: true },
  commissionType: { type: String, required: true },
  sessionCount: { type: Number },
  groupCapacity: { type: Number },
  homeService: { type: Boolean, required: true },
  specialistQty: { type: Number },
});

const Catalog = mongoose.models.Catalog || mongoose.model('Catalog', catalogSchema);

export default Catalog;