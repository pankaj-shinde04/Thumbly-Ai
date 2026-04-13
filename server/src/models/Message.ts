import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  _id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  imageAssetId?: string;
  metadata?: object;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  sessionId: {
    type: Schema.Types.ObjectId,
    ref: 'DesignSession',
    required: [true, 'Session ID is required']
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['user', 'assistant']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  imageAssetId: {
    type: Schema.Types.ObjectId,
    ref: 'Asset',
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
messageSchema.index({ sessionId: 1 });
messageSchema.index({ createdAt: 1 });
messageSchema.index({ role: 1 });

// Static methods
messageSchema.statics.findBySessionId = function(sessionId: string) {
  return this.find({ sessionId }).sort({ createdAt: 1 });
};

messageSchema.statics.findLastUserMessage = function(sessionId: string) {
  return this.findOne({ sessionId, role: 'user' }).sort({ createdAt: -1 });
};

messageSchema.statics.findAssistantMessages = function(sessionId: string) {
  return this.find({ sessionId, role: 'assistant' }).sort({ createdAt: 1 });
};

// Static method types
interface MessageModel extends mongoose.Model<IMessage> {
  findBySessionId(sessionId: string): Promise<IMessage[]>;
  findLastUserMessage(sessionId: string): Promise<IMessage | null>;
  findAssistantMessages(sessionId: string): Promise<IMessage[]>;
}

export const Message = mongoose.model<IMessage, MessageModel>('Message', messageSchema);
