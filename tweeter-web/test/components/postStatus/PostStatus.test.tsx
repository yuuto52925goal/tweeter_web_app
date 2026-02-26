import React from "react";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { AuthToken, User } from "tweeter-shared";
import { instance, mock, verify } from "@typestrong/ts-mockito";
import PostStatus from "../../../src/components/postStatus/PostStatus";
import { PostStatusPresenter } from "../../../src/presenter/PostStatusPresenter";
import { useUserInfo } from "../../../src/components/userInfo/UserInfoHooks";

jest.mock("../../../src/components/userInfo/UserInfoHooks", () => ({
  ...jest.requireActual("../../../src/components/userInfo/UserInfoHooks"),
  __esModule: true,
  useUserInfo: jest.fn(),
}));

const currentUser = new User("First", "Last", "@alias", "https://example.com/pic.jpg");
const authToken = new AuthToken("abc123", Date.now());

describe("PostStatus component", () => {
  beforeAll(() => {
    (useUserInfo as jest.Mock).mockReturnValue({
      currentUser: currentUser,
      authToken: authToken,
    });
  });

  it("starts with the Post Status and Clear buttons disabled", () => {
    const { postStatusButton, clearButton } = renderPostStatusAndGetElements();
    expect(postStatusButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
  });

  it("enables both buttons when the text field has text", async () => {
    const { postStatusButton, clearButton, textField, user } = renderPostStatusAndGetElements();
    await user.type(textField, "Hello!");
    expect(postStatusButton).toBeEnabled();
    expect(clearButton).toBeEnabled();
  });

  it("disables both buttons when the text field is cleared", async () => {
    const { postStatusButton, clearButton, textField, user } = renderPostStatusAndGetElements();
    await user.type(textField, "Hello!");
    expect(postStatusButton).toBeEnabled();
    expect(clearButton).toBeEnabled();
    await user.clear(textField);
    expect(postStatusButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
  });

  it("calls the presenter's submitPost method with correct parameters when the Post Status button is pressed", async () => {
    const mockPresenter = mock<PostStatusPresenter>();
    const mockPresenterInstance = instance(mockPresenter);
    const post = "Hello, Tweeter!";
    const { postStatusButton, textField, user } = renderPostStatusAndGetElements(mockPresenterInstance);
    await user.type(textField, post);
    await user.click(postStatusButton);
    verify(mockPresenter.submitPost(authToken, post, currentUser)).once();
  });
});

function renderPostStatus(presenter?: PostStatusPresenter) {
  return render(
    !!presenter ? (
      <PostStatus presenter={presenter} />
    ) : (
      <PostStatus />
    )
  );
}

function renderPostStatusAndGetElements(presenter?: PostStatusPresenter) {
  const user = userEvent.setup();
  renderPostStatus(presenter);
  const postStatusButton = screen.getByRole("button", { name: /Post Status/i });
  const clearButton = screen.getByRole("button", { name: /Clear/i });
  const textField = screen.getByPlaceholderText("What's on your mind?");
  return { user, postStatusButton, clearButton, textField };
}
