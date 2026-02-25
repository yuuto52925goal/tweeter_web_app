import { AuthToken } from "tweeter-shared/dist/model/domain/AuthToken";
import { User } from "tweeter-shared/dist/model/domain/User";
import { PostStatusPresenter, PostStatusView } from "../../src/presenter/PostStatusPresenter";
import { anything, capture, instance, mock, spy, verify, when } from "@typestrong/ts-mockito";
import { StatusService } from "../../src/model.service/StatusService";

describe("PostStatusPresenter", () => {
  let mockPostStatusView: PostStatusView;
  let postStatusPresenter: PostStatusPresenter;
  let mockService: StatusService;

  const authToken = new AuthToken("abc123", Date.now());
  const currentUser = new User("First", "Last", "@alias", "https://example.com/pic.jpg");
  const post = "Hello, Tweeter!";

  beforeEach(() => {
    mockPostStatusView = mock<PostStatusView>();
    const mockPostStatusViewInstance = instance(mockPostStatusView);
    when(mockPostStatusView.displayInfoMessage("Posting status...", 0)).thenReturn("postingToastId");

    const postStatusPresenterSpy = spy(new PostStatusPresenter(mockPostStatusViewInstance));
    postStatusPresenter = instance(postStatusPresenterSpy);

    mockService = mock<StatusService>();
    when(postStatusPresenterSpy.service).thenReturn(instance(mockService));
  });

  it("tells the view to display a posting status message", async () => {
    await postStatusPresenter.submitPost(authToken, post, currentUser);
    verify(mockPostStatusView.displayInfoMessage("Posting status...", 0)).once();
  });

  it("calls postStatus on the status service with the correct auth token and status", async () => {
    await postStatusPresenter.submitPost(authToken, post, currentUser);
    verify(mockService.postStatus(authToken, anything())).once();
    const [, capturedStatus] = capture(mockService.postStatus).last();
    expect(capturedStatus.post).toBe(post);
  });

  it("tells the view to clear the info message, clear the post, and display a status posted message when successful", async () => {
    await postStatusPresenter.submitPost(authToken, post, currentUser);
    verify(mockPostStatusView.deleteMessage("postingToastId")).once();
    verify(mockPostStatusView.setPost("")).once();
    verify(mockPostStatusView.displayInfoMessage("Status posted!", 2000)).once();
    verify(mockPostStatusView.displayErrorMessage(anything())).never();
  });

  it("tells the view to clear the info message and display an error message, but does not clear the post or display a status posted message when not successful", async () => {
    const error = new Error("An error occurred");
    when(mockService.postStatus(anything(), anything())).thenThrow(error);
    await postStatusPresenter.submitPost(authToken, post, currentUser);
    verify(mockPostStatusView.displayErrorMessage("Failed to perform post the status because of exception: Error: An error occurred")).once();
    verify(mockPostStatusView.deleteMessage("postingToastId")).once();
    verify(mockPostStatusView.setPost(anything())).never();
    verify(mockPostStatusView.displayInfoMessage("Status posted!", 2000)).never();
  });
});
