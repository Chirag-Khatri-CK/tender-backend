// utils/sequence.ts
import Counter from "../models/core/Counter";

export const pad = (n: number, size = 2) => String(n).padStart(size, "0");

export async function getNextSequence(key: string): Promise<number> {
    const counter = await Counter.findByIdAndUpdate(
        key,
        { $inc: { seq: 1 } },
        { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
    ).lean();

    return counter!.seq;
}

export async function getNextDailySequence(key: string): Promise<number> {
    const now = new Date();
    const YYYY = now.getFullYear();
    const MM = pad(now.getMonth() + 1);
    const DD = pad(now.getDate());

    // const counterKey = `${key}_${YYYY}${MM}${DD}`; // if reset counter to each date
    const counterKey = `${key}`;

    const counter = await Counter.findByIdAndUpdate(
        counterKey,
        { $inc: { seq: 1 } },
        { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
    ).lean();

    return counter!.seq;
}

export const slugify = (text: string = "") =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").substring(0, 80);

export async function generateUniqueSlug(base: string, model: any, suffix: string): Promise<string> {
    const baseSlug = slugify(base);
    let slug = `${baseSlug}-${suffix}`.toLowerCase();

    const exists = await model.exists({ slug });
    if (!exists) return slug;

    return `${slug}-${Date.now()}`;
}
