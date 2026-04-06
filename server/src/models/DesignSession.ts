import mongoose, { Document, Schema } from 'mongoose';

export interface IDesignSession extends Document {
  _id: string;
  userId: string;
  title: string;
  platform: 'youtube' | 'instagram-post' | 'instagram-reel';
  status: 'active' | 'archived' | 'deleted';
  createdAt: Date;
  updatedAt: Date;
}

const designSessionSchema = new Schema<IDesignSession>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [1, 'Title must be at least 1 character long'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  platform: {
    type: String,
    required: [true, 'Platform is required'],
    enum: ['youtube', 'instagram-post', 'instagram-reel'],
    default: 'youtube'
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: ['active', 'archived', 'deleted'],
    default: 'active'
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
designSessionSchema.index({ userId: 1 });
designSessionSchema.index({ status: 1 });
designSessionSchema.index({ createdAt: -1 });
designSessionSchema.index({ platform: 1 });

// Static methods
designSessionSchema.statics.findByUserId = function(userId: string) {
  return this.find({ userId: userId, status: { $ne: 'deleted' } }).sort({ createdAt: -1 });
};

designSessionSchema.statics.findByIdWithUser = function(sessionId: string) {
  return this.findById(sessionId).populate('userId', 'name email avatarUrl');
};

designSessionSchema.statics.findActiveSessions = function(userId: string) {
  return this.find({ userId: userId, status: 'active' }).sort({ createdAt: -1 });
};

// Static method types
interface DesignSessionModel extends mongoose.Model<IDesignSession> {
  findByUserId(userId: string): Promise<IDesignSession[]>;
  findByIdWithUser(sessionId: string): Promise<IDesignSession | null>;
  findActiveSessions(userId: string): Promise<IDesignSession[]>;
}

export const DesignSession = mongoose.model<IDesignSession, DesignSessionModel>('DesignSession', designSessionSchema);

