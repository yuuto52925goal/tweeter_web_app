import { MemoryRouter } from "react-router-dom"
import Login from "../../../../src/components/authentication/login/Login"
import { render, screen } from "@testing-library/react"
import React from "react"
import {userEvent} from "@testing-library/user-event"
import "@testing-library/jest-dom"
import { LoginPresenter } from "../../../../src/presenter/authentification/each/LoginPresenter"
import { instance, mock, verify} from '@typestrong/ts-mockito'

describe("Login component", () => {
  it("starts with the sign in button disable", () => {
    const {signInButton} = renderLoginAndGetElement("/")
    expect(signInButton).toBeDisabled()
  })

  it("enable the sign in button if both alisa and password fields have text", async () => {
    const { signInButton, aliasField, passwordField, user} = renderLoginAndGetElement("/")
    await user.type(aliasField, "a")
    await user.type(passwordField, "b")
    expect(signInButton).toBeEnabled()
  })

  it("disable the sign in button if either the alisa or the passowrd field is cleared", async () => {
    const { signInButton, aliasField, passwordField, user} = renderLoginAndGetElement("/")
    await user.type(aliasField, "a")
    await user.type(passwordField, "b")
    expect(signInButton).toBeEnabled()
    
    await user.clear(aliasField)
    expect(signInButton).toBeDisabled()

    await user.type(aliasField, "a")
    expect(signInButton).toBeEnabled()

    await user.clear(passwordField)
    expect(signInButton).toBeDisabled()
  })

  it("calls the presenter's login method with correct parameter when the sign in button is pressed", async () => {
    const mockPresenter = mock<LoginPresenter>()
    const mockPresenterInstance = instance(mockPresenter)
    const originalUrl = "http://hello"
    const alias = "yuto"
    const passoword = "abc123"
    const { signInButton, aliasField, passwordField, user} = renderLoginAndGetElement(originalUrl, mockPresenterInstance)
    await user.type(aliasField, alias)
    await user.type(passwordField, passoword)
    // await user.click(screen.getByRole("checkbox"))
    await user.click(signInButton)

    verify(mockPresenter.doLogin(alias, passoword, false, originalUrl)).once()
  })
})

function renderLogin(originalUrl: string, presenter?: LoginPresenter) {
  return render(
    <MemoryRouter>
      {!!presenter? (
        <Login originalUrl={originalUrl} presenter={presenter}/>
      ): (
        <Login originalUrl={originalUrl} />
      )}
    </MemoryRouter>
  )
}

function renderLoginAndGetElement(originalUrl: string, presenter?: LoginPresenter){
  const user = userEvent.setup()
  renderLogin(originalUrl, presenter)
  const signInButton = screen.getByRole("button", {name: /Sign in/i})
  const aliasField = screen.getByLabelText("alias")
  const passwordField = screen.getByLabelText("password")
  return {user, signInButton, aliasField, passwordField}
}
