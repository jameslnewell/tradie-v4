declare module 'finder-on-steroids' {

  export interface Finder {
    files(): Finder;
    directories(): Finder;
    find(): Promise<string[]>;
  }

  export interface FinderFactory {
    (dir: string): Finder;
    __setFiles(files: string[]): Finder;
  }

  const finder: FinderFactory;

  export default finder;

}
