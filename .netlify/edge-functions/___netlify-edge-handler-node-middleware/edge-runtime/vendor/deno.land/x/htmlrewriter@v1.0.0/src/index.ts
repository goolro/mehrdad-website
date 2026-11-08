import { HTMLRewriter as RawHTMLRewriter } from "../pkg/htmlrewriter.js";
import type { DocumentHandlers, ElementHandlers } from "./types.d.ts";

export type {
  Comment,
  ContentTypeOptions,
  Doctype,
  DocumentEnd,
  DocumentHandlers,
  Element,
  ElementHandlers,
  EndTag,
  TextChunk,
} from "./types.d.ts";

export { default as init } from "../pkg/htmlrewriter.js";

export class HTMLRewriter {
  constructor() {}

  elementHandlers: [selector: string, handlers: ElementHandlers][] = [];
  documentHandlers: DocumentHandlers[] = [];

  on(selector: string, handlers: ElementHandlers): HTMLRewriter {
    this.elementHandlers.push([selector, handlers]);
    return this;
  }
  onDocument(handlers: DocumentHandlers): HTMLRewriter {
    this.documentHandlers.push(handlers);
    return this;
  }

  transform(response: Response): Response {
    const body = response.body as ReadableStream<Uint8Array> | null;
    // HTMLRewriter doesn't run the end handler if the body is null, so it's
    // pointless to setup the transform stream.
    if (body === null) {
      return new Response(body, response);
    }

    if (response instanceof Response) {
      // Make sure we validate chunks are BufferSources and convert them to
      // Uint8Arrays as required by the Rust glue code.
      response = new Response(response.body, response);
    }

    let rewriter: RawHTMLRewriter;
    const transformStream = new TransformStream<Uint8Array, Uint8Array>({
      start: (controller) => {
        // Create a rewriter instance for this transformation that writes its
        // output to the transformed response's stream. Note that each
        // RawHTMLRewriter can only be used once.
        rewriter = new RawHTMLRewriter((chunk: Uint8Array) => {
          // enqueue will throw on empty chunks
          if (chunk.length !== 0) controller.enqueue(chunk);
        });
        // Add all registered handlers
        for (const [selector, handlers] of this.elementHandlers) {
          rewriter.on(selector, handlers);
        }
        for (const handlers of this.documentHandlers) {
          rewriter.onDocument(handlers);
        }
      },
      transform: (chunk) => {
        rewriter.write(chunk);
      },
      flush: () => {
        rewriter.end();
        rewriter.free();
      },
    });
    // Return a response with the transformed body, copying over headers, etc
    const res = new Response(body.pipeThrough(transformStream), response);
    // If Content-Length is set, it's probably going to be wrong, since we're
    // rewriting content, so remove it
    res.headers.delete("Content-Length");
    return res;
  }
}
