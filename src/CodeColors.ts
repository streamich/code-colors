import {CompactMessageType} from 'json-joy/lib/reactive-rpc/common/codec/compact/constants';
import {Defer} from 'thingies/lib/Defer';
import type {
  CompactRequestCompleteMessage,
  CompactResponseCompleteMessage,
  CompactResponseErrorMessage,
} from 'json-joy/lib/reactive-rpc/common/codec/compact/types';
import type {HighlightParams, TokenNode} from './types';

export class CodeColors {
  protected id: number = 0;
  protected readonly worker: Worker;
  protected readonly workerReady: Promise<void>;
  protected readonly calls: Map<number, Defer<unknown>> = new Map();

  public constructor(workerUrl: string) {
    const ready = new Defer<void>();
    this.workerReady = ready.promise;
    const js = `importScripts("${workerUrl}");`;
    const blob = new Blob([js], {type: 'text/javascript'});
    const objectUrl = URL.createObjectURL(blob);
    this.worker = new Worker(objectUrl);
    URL.revokeObjectURL(objectUrl);
    this.worker.addEventListener('message', (event) => {
      const msg = event.data;
      if (!Array.isArray(msg)) return;
      switch (msg[0]) {
        case CompactMessageType.ResponseComplete: {
          const [, id, params] = msg as CompactResponseCompleteMessage;
          const call = this.calls.get(id);
          if (!call) return;
          this.calls.delete(id);
          call.resolve(params);
        }
        case CompactMessageType.ResponseError: {
          const [, id, error] = msg as CompactResponseErrorMessage;
          const call = this.calls.get(id);
          if (!call) return;
          this.calls.delete(id);
          call.reject(error);
        }
        case CompactMessageType.Notification: {
          if (msg[1] === 'ready') ready.resolve();
        }
      }
    });
  }

  public readonly highlight = async (code: string, lang?: string): Promise<TokenNode> => {
    await this.workerReady;
    const id = this.id++;
    const msg: CompactRequestCompleteMessage<HighlightParams> = [
      CompactMessageType.RequestComplete,
      id,
      'highlight',
      {code, lang},
    ];
    const call = new Defer<TokenNode>();
    this.worker.postMessage(msg);
    this.calls.set(id, call);
    return call.promise;
  };
}
