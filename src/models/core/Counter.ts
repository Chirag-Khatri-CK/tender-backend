// src/models/Counter.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICounter  {
    _id: string;   // e.g. "tender_20251207"
    seq: number;
    createdAt: Date;
    updatedAt: Date;
}

const CounterSchema = new Schema<ICounter>(
    {
        _id: { type: String, required: true },
        seq: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    }
);

const Counter: Model<ICounter> =
    mongoose.models.Counter || mongoose.model<ICounter>('Counter', CounterSchema);

export default Counter;
