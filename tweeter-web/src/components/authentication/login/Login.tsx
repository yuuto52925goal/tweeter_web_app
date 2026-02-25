import "./Login.css";
import "bootstrap/dist/css/bootstrap.css";
import { useUserInfoActions } from "../../userInfo/UserInfoHooks";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthenticationFormLayout from "../AuthenticationFormLayout";
import { AliasField, PasswordField } from "../AuthenticationFields";
import { useMessageActions } from "../../toaster/MessageHooks";
import { LoginPresenter } from "../../../presenter/authentification/each/LoginPresenter";
import { AuthView } from "../../../presenter/authentification/AuthenticationPresenter";

interface Props {
  originalUrl?: string;
  presenter?: LoginPresenter
}

const Login = (props: Props) => {
  const [alias, setAlias] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { updateUserInfo } = useUserInfoActions();
  const { displayErrorMessage } = useMessageActions();

  const listener: AuthView = {
    updateUserInfo: updateUserInfo,
    navigate: navigate,
    displayErrorMessage: displayErrorMessage,
    setIsLoading: setIsLoading,
  };

  const presenter = useRef<LoginPresenter | null>(null);
  if (!presenter.current) {
    presenter.current = props.presenter ?? new LoginPresenter(listener);
  }

  const checkSubmitButtonStatus = (): boolean => {
    return !alias || !password;
  };

  const loginOnEnter = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key == "Enter" && !checkSubmitButtonStatus()) {
      doLogin();
    }
  };

  const doLogin = async () => {
    await presenter.current!.doLogin(alias, password, rememberMe, props.originalUrl);
  };

  const inputFieldFactory = () => {
    return (
      <>
        <AliasField onKeyDown={loginOnEnter} onChange={setAlias} />
        <PasswordField onKeyDown={loginOnEnter} onChange={setPassword} bottomField />
      </>
    );
  };

  const switchAuthenticationMethodFactory = () => {
    return (
      <div className="mb-3">
        Not registered? <Link to="/register">Register</Link>
      </div>
    );
  };

  return (
    <AuthenticationFormLayout
      headingText="Please Sign In"
      submitButtonLabel="Sign in"
      oAuthHeading="Sign in with:"
      inputFieldFactory={inputFieldFactory}
      switchAuthenticationMethodFactory={switchAuthenticationMethodFactory}
      setRememberMe={setRememberMe}
      submitButtonDisabled={checkSubmitButtonStatus}
      isLoading={isLoading}
      submit={doLogin}
    />
  );
};

export default Login;
