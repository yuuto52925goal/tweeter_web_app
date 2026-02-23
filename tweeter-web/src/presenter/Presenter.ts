export interface PresenterView {
  displayErrorMessage: (message: string) => void;
}

export interface MessageView extends PresenterView {
  displayInfoMessage: (message: string, duration: number) => string;
  deleteMessage: (id: string) => void;
}

export abstract class Presenter<V extends PresenterView> {
  private _view: V;

  constructor(view: V) {
    this._view = view;
  }

  public get view(): V {
    return this._view;
  }

  public async doFailureReportingOperation(
    operation: () => Promise<void>,
    operationName: string,
    finallyOperation?: () => void
  ) {
    try {
      await operation();
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to perform ${operationName} because of exception: ${error}`
      );
    } finally {
      finallyOperation?.();
    }
  }
}