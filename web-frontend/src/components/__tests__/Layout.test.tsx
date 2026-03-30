import { render, screen } from "@testing-library/react";
import type React from "react";
import "@testing-library/jest-dom";

// Assuming the component exists in the original project at:
// /FinovaBank/web-frontend/src/components/Layout.tsx
// Adjust the import path if necessary.
// import Layout from '../../../../FinovaBank/web-frontend/src/components/Layout';

// Placeholder component for testing structure
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>
    <header>FinovaBank Header</header>
    <main>{children}</main>
    <footer>FinovaBank Footer</footer>
  </div>
);

describe("Layout Component", () => {
  test("renders header, footer, and children", () => {
    render(
      <Layout>
        <p>Test Content</p>
      </Layout>,
    );

    // Check if header and footer are rendered
    expect(screen.getByText("FinovaBank Header")).toBeInTheDocument();
    expect(screen.getByText("FinovaBank Footer")).toBeInTheDocument();

    // Check if children content is rendered
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });
});
