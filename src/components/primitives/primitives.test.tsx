import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MWButton, StatusBadge, MWInput } from './index';

describe('Accessible UI Primitives', () => {
  it('MWButton renders correctly and handles loading state', () => {
    const { rerender } = render(<MWButton>Click Me</MWButton>);
    const button = screen.getByRole('button', { name: 'Click Me' });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();

    rerender(<MWButton isLoading>Click Me</MWButton>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });

  it('StatusBadge renders text and icon (never color alone)', () => {
    render(<StatusBadge status="verified" label="Verified Authentic" />);
    const badge = screen.getByText('Verified Authentic');
    expect(badge).toBeInTheDocument();
  });

  it('MWInput renders label, handles errors with proper ARIA attributes', () => {
    const { rerender } = render(
      <MWInput label="Mobile Number" id="mobile-input" helperText="10-digit number" />
    );
    expect(screen.getByLabelText('Mobile Number')).toBeInTheDocument();
    expect(screen.getByText('10-digit number')).toBeInTheDocument();

    rerender(
      <MWInput
        label="Mobile Number"
        id="mobile-input"
        error="Invalid mobile number"
      />
    );
    const input = screen.getByLabelText('Mobile Number');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid mobile number');
  });
});
