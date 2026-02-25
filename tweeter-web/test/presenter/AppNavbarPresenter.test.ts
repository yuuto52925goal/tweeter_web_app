import { AuthToken } from "tweeter-shared/dist/model/domain/AuthToken";
import {AppNavbarPresenter, AppNavbarView} from "../../src/presenter/AppNavbarPresenter"
import {anything, capture, instance, mock, spy, verify, when} from '@typestrong/ts-mockito'
import { UserService } from "../../src/model.service/UserService";

describe("AppNavbarPresenter", ()=> {
  let mockAppNavbarPresenterView: AppNavbarView;
  let appNavbarPresenter: AppNavbarPresenter;
  let mockService: UserService;
  const authToken = new AuthToken("abc123", Date.now());

  beforeEach(() => {
    mockAppNavbarPresenterView = mock<AppNavbarView>()
    const mockAppNavbarPresenterViewInstance = instance(mockAppNavbarPresenterView)
    when(mockAppNavbarPresenterView.displayInfoMessage(anything(), 0)).thenReturn("abc123id")
    const appNavbarPresenterSpy = spy(new AppNavbarPresenter(mockAppNavbarPresenterViewInstance))
    appNavbarPresenter = instance(appNavbarPresenterSpy)
    mockService = mock<UserService>()
    when(appNavbarPresenterSpy.service).thenReturn(instance(mockService))
  })

  it("tells the view to display a logging out message", async ()=> {
    await appNavbarPresenter.logOut(authToken)
    verify(mockAppNavbarPresenterView.displayInfoMessage(anything(), 0)).once()
  })

  it("calls logout on the user service with the correct auth token", async ()=> {
    await appNavbarPresenter.logOut(authToken)
    verify(mockService.logout(authToken)).once()
  })

  it("tells the view to clear the info message that was displayed previously, clear the user info, and navigate to the login page when succesfull", async ()=> {
    await appNavbarPresenter.logOut(authToken)
    verify(mockAppNavbarPresenterView.deleteMessage("abc123id")).once()
    verify(mockAppNavbarPresenterView.clearUserInfo()).once()
    verify(mockAppNavbarPresenterView.navigate(anything())).once()
    verify(mockAppNavbarPresenterView.displayErrorMessage(anything())).never()
  })

  it("tells the view to display an error message and does not tell it to clear the info message, clear the user info or navigate to the login page when not successfull", async ()=> {
    let error = new Error("An error occurred");
    when(mockService.logout(anything())).thenThrow(error)
    await appNavbarPresenter.logOut(authToken)
    // let [errorString] = capture(mockAppNavbarPresenterView.displayErrorMessage).last()
    // console.log(errorString)
    verify(mockAppNavbarPresenterView.displayErrorMessage("Failed to perform log user out because of exception: Error: An error occurred")).once()
    verify(mockAppNavbarPresenterView.deleteMessage(anything())).never()
    verify(mockAppNavbarPresenterView.clearUserInfo()).never()
    verify(mockAppNavbarPresenterView.navigate(anything())).never()
  })
})