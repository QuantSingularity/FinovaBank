import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import Settings from "../Settings";

const renderSettings = () =>
  render(
    <BrowserRouter>
      <Settings />
    </BrowserRouter>,
  );

describe("Settings Page", () => {
  test("renders Settings heading", () => {
    renderSettings();
    expect(screen.getByText(/^Settings$/)).toBeInTheDocument();
  });

  test("renders Notifications section", () => {
    renderSettings();
    expect(screen.getByText("Notifications")).toBeInTheDocument();
  });

  test("renders Security section", () => {
    renderSettings();
    expect(screen.getByText("Security")).toBeInTheDocument();
  });

  test("renders Preferences section", () => {
    renderSettings();
    expect(screen.getByText("Preferences")).toBeInTheDocument();
  });

  test("renders Save Changes button", () => {
    renderSettings();
    expect(
      screen.getByRole("button", { name: /Save Changes/i }),
    ).toBeInTheDocument();
  });

  test("shows success snackbar on save", async () => {
    renderSettings();
    fireEvent.click(screen.getByRole("button", { name: /Save Changes/i }));
    await waitFor(() => {
      expect(
        screen.getByText(/Settings saved successfully/i),
      ).toBeInTheDocument();
    });
  });

  test("renders Two-Factor Authentication toggle", () => {
    renderSettings();
    expect(screen.getByText(/Two-Factor Authentication/i)).toBeInTheDocument();
  });
});
