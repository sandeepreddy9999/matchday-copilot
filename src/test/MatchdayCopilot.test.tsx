import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import MatchdayCopilot from '../components/MatchdayCopilot';

describe('MatchdayCopilot', () => {
  it('renders the match header', () => {
    render(<MatchdayCopilot />);
    expect(screen.getByText(/Group Stage/i)).toBeInTheDocument();
  });

  it('filters the zone list when searching', async () => {
    render(<MatchdayCopilot />);
    // wait for the initial loading skeleton to clear
    await screen.findByLabelText(/Stadium bowl map/i);

    const search = screen.getByPlaceholderText(/Search a section/i);
    fireEvent.change(search, { target: { value: 'North' } });

    const list = screen.getAllByRole('list').find((el) => within(el).queryAllByText(/North/i).length > 0);
    expect(list).toBeTruthy();
    // "South" zones should no longer be present in the filtered list
    expect(list && within(list).queryAllByText(/South/i).length).toBe(0);
  });

  it('switches to the staff ops view and shows operational content', async () => {
    render(<MatchdayCopilot />);
    await screen.findByLabelText(/Stadium bowl map/i);

    fireEvent.click(screen.getByRole('tab', { name: /Staff ops view/i }));

    expect(screen.getByText(/Operations overview/i)).toBeInTheDocument();
    expect(screen.getByText(/Transport status/i)).toBeInTheDocument();
    expect(screen.getByText(/Sustainability insight/i)).toBeInTheDocument();
  });

  it('answers a quick-suggestion chip in the chat panel', async () => {
    render(<MatchdayCopilot />);
    await screen.findByLabelText(/Stadium bowl map/i);

    const chip = screen.getAllByText(/shortest wait/i)[0];
    fireEvent.click(chip);

    expect(await screen.findAllByText(/Offline answer/i)).not.toHaveLength(0);
  });
});
