import * as React from 'react';
import {shallow} from 'enzyme';
import Foo from '.';

describe('Foo', () => {
  it.skip('should render "Hello World!"', () => {
    const element = shallow(<Foo />);
    expect(element.text()).toEqual('Hello World!');
  });
});
