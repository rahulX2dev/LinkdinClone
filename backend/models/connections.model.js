import mongoose from 'mongoose';
const connectionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        ref: 'User'
    },
    connectionId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status_accepted : {
        type: Boolean,
        default: false
    },
});

const ConnectionRequest = mongoose.model('Connection', connectionSchema);
export default ConnectionRequest;   