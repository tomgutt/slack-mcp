import { z } from "zod";
declare const EnvSchema: z.ZodObject<{
    SLACK_AUTH_BOT_TOKEN: z.ZodString;
    SLACK_CHANNELS: z.ZodString;
}, "strip", z.ZodTypeAny, {
    SLACK_AUTH_BOT_TOKEN: string;
    SLACK_CHANNELS: string;
}, {
    SLACK_AUTH_BOT_TOKEN: string;
    SLACK_CHANNELS: string;
}>;
export type Env = z.infer<typeof EnvSchema> & {
    parsedChannels: string[];
};
export declare function loadEnv(): Env;
export {};
