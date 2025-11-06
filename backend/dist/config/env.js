import { z } from "zod";
const EnvSchema = z.object({
    PORT: z.coerce.number().int().positive().default(4000),
    FRONTEND_ORIGIN: z.string().default("http://localhost:3000")
});
export const env = EnvSchema.parse(process.env);
