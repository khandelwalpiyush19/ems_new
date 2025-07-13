import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: false // Now optional
  },
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  isBroadcast: {
    type: Boolean,
    default: false
  }
},{ timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;