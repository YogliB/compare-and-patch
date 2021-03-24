export interface Options {
  /** Path to the origin folder */
  origin: string;
  /** Path to the target folder */
  target: string;
  /** Keep files in the target directory that don't exist in the origin directory */
  keep?: boolean;
  /** Silence all logs and errors */
  silent?: boolean;
  /** Outputs all possible info */
  verbose?: boolean;
}

export type Arguments = Options & {
  help?: boolean;
  watch?: boolean;
};
