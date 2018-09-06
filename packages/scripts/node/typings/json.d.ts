
declare module "*/tsconfig.json" {
  let compilerOptions: Object;
  export { compilerOptions };
}

declare module "*/package.json" {
  let version: string;
  export { version };
}
