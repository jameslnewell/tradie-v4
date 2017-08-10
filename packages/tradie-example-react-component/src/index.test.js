import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import Component from './';

describe('Component', () => {
  describe('render()', () => {
    it('should render', () => {
      const renderer = ReactTestRenderer.create(<Component />);
      expect(renderer.toJSON()).toMatchSnapshot();
    });
  });
});
