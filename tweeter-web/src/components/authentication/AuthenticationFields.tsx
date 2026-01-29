interface AuthenticationFieldProps {
  onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void;
  onChange: (value: string) => void;
}

export const AliasField = ({ onKeyDown, onChange }: AuthenticationFieldProps) => {
  return (
    <div className="form-floating">
      <input
        type="text"
        className="form-control"
        size={50}
        id="aliasInput"
        placeholder="name@example.com"
        onKeyDown={onKeyDown}
        onChange={(event) => onChange(event.target.value)}
      />
      <label htmlFor="aliasInput">Alias</label>
    </div>
  );
};

interface PasswordFieldProps extends AuthenticationFieldProps {
  bottomField?: boolean;
}

export const PasswordField = ({ onKeyDown, onChange, bottomField = false }: PasswordFieldProps) => {
  return (
    <div className={`form-floating ${bottomField ? " mb-3" : ""}`}>
      <input
        type="password"
        className={`form-control ${bottomField ? " bottom" : ""}`}
        id="passwordInput"
        placeholder="Password"
        onKeyDown={onKeyDown}
        onChange={(event) => onChange(event.target.value)}
      />
      <label htmlFor="passwordInput">Password</label>
    </div>
  );
};
