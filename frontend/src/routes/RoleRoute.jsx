import { Navigate } from "react-router-dom";

const RoleRoute = ({
    children,
    role
}) => {

    const user =
        JSON.parse(
            localStorage.getItem("user")
        );

    if (!user) {
        return (
            <Navigate to="/login" />
        );
    }

    if (
        Array.isArray(role)
            ? !role.includes(user.role)
            : user.role !== role
    ) {
        return (
            <Navigate to="/" />
        );
    }

    return children;
};

export default RoleRoute;