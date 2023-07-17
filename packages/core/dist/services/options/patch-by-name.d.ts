import { PoolClient } from "pg";
import { OptionT } from "../../db/models/Option";
export interface ServiceData {
    name: OptionT["option_name"];
    value: OptionT["option_value"];
    type: OptionT["type"];
}
declare const patchByName: (client: PoolClient, data: ServiceData) => Promise<OptionT>;
export default patchByName;
//# sourceMappingURL=patch-by-name.d.ts.map