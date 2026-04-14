import mongoose, { Document, Schema } from 'mongoose';

export interface IGenerationJob extends Document {
  _id: string;
  userId: string;
  sessionId: string;
  prompt: string;
  platform?: 'youtube' | 'instagram-post' | 'instagram-reel';
  style?: 'realistic' | 'artistic' | 'cartoon' | 'minimalist';
  size?: '256x256' | '512x512' | '1024x1024';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  resultAssetId?: string;
  resultImageUrl?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

const generationJobSchema = new Schema<IGenerationJob>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  sessionId: {
    type: Schema.Types.ObjectId,
    ref: 'DesignSession',
    required: [true, 'Session ID is required']
  },
  prompt: {
    type: String,
    required: [true, 'Prompt is required'],
    trim: true,
    maxlength: [4000, 'Prompt must be less than 4000 characters']
  },
  platform: {
    type: String,
    enum: ['youtube', 'instagram-post', 'instagram-reel'],
    default: 'youtube'
  },
  style: {
    type: String,
    enum: ['realistic', 'artistic', 'cartoon', 'minimalist'],
    default: 'realistic'
  },
  size: {
    type: String,
    enum: ['256x256', '512x512', '1024x1024'],
    default: '1024x1024'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  resultAssetId: {
    type: Schema.Types.ObjectId,
    ref: 'Asset'
  },
  resultImageUrl: {
    type: String
  },
  error: {
    type: String
  },
  completedAt: {
    type: Date
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
generationJobSchema.index({ userId: 1 });
generationJobSchema.index({ sessionId: 1 });
generationJobSchema.index({ status: 1 });
generationJobSchema.index({ createdAt: -1 });

// Static methods
generationJobSchema.statics.findByUserId = function(userId: string) {
  return this.find({ userId: userId }).sort({ createdAt: -1 });
};

generationJobSchema.statics.findBySessionId = function(sessionId: string) {
  return this.find({ sessionId: sessionId }).sort({ createdAt: -1 });
};

generationJobSchema.statics.findByStatus = function(status: IGenerationJob['status']) {
  return this.find({ status: status }).sort({ createdAt: -1 });
};

generationJobSchema.statics.findPendingJobs = function() {
  return this.find({ status: 'pending' }).sort({ createdAt: 1 });
};

// Static method types
interface GenerationJobModel extends mongoose.Model<IGenerationJob> {
  findByUserId(userId: string): Promise<IGenerationJob[]>;
  findBySessionId(sessionId: string): Promise<IGenerationJob[]>;
  findByStatus(status: string): Promise<IGenerationJob[]>;
  findPendingJobs(): Promise<IGenerationJob[]>;
}

export const GenerationJob = mongoose.model<IGenerationJob, GenerationJobModel>('GenerationJob', generationJobSchema);
