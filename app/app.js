import React from 'react';
import {render} from 'react-dom';
import {AppContainer} from 'react-hot-loader';
import Main from './script/Main';

const Render = (Component) => {
  render(
    <AppContainer>
      <Component />
    </AppContainer>,
    document.getElementById('root')
  );
};

Render(Main);
// 模块热替换的 API
if (module.hot) {
  module.hot.accept('./script/Main', () => {
    Render(Main);
  });
}
