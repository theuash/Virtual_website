import mongoose from 'mongoose';

const serviceItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rate: { type: Number, required: true },
  unit: { type: String, required: true },
  tolerance: { type: String },
  isPopular: { type: Boolean, default: false },
  // Rich metadata for the sidebar
  details: {
    description:      { type: String, default: '' },
    includes:         [{ type: String }],
    bestFor:          [{ type: String }],
    youtubeExamples:  [{ type: String }],
    deliverable:      { type: String, default: '' },
    turnaround:       { type: String, default: '' },
  },
}, { _id: true });

const pricingSchema = new mongoose.Schema({
  department: {
    type: String,
    enum: ['video_editing', 'graphic_designing', '3d_animation', 'cgi', 'script_writing'],
    required: true,
    unique: true,
  },
  displayName: { type: String, required: true },   // "Video Editing"
  startingFrom: { type: Number, required: true },  // lowest rate in department
  startingUnit: { type: String, required: true },  // unit for starting price
  generalServices: [serviceItemSchema],
  popularFormats: [serviceItemSchema],
}, { timestamps: true });

export const Pricing = mongoose.model('Pricing', pricingSchema);
