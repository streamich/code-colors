import {tokenizeAsync} from './tokenize';
import {CompactMessageType} from './constants';
import type {
  CompactNotificationMessage,
  CompactRequestCompleteMessage,
  CompactResponseCompleteMessage,
  CompactResponseErrorMessage,
} from './types';
import type {HighlightParams, TokenNode} from './types';
import {isBrowserWorker} from './util';

if (isBrowserWorker) {
  onmessage = (e) => {
    const msg = e.data;
    if (!Array.isArray(msg)) return;
    if (msg[0] !== CompactMessageType.RequestComplete) return;
    const [, id, method, params] = msg as CompactRequestCompleteMessage<HighlightParams>;
    try {
      (async () => {
        if (method !== 'highlight') return;
        if (typeof params !== 'object') return;
        const {code, lang} = params as HighlightParams;
        if (typeof code !== 'string') return;
        if (typeof lang !== 'string' && lang !== undefined) return;
        const res = await tokenizeAsync(code, lang ?? 'c');
        const response: CompactResponseCompleteMessage<TokenNode> = [CompactMessageType.ResponseComplete, id, res];
        postMessage(response);
      })().catch((error) => {
        const response: CompactResponseErrorMessage = [CompactMessageType.ResponseError, id, error];
        postMessage(response);
      });
    } catch (error) {
      const response: CompactResponseErrorMessage = [CompactMessageType.ResponseError, id, error];
      postMessage(response);
    }
  };

  const ready: CompactNotificationMessage = [CompactMessageType.Notification, 'ready'];
  postMessage(ready);
}
