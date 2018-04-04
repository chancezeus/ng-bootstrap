import {
  ComponentFactoryResolver,
  ComponentRef,
  EmbeddedViewRef,
  Injector,
  Renderer2,
  TemplateRef,
  ViewContainerRef,
  ViewRef
} from '@angular/core';
import {NgbPopoverWindow} from './popover';

export class ContentRef {
  constructor(
    public nodes: any[], public contentViewRef?: ViewRef,
    public titleViewRef?: ViewRef, public componentRef?: ComponentRef<any>
  ) {}
}

export class PopoverService {
  private _windowRef: ComponentRef<NgbPopoverWindow>;
  private _contentRef: ContentRef;

  constructor(
    private _type: any, private _injector: Injector, private _viewContainerRef: ViewContainerRef,
    private _renderer: Renderer2, private _componentFactoryResolver: ComponentFactoryResolver) {}

  open(content?: string | TemplateRef<any>, title?: string | TemplateRef<any>, context?: any): ComponentRef<NgbPopoverWindow> {
    if (!this._windowRef) {
      this._contentRef = this._getContentRef(content, title, context);
      this._windowRef = this._viewContainerRef.createComponent(
        this._componentFactoryResolver.resolveComponentFactory<NgbPopoverWindow>(this._type), 0, this._injector,
        this._contentRef.nodes);
    }

    return this._windowRef;
  }

  close() {
    if (this._windowRef) {
      this._viewContainerRef.remove(this._viewContainerRef.indexOf(this._windowRef.hostView));
      this._windowRef = null;

      if (this._contentRef.contentViewRef) {
        this._viewContainerRef.remove(this._viewContainerRef.indexOf(this._contentRef.contentViewRef));
      }

      if (this._contentRef.titleViewRef) {
        this._viewContainerRef.remove(this._viewContainerRef.indexOf(this._contentRef.titleViewRef));
      }

      this._contentRef = null;
    }
  }

  private _getContentRef(content: string | TemplateRef<any>, title: string | TemplateRef<any>, context?: any): ContentRef {
    if (!content && !title) {
      return new ContentRef([]);
    }

    let titleViewRef: EmbeddedViewRef<NgbPopoverWindow> = undefined;
    const elements = [];
    if (title) {
      let titleElement = this._renderer.createElement('popover-title');
      if (title instanceof TemplateRef) {
        titleViewRef = this._viewContainerRef.createEmbeddedView(<TemplateRef<NgbPopoverWindow>>title, context);
        titleViewRef.rootNodes.forEach(node => this._renderer.appendChild(titleElement, node));
      } else {
        this._renderer.appendChild(titleElement, this._renderer.createText(`${title}`));
      }

      elements.push([titleElement]);
    }

    let contentViewRef: EmbeddedViewRef<NgbPopoverWindow> = undefined;
    if (content) {
      let contentElement = this._renderer.createElement('popover-body');
      if (content instanceof TemplateRef) {
        contentViewRef = this._viewContainerRef.createEmbeddedView(<TemplateRef<NgbPopoverWindow>>content, context);
        contentViewRef.rootNodes.forEach(node => this._renderer.appendChild(contentElement, node));
      } else {
        this._renderer.appendChild(contentElement, this._renderer.createText(`${content}`));
      }

      elements.push([contentElement]);
    }

    return new ContentRef(elements, contentViewRef, titleViewRef);
  }
}
