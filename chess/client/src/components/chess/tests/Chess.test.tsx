import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import Chess from "../Chess";

jest.mock("../../../hooks/userAuth", () => ({
    __esModule: true,
    default: () => ({
        user: { username: "TestUser" },
    }),
}));

test("renders Chess and shows status", () => {
    const { getByText } = render(<Chess />);
    expect(getByText(/White Turn|Black Turn|Check|Checkmate|Stalemate/)).toBeInTheDocument();
});
