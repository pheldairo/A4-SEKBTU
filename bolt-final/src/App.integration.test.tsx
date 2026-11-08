// @vitest-environment jsdom
// Assignment #04 - UI / integration checks. The real <App> is rendered in
// jsdom with a fixed clock (now = 540 = 09:00) and driven like a user would:
// filters -> room cards -> time inputs -> Check Availability -> result panel.
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import App from "./App";

afterEach(cleanup);

const NOW = 540;

function roomButton(name: RegExp) {
  return screen.getByRole("button", { name });
}

function setTimes(start: string, end: string) {
  fireEvent.change(screen.getByLabelText("Start time"), { target: { value: start } });
  fireEvent.change(screen.getByLabelText("End time"), { target: { value: end } });
}

function check() {
  fireEvent.click(screen.getByRole("button", { name: /check availability/i }));
}

function listedRoomNames(): string[] {
  const list = screen.queryByRole("heading", { name: "Matching rooms" })?.parentElement;
  if (!list) return [];
  return within(list)
    .getAllByRole("button")
    .map((b) => b.querySelector("p")?.textContent ?? "");
}

describe("UI integration (fixed clock 09:00)", () => {
  it("U1 F5: switching room clears the old result and the next check uses the new room's bookings", () => {
    render(<App now={NOW} />);
    fireEvent.click(roomButton(/Seminar Room 101/));
    setTimes("10:30", "11:30");
    check();
    expect(screen.getByRole("alert").textContent).toContain("Research Sync");

    fireEvent.click(roomButton(/Computer Lab 310/));
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByText(/Enter a start and end time/)).toBeTruthy();

    check();
    expect(screen.getByRole("status").textContent).toContain("Available");
  });

  it("U2 F1/F4: impossible capacity shows the empty state, disables the check, and Clear filters restores the list", () => {
    render(<App now={NOW} />);
    fireEvent.change(screen.getByLabelText("Attendees"), { target: { value: "31" } });
    expect(screen.getByText("No rooms match these requirements")).toBeTruthy();
    expect(
      (screen.getByRole("button", { name: /check availability/i }) as HTMLButtonElement).disabled,
    ).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(listedRoomNames()).toHaveLength(5);
  });

  it("U3 F2: ticking Projector + Video Conference leaves only the room that has both", () => {
    render(<App now={NOW} />);
    fireEvent.click(screen.getByLabelText("Projector"));
    fireEvent.click(screen.getByLabelText("Video Conference"));
    expect(listedRoomNames()).toEqual(["Seminar Room 101"]);
  });

  it("U4 F3/AC3: the blocked room stays visible but a free slot is reported Unavailable", () => {
    render(<App now={NOW} />);
    fireEvent.click(roomButton(/Library Study Room 110/));
    setTimes("12:00", "13:00");
    check();
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain("Unavailable");
    expect(alert.textContent).toContain("Closed for maintenance");
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("U5 AC6: an empty time field shows a clear validation message instead of a result", () => {
    render(<App now={NOW} />);
    setTimes("", "11:00");
    check();
    expect(screen.getByText(/Enter times as HH:MM/)).toBeTruthy();
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("U6 F5: a room hidden by a filter does not silently come back as the selection when the filter is relaxed", () => {
    render(<App now={NOW} />);
    fireEvent.click(roomButton(/Innovation Hub 12/));
    expect(roomButton(/Innovation Hub 12/).getAttribute("aria-pressed")).toBe("true");

    fireEvent.change(screen.getByLabelText("Attendees"), { target: { value: "10" } });
    expect(screen.queryByRole("button", { name: /Innovation Hub 12/ })).toBeNull();
    expect(roomButton(/Engineering Hall 204/).getAttribute("aria-pressed")).toBe("true");

    fireEvent.change(screen.getByLabelText("Attendees"), { target: { value: "1" } });
    // the user saw Engineering Hall 204 selected, so it must stay selected
    expect(roomButton(/Engineering Hall 204/).getAttribute("aria-pressed")).toBe("true");
    expect(roomButton(/Innovation Hub 12/).getAttribute("aria-pressed")).toBe("false");
  });
});
