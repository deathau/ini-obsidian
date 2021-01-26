import './styles.scss'
import { Plugin,  EditableFileView, WorkspaceLeaf, ViewStateResult, addIcon } from 'obsidian';
import './lib/codemirror'
import './mode/properties/properties'

export default class IniPlugin extends Plugin {

  settings: any;

  async onload() {
    this.settings = await this.loadData() || {} as any;

    // register a custom icon
    this.addDocumentIcon("ini");

    // register the view and extensions
    this.registerView("ini", this.iniViewCreator);
    this.registerExtensions(["ini"], "ini");
  }

  // function to create the view
  iniViewCreator = (leaf: WorkspaceLeaf) => {
    return new IniView(leaf);
  }

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
class IniView extends EditableFileView {

  // internal code mirror instance
  codeMirror: CodeMirror.Editor;
  // timeout reference for saving changes
  changeTimer: any;

  // this.contentEl is not exposed, so cheat a bit.
  public get extContentEl(): HTMLElement {
    // @ts-ignore
    return this.contentEl;
  }


  // constructor (doing nothing special yet)
  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  // onload, load up code mirror
  onload = () => {
    // call the parent (just in case)
    super.onload();

    if (!this.codeMirror) {
      // codeMirror in ini mode (obsidian theme)
      this.codeMirror = CodeMirror(this.extContentEl, {
        mode: "text/x-ini",
        theme: "obsidian"
      })
      // register the changes event
      this.codeMirror.on('changes', this.changed);
    }
  }

  // onunload, clean up
  onunload = () => {
    // stop the current change timer (if any)
    this.stopChangeTimer();
    // save the current file
    this.save();
    // clean up code mirror
    this.codeMirror.off('changes', this.changed);
    delete this.codeMirror;
    // call the parent (just in case)
    super.onunload();
  }

  // called when state is changed, including setting a file
  setState = (state: any, result: ViewStateResult) => {
    // do the default, then call refresh
    return super.setState(state, result)
      .then(() => this.app.vault.cachedRead(this.file))
      .then((fileContents: string) => {
        // if we have a file that's not loaded into codeMirror yet, load it up
        if (this.file && this.codeMirror && !this.codeMirror.getValue()) {
          this.codeMirror.setValue(fileContents);
        }
      });
  }

  // called on code mirror changes
  changed = async (instance: CodeMirror.Editor, changes: CodeMirror.EditorChangeLinkedList[]) => {
    // stop the current change timer (if any)
    this.stopChangeTimer();
    // set a change timer for saving in 2 seconds
    this.changeTimer = setTimeout(this.save, 2000);
  }

  // stops the current change timer (if any)
  stopChangeTimer = () => {
    if (this.changeTimer) {
      clearTimeout(this.changeTimer);
      this.changeTimer = null;
    }
  }

  // saves the file
  save = async () => {
    await this.app.vault.modify(this.file, this.codeMirror.getValue());
    console.log("SAVED ini");
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