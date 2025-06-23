import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Index from './_index';

describe('Home Page', () => {
  it('renders welcome message', () => {
    render(<Index />);

    // Test that your main heading appears
    expect(screen.getByText('Welcome to React Router 7')).toBeInTheDocument();
    expect(screen.getByText(/Tailwind CSS is working/i)).toBeInTheDocument();
  });

  it('shows feature cards', () => {
    render(<Index />);

    expect(screen.getByText('Routing Works')).toBeInTheDocument();
    expect(screen.getByText('Tailwind Works')).toBeInTheDocument();
    expect(screen.getByText('Ready to Go')).toBeInTheDocument();
  });
});
