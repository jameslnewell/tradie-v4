declare module 'finder-on-steroids' {

  interface FoSFinder {
    files(): FoSFinder;
    directories(): FoSFinder;
    find(): Promise<string[]>;
    filter(filter: (file: string) => boolean): FoSFinder;
  }

  interface FoSFinderFactory {
    (dir: string): FoSFinder;
    __setFiles(files: string[]): FoSFinder;
  }

  namespace fof {
    export type Finder = FoSFinder;
    export type FinderFactory = FoSFinderFactory;
  }

  var fof: FoSFinderFactory;

  export = fof;

}
