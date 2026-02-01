import { InternalSendOptions, IpcTypeFlag, SendOptions } from "./common.js";
/**
 * @internal
 */
export declare function sendInternal(flag: IpcTypeFlag, options: InternalSendOptions): void;
/**
 * @internal
 */
export declare function send(options: SendOptions): void;
/**
 * @internal
 */
export declare function sendStreamInternal(flag: IpcTypeFlag, event: string, payload: string, streamId: string, force?: boolean): Promise<void>;
/**
 * @internal
 */
export declare function sendStream(options: SendOptions, streamId: string): Promise<void>;
