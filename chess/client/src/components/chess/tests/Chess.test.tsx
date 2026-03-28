import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import Chess from "../Chess";

test("renders Chess and shows status", () => {
    const { getByText } = render(<Chess />);
    expect(getByText(/White Turn|Black Turn|Check|Checkmate|Stalemate/)).toBeInTheDocument();
});
