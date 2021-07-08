import './styles.scss'
import { Plugin, WorkspaceLeaf, addIcon, TextFileView } from 'obsidian';
import './lib/codemirror'
import './mode/properties/properties'

export default class IniPlugin extends Plugin {

  settings: any;

  async onload() {
    super.onload();
    this.settings = await this.loadData() || {} as any;

    // register a custom icon
    this.addDocumentIcon("ini");
    this.addDocumentIcon("xml");
    this.addDocumentIcon("fodt");

    // register the view and extensions
    this.registerView("ini", this.iniViewCreator);
    this.registerView("xml", this.xmlViewCreator);
    this.registerView("fodt", this.xmlViewCreator);

    this.registerExtensions(["ini"], "ini");
    this.registerExtensions(["xml"], "xml");
    this.registerExtensions(["fodt"], "xml");
  }

  // function to create the view
  iniViewCreator = (leaf: WorkspaceLeaf) => {
    return new IniView(leaf);
  }

  xmlViewCreator = (leaf: WorkspaceLeaf) => {
    return new XmlView(leaf);
  }

  // this function used the regular 'document' svg,
  // but adds the supplied extension into the icon as well
  addDocumentIcon = (extension: string) => {
    addIcon(`document-${extension}`, `
  <path fill="currentColor" stroke="currentColor" d="M14,4v92h72V29.2l-0.6-0.6l-24-24L60.8,4L14,4z M18,8h40v24h24v60H18L18,8z M62,10.9L79.1,28H62V10.9z"></path>
  <text font-family="sans-serif" font-weight="bold" font-size="30" fill="currentColor" x="50%" y="60%" dominant-baseline="middle" text-anchor="middle">
    ${extension}
  </text>
    `);
  }
}

// This is the custom view
class IniView extends TextFileView {

  // internal code mirror instance
  codeMirror: CodeMirror.Editor;

  // this.contentEl is not exposed, so cheat a bit.
  public get extContentEl(): HTMLElement {
    // @ts-ignore
    return this.contentEl;
  }

  // constructor
  constructor(leaf: WorkspaceLeaf) {
    super(leaf);

    // create code mirror instance
    this.codeMirror = CodeMirror(this.extContentEl, {
      theme: "obsidian"
    });
    // register the changes event
    this.codeMirror.on('changes', this.changed);
  }

  // when the view is resized, refresh CodeMirror (thanks Licat!)
  onResize() {
    this.codeMirror.refresh();
  }

  // called on code mirror changes
  changed = async (instance: CodeMirror.Editor, changes: CodeMirror.EditorChangeLinkedList[]) => {
    // request a debounced save in 2 seconds from now
    this.requestSave();
  }

  // get the new file contents
  getViewData = () => {
    return this.codeMirror.getValue();
  }

  // set the file contents
  setViewData = (data: string, clear: boolean) => {
    if (clear) {
      this.codeMirror.swapDoc(CodeMirror.Doc(data, "text/x-ini"))
    }
    else {
      this.codeMirror.setValue(data);
    }
  }

  // clear the view content
  clear = () => {
    this.codeMirror.setValue('');
    this.codeMirror.clearHistory();
  }

  // gets the title of the document
  getDisplayText() {
    if (this.file) return this.file.basename;
    else return "ini (no file)";
  }

  // confirms this view can accept ini extension
  canAcceptExtension(extension: string) {
    
    return extension == 'ini';
  }

  // the view type name
  getViewType() {
    return "ini";
  }

  // icon for the view
  getIcon() {
    return "document-ini";
  }
}

// This is the custom view
class XmlView extends TextFileView {

  // internal code mirror instance
  codeMirror: CodeMirror.Editor;

  // this.contentEl is not exposed, so cheat a bit.
  public get extContentEl(): HTMLElement {
    // @ts-ignore
    return this.contentEl;
  }

  // constructor
  constructor(leaf: WorkspaceLeaf) {
    super(leaf);

    // create code mirror instance
    this.codeMirror = CodeMirror(this.extContentEl, {
      theme: "obsidian"
    });
    // register the changes event
    this.codeMirror.on('changes', this.changed);
  }

  // when the view is resized, refresh CodeMirror (thanks Licat!)
  onResize() {
    this.codeMirror.refresh();
  }

  // called on code mirror changes
  changed = async (instance: CodeMirror.Editor, changes: CodeMirror.EditorChangeLinkedList[]) => {
    // request a debounced save in 2 seconds from now
    this.requestSave();
  }

  // get the new file contents
  getViewData = () => {
    return this.codeMirror.getValue();
  }

  // set the file contents
  setViewData = (data: string, clear: boolean) => {
    if (clear) {
      this.codeMirror.swapDoc(CodeMirror.Doc(data, "text/xml"))
    }
    else {
      this.codeMirror.setValue(data);
    }
  }

  // clear the view content
  clear = () => {
    this.codeMirror.setValue('');
    this.codeMirror.clearHistory();
  }

  // gets the title of the document
  getDisplayText() {
    if (this.file) return this.file.basename;
    else return "xml (no file)";
  }

  // confirms this view can accept ini extension
  canAcceptExtension(extension: string) {

    return extension == 'xml';
  }

  // the view type name
  getViewType() {
    return "xml";
  }

  // icon for the view
  getIcon() {
    return "document-xml";
  }
}

