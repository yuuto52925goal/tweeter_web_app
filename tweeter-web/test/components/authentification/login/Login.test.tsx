import { MemoryRouter } from "react-router-dom"
import Login from "../../../../src/components/authentication/login/Login"
import { render, screen } from "@testing-library/react"
import React from "react"
import {userEvent} from "@testing-library/user-event"
import "@testing-library/jest-dom"
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
library.add(fab);

describe("Login component", () => {
  it("starts with the sign in button disable", () => {
    const {signInButton} = renderLoginAndGetElement("/")
    expect(signInButton).toBeDisabled()
  })
})

function renderLogin(originalUrl: string) {
  return render(
    <MemoryRouter>
      <Login originalUrl={originalUrl} />
    </MemoryRouter>
  )
}

function renderLoginAndGetElement(originalUrl: string){
  const user = userEvent.setup()
  renderLogin(originalUrl)
  const signInButton = screen.getByRole("button", {name: /Sign in/i})
  const aliasField = screen.getByLabelText("alias")
  const passwordField = screen.getByLabelText("password")
  return {user, signInButton, aliasField, passwordField}
}
