// declare let _fnbrClient: any;
declare global {
  namespace NodeJS {
    interface Global {
      _fnbrClient: Record<string, string> | undefined;
    }
  }
}
export default global;
