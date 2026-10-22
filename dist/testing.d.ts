declare const installSarakTestEnvironment: (target?: Window | undefined) => void;
declare const filterSarakTestConsoleLog: (log: string) => false | undefined;

export { filterSarakTestConsoleLog, installSarakTestEnvironment };
