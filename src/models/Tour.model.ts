import mongoose, { Document, Schema } from 'mongoose';

export interface ITour extends Document {
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  highlights: string[];
  itinerary: {
    day: number;
    title: string;
    description: string;
    accommodation?: string;
    meals?: string;
  }[];
  destination: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  images: string[];
  thumbnail: string;
  price: number;
  discountPrice?: number;
  duration: {
    days: number;
    nights: number;
  };
  maxGroupSize: number;
  currentBookings: number;
  difficulty: 'easy' | 'moderate' | 'challenging';
  included: string[];
  excluded: string[];
  departureLocation: string;
  startPoint: string;
  endPoint: string;
  startDates: Date[];
  ratings: {
    average: number;
    count: number;
  };
  isFeatured: boolean;
  isActive: boolean;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const tourSchema = new Schema<ITour>(
  {
    title: {
      type: String,
      required: [true, 'Tour title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      maxlength: [200, 'Short description cannot exceed 200 characters'],
    },
    highlights: [
      {
        type: String,
        trim: true,
      },
    ],
    itinerary: [
      {
        day: { type: Number, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        accommodation: { type: String },
        meals: { type: String },
      },
    ],
    destination: {
      type: Schema.Types.ObjectId,
      ref: 'Destination',
      required: [true, 'Destination is required'],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    images: [
      {
        type: String,
      },
    ],
    thumbnail: {
      type: String,
      required: [true, 'Thumbnail image is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discountPrice: {
      type: Number,
      min: [0, 'Discount price cannot be negative'],
    },
    duration: {
      days: { type: Number, required: true, min: 1 },
      nights: { type: Number, required: true, min: 0 },
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Max group size is required'],
      min: [1, 'Group size must be at least 1'],
    },
    currentBookings: {
      type: Number,
      default: 0,
      min: 0,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'moderate', 'challenging'],
      default: 'moderate',
    },
    included: [
      {
        type: String,
        trim: true,
      },
    ],
    excluded: [
      {
        type: String,
        trim: true,
      },
    ],
    departureLocation: {
      type: String,
      required: [true, 'Departure location is required'],
      trim: true,
    },
    startPoint: {
      type: String,
      required: [true, 'Start point is required'],
      trim: true,
    },
    endPoint: {
      type: String,
      required: [true, 'End point is required'],
      trim: true,
    },
    startDates: [
      {
        type: Date,
      },
    ],
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create slug from title before saving
tourSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Index for search and filtering
tourSchema.index({ title: 'text', description: 'text' });
tourSchema.index({ destination: 1, category: 1, price: 1 });

const Tour = mongoose.model<ITour>('Tour', tourSchema);

export default Tour;