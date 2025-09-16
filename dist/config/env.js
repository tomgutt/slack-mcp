import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();
const EnvSchema = z.object({
    SLACK_AUTH_BOT_TOKEN: z.string().min(1, "SLACK_AUTH_BOT_TOKEN is required"),
    SLACK_CHANNELS: z
        .string()
        .min(1, "SLACK_CHANNELS is required (comma-separated channel IDs or names)")
});
export function loadEnv() {
    const raw = {
        SLACK_AUTH_BOT_TOKEN: process.env.SLACK_AUTH_BOT_TOKEN ?? "",
        SLACK_CHANNELS: process.env.SLACK_CHANNELS ?? ""
    };
    const parsed = EnvSchema.safeParse(raw);
    if (!parsed.success) {
        const issues = parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("; ");
        throw new Error(`Invalid environment: ${issues}`);
    }
    const parsedChannels = parsed.data.SLACK_CHANNELS
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);
    return { ...parsed.data, parsedChannels };
}
