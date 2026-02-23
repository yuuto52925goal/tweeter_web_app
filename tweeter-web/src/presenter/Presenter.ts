export interface PresenterView {
  displayErrorMessage: (message: string) => void;
}
export abstract class Presenter<V extends PresenterView> {
  private _view: V;

  protected constructor(view: V) {
    this._view = view;
  }

  public get view(): V {
    return this._view;
  }

  public async doFailureReportingOperation(operation: () => Promise<void>) {
    try {
      await operation();
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to perform operation because of exception: ${error}`
      );
    }
  }
}