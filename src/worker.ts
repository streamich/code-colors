import {highlight} from './hljs';
import {CompactMessageType} from 'json-joy/lib/reactive-rpc/common/codec/compact/constants';
import type {CompactNotificationMessage, CompactRequestCompleteMessage, CompactResponseCompleteMessage, CompactResponseErrorMessage} from 'json-joy/lib/reactive-rpc/common/codec/compact/types';
import type {HighlightParams, TokenNode} from './types';

const isWorker = ('undefined' !== typeof WorkerGlobalScope) && ("function" === typeof importScripts);

if (isWorker) {
  onmessage = e => {
    const msg = e.data;
    if (!Array.isArray(msg)) return;
    if (msg[0] !== CompactMessageType.RequestComplete) return;
    const [, id, method, params] = msg as CompactRequestCompleteMessage;
    try {
      if (method !== 'highlight') return;
      if (typeof params !== 'object') return;
      const {code, lang} = params as HighlightParams;
      if (typeof code !== 'string') return;
      if (typeof lang !== 'string' || lang !== undefined) return;
      const res = highlight(code, lang);
      const response: CompactResponseCompleteMessage<TokenNode> = [CompactMessageType.ResponseComplete, id, res];
      postMessage(response);
    } catch (error) {
      const response: CompactResponseErrorMessage = [CompactMessageType.ResponseError, id, error];
      postMessage(response);
    }
  };

  const ready: CompactNotificationMessage = [CompactMessageType.Notification, 'ready'];
  postMessage(ready);
}
