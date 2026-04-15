import mongoose, { Document, Schema } from 'mongoose';

export interface IAsset extends Document {
  _id: string;
  sessionId?: string;
  userId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  // Cloudinary fields
  publicId?: string;
  imageUrl?: string;
  prompt?: string;
  type?: 'thumbnail' | 'asset' | 'profile' | 'other';
  s3Key?: string;
  metadata?: object;
  createdAt: Date;
  updatedAt: Date;
}

const assetSchema = new Schema<IAsset>({
  sessionId: {
    type: Schema.Types.ObjectId,
    ref: 'DesignSession',
    required: false
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  filename: {
    type: String,
    required: [true, 'Filename is required'],
    trim: true
  },
  originalName: {
    type: String,
    required: [true, 'Original filename is required'],
    trim: true
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required']
  },
  size: {
    type: Number,
    required: [true, 'File size is required'],
    min: [0, 'File size must be positive']
  },
  url: {
    type: String,
    required: [true, 'File URL is required']
  },
  // Cloudinary fields
  publicId: {
    type: String,
    required: false
  },
  imageUrl: {
    type: String,
    required: false
  },
  prompt: {
    type: String,
    required: false
  },
  type: {
    type: String,
    enum: ['thumbnail', 'asset', 'profile', 'other'],
    required: false
  },
  s3Key: {
    type: String,
    required: false
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better performance
assetSchema.index({ userId: 1 });
assetSchema.index({ sessionId: 1 });
assetSchema.index({ createdAt: -1 });
assetSchema.index({ mimeType: 1 });

// Static methods
assetSchema.statics.findByUserId = function(userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

assetSchema.statics.findBySessionId = function(sessionId: string) {
  return this.find({ sessionId }).sort({ createdAt: 1 });
};

assetSchema.statics.findByIdWithUser = function(assetId: string) {
  return this.findById(assetId).populate('userId', 'name email avatarUrl');
};

// Static method types
interface AssetModel extends mongoose.Model<IAsset> {
  findByUserId(userId: string): Promise<IAsset[]>;
  findBySessionId(sessionId: string): Promise<IAsset[]>;
  findByIdWithUser(assetId: string): Promise<IAsset | null>;
}

export const Asset = mongoose.model<IAsset, AssetModel>('Asset', assetSchema);
