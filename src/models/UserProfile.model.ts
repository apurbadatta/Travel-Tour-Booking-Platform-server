import mongoose, { Document, Schema } from 'mongoose';

export interface IUserProfile extends Document {
  userId: string; // better-auth user ID (string)
  phone?: string;
  role: 'user' | 'admin';
  wishlist: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userProfileSchema = new Schema<IUserProfile>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      unique: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Tour',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const UserProfile = mongoose.model<IUserProfile>('UserProfile', userProfileSchema);

export default UserProfile;