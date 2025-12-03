import { Link } from "react-router";
import { GenericButton, type ButtonProps } from "./GenericButton";

interface LinkButtonProps extends ButtonProps {
    path: string;
};

export function LinkButton({ path, onClick, disabled, children, className }:  LinkButtonProps) {
    return (
      <Link to={path}>
        <GenericButton
              onClick={onClick}
              disabled={disabled}
              className={`bg-transparent border border-blue-500 disabled:border-gray-400 ${className}`}
            >
              {children}
        </GenericButton>
      </Link>
    )
}