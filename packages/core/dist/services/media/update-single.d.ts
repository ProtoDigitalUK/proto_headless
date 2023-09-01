import { PoolClient } from "pg";
import fileUpload from "express-fileupload";
export interface ServiceData {
    key: string;
    data: {
        name?: string;
        alt?: string;
        files: fileUpload.FileArray | null | undefined;
    };
}
declare const updateSingle: (client: PoolClient, data: ServiceData) => Promise<import("@lucid/types/src/media").MediaResT>;
export default updateSingle;
//# sourceMappingURL=update-single.d.ts.map