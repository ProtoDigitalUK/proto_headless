export interface ServiceData {
    form_key: string;
    environment_key: string;
}
declare const hasEnvironmentPermission: (data: ServiceData) => Promise<import("../environments").EnvironmentResT>;
export default hasEnvironmentPermission;
//# sourceMappingURL=has-environment-permission.d.ts.map