export interface ContentTypeOptions {
  html?: boolean;
}

export class Element {
  before(content: string, options?: ContentTypeOptions): this;
  after(content: string, options?: ContentTypeOptions): this;
  replace(content: string, options?: ContentTypeOptions): this;
  remove(): this;
  getAttribute(name: string): string | null;
  hasAttribute(name: string): boolean;
  setAttribute(name: string, value: string): this;
  removeAttribute(name: string): this;
  prepend(content: string, options?: ContentTypeOptions): this;
  append(content: string, options?: ContentTypeOptions): this;
  setInnerContent(content: string, options?: ContentTypeOptions): this;
  removeAndKeepContent(): this;
  readonly attributes: [string, string][];
  readonly namespaceURI: string;
  readonly removed: boolean;
  tagName: string;
}

export class EndTag {
  before(content: string, options?: ContentTypeOptions): this;
  after(content: string, options?: ContentTypeOptions): this;
  remove(): this;
  name: string;
}

export class Comment {
  before(content: string, options?: ContentTypeOptions): this;
  after(content: string, options?: ContentTypeOptions): this;
  replace(content: string, options?: ContentTypeOptions): this;
  remove(): this;
  readonly removed: boolean;
  text: string;
}

export class TextChunk {
  before(content: string, options?: ContentTypeOptions): this;
  after(content: string, options?: ContentTypeOptions): this;
  replace(content: string, options?: ContentTypeOptions): this;
  remove(): this;
  readonly lastInTextNode: boolean;
  readonly removed: boolean;
  readonly text: string;
}

export class Doctype {
  readonly name: string | null;
  readonly publicId: string | null;
  readonly systemId: string | null;
}

export class DocumentEnd {
  append(content: string, options?: ContentTypeOptions): this;
}

export interface ElementHandlers {
  element?(element: Element): void;
  comments?(comment: Comment): void;
  text?(text: TextChunk): void;
}

export interface DocumentHandlers {
  doctype?(doctype: Doctype): void;
  comments?(comment: Comment): void;
  text?(text: TextChunk): void;
  end?(end: DocumentEnd): void;
}
