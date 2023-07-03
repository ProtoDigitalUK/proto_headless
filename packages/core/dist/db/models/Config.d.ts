import { BrickBuilderT } from "@lucid/brick-builder";
import { CollectionBuilderT } from "@lucid/collection-builder";
export type ConfigT = {
    port: number;
    origin?: string;
    mode: "development" | "production";
    databaseUrl: string;
    secretKey: string;
    environments: Array<{
        title: string;
        key: string;
    }>;
    collections?: CollectionBuilderT[];
    bricks?: BrickBuilderT[];
    media: {
        storageLimit?: number;
        maxFileSize?: number;
        store: {
            service: "aws" | "cloudflare";
            cloudflareAccountId?: string;
            region?: string;
            bucket: string;
            accessKeyId: string;
            secretAccessKey: string;
        };
    };
    email?: {
        from: {
            name?: string;
            email: string;
        } | string;
        templateDir?: string;
        smtp?: {
            host: string;
            port: number;
            user: string;
            pass: string;
            secure?: boolean;
        };
    };
};
export default class Config {
    #private;
    private static _configCache;
    static validate: () => void;
    static findPath: (cwd: string) => string;
    static get: () => ConfigT;
    static get secretKey(): string;
    static get mode(): "development" | "production";
    static get databaseUrl(): string;
    static get environments(): {
        title: string;
        key: string;
    }[];
    static get media(): {
        storageLimit: number;
        maxFileSize: number;
        store: {
            service: "aws" | "cloudflare";
            cloudflareAccountId: string | undefined;
            region: string | undefined;
            bucket: string;
            accessKeyId: string;
            secretAccessKey: string;
        };
    };
    static get email(): {
        from: string | {
            name?: string | undefined;
            email: string;
        };
        templateDir?: string | undefined;
        smtp?: {
            host: string;
            port: number;
            user: string;
            pass: string;
            secure?: boolean | undefined;
        } | undefined;
    } | undefined;
}
//# sourceMappingURL=Config.d.ts.map