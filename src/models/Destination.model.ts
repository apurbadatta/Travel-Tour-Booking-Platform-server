import mongoose, { Document, Schema } from 'mongoose';

export interface IDestination extends Document {
  name: string;
  slug: string;
  description: string;
  image: string;
  region: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const destinationSchema = new Schema<IDestination>(
  {
    name: {
      type: String,
      required: [true, 'Destination name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    region: {
      type: String,
      required: [true, 'Region is required'],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

destinationSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

destinationSchema.index({ slug: 1 });

const Destination = mongoose.model<IDestination>('Destination', destinationSchema);

export default Destination;
