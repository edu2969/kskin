import mongoose from 'mongoose';

const CatalogSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: String, required: true },
  serviceCategory: { type: String, required: true },
  description: { type: String },
  reserveOnline: { type: Boolean, required: true },
  priceVisibleOnMiniSite: { type: Boolean, required: true },
  vat: { type: Boolean, required: true },
  salesCommission: { type: Number, required: true },
  commissionType: { type: String, required: true },
  sessions: { type: Boolean },
  sessionCount: { type: Number },
  groupService: { type: Boolean, required: true },
  groupCapacity: { type: Number },
  homeService: { type: Boolean, required: true },
});

const Catalog = mongoose.models.Catalog || mongoose.model('Catalog', CatalogSchema);

export default Catalog;