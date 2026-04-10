import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import Profile from "../Profile";

jest.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: "user-001",
      name: "Jane Doe",
      email: "jane@example.com",
      role: "USER",
      createdAt: "2024-01-01T00:00:00Z",
    },
  }),
}));

const renderProfile = () =>
  render(
    <BrowserRouter>
      <Profile />
    </BrowserRouter>,
  );

describe("Profile Page", () => {
  test("renders profile heading", () => {
    renderProfile();
    expect(screen.getByText(/My Profile/i)).toBeInTheDocument();
  });

  test("displays user name", () => {
    renderProfile();
    expect(screen.getAllByText("Jane Doe").length).toBeGreaterThan(0);
  });

  test("displays user email", () => {
    renderProfile();
    expect(screen.getAllByText("jane@example.com").length).toBeGreaterThan(0);
  });

  test("shows Edit button", () => {
    renderProfile();
    expect(screen.getByRole("button", { name: /Edit/i })).toBeInTheDocument();
  });

  test("shows editable field when Edit is clicked", async () => {
    renderProfile();
    fireEvent.click(screen.getByRole("button", { name: /Edit/i }));
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Save Changes/i }),
      ).toBeInTheDocument();
    });
  });
});
