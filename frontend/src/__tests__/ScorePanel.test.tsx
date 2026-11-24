import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScorePanel } from '../components/ScorePanel';
import { evaluation } from './fixtures';

describe('ScorePanel', () => {
  it('shows the score, the band, the plain-words reason and the recommendation', () => {
    render(<ScorePanel apiData={evaluation()} loading={false} />);
    expect(screen.getByText('69.5')).toBeInTheDocument();
    expect(screen.getByText(/\/ 100 · critical load/)).toBeInTheDocument();
    expect(screen.getByText(/Mostly because you're drained/)).toBeInTheDocument();
    expect(screen.getByText(/Wide uncertainty/)).toBeInTheDocument();
    expect(screen.getByText(/deep-work tasks are deferred/)).toBeInTheDocument();
  });

  it('shows a placeholder before the first reading', () => {
    render(<ScorePanel apiData={null} loading />);
    expect(screen.getByText(/no reading yet/)).toBeInTheDocument();
    expect(screen.getByText('Updating')).toBeInTheDocument();
  });
});
