import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Dummy from './Dummy';

describe('Component: Dummy', () => {
  it('should render with dummy text', () => {
    render(<Dummy />);
    expect(screen.getByText('dummy')).toBeInTheDocument();
  });
});
